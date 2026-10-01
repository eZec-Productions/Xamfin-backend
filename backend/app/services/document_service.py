import os
import uuid
import re
import zlib
from datetime import datetime
from typing import List, Tuple, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.config import settings
from app.models.document import Document
from app.models.transaction import Transaction

VALID_DOCUMENT_TYPES = [
    "Bank Statement",
    "Invoice Sent",
    "Invoice Received",
    "Receipt",
    "Other"
]

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Robust PDF extractor using pypdf with regex fallback.
    """
    try:
        import io
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages_text.append(t)
        combined = "\n".join(pages_text).strip()
        if combined:
            return combined
    except Exception:
        pass

    text = ""
    # Search for compressed / uncompressed PDF streams
    streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', pdf_bytes, re.DOTALL)
    for s in streams:
        try:
            decomp = zlib.decompress(s).decode('latin1', errors='ignore')
            text += decomp + "\n"
        except Exception:
            text += s.decode('latin1', errors='ignore') + "\n"

    text += pdf_bytes.decode('latin1', errors='ignore')
    lines = []
    for m in re.findall(r'\((.*?)\)\s*T[j*]', text):
        cleaned = m.replace(r'\(', '(').replace(r'\)', ')').strip()
        if cleaned:
            lines.append(cleaned)

    return "\n".join(lines)


def parse_csv_bytes(csv_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Parses real CSV transactions with dynamic column mapping.
    """
    import io
    import csv
    transactions = []
    try:
        content = csv_bytes.decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)
        if not rows:
            return []

        header = [c.strip().lower() for c in rows[0]]
        date_idx = -1
        desc_idx = -1
        amt_idx = -1
        cat_idx = -1
        type_idx = -1

        for i, col in enumerate(header):
            if any(k in col for k in ['date', 'time', 'timestamp']):
                date_idx = i
            elif any(k in col for k in ['desc', 'memo', 'narration', 'payee', 'merchant', 'details']):
                desc_idx = i
            elif any(k in col for k in ['amount', 'total', 'amt', 'value', 'price']):
                amt_idx = i
            elif any(k in col for k in ['cat', 'category']):
                cat_idx = i
            elif any(k in col for k in ['type', 'credit/debit', 'transaction type']):
                type_idx = i

        # Fallback if no named header: assume col 0=date, col 1=desc, col 2=amt
        start_row = 1 if (date_idx != -1 or amt_idx != -1) else 0
        if date_idx == -1: date_idx = 0
        if desc_idx == -1: desc_idx = 1
        if amt_idx == -1: amt_idx = 2

        for row in rows[start_row:]:
            if len(row) <= max(date_idx, desc_idx, amt_idx):
                continue
            date_val = row[date_idx].strip()
            desc_val = row[desc_idx].strip()
            raw_amt = row[amt_idx].strip().replace('$', '').replace(',', '')
            if not raw_amt:
                continue
            try:
                amt = float(raw_amt)
            except ValueError:
                continue

            is_income = amt > 0
            if type_idx != -1 and type_idx < len(row):
                t_val = row[type_idx].strip().lower()
                if 'income' in t_val or 'credit' in t_val or 'deposit' in t_val:
                    is_income = True
                elif 'expense' in t_val or 'debit' in t_val or 'withdrawal' in t_val:
                    is_income = False

            category = row[cat_idx].strip() if (cat_idx != -1 and cat_idx < len(row) and row[cat_idx].strip()) else categorize_transaction(desc_val, is_income)

            transactions.append({
                "date": date_val or datetime.utcnow().strftime("%Y-%m-%d"),
                "description": desc_val or "Transaction",
                "amount": abs(amt),
                "type": "income" if is_income else "expense",
                "category": category,
            })
    except Exception:
        pass
    return transactions


def parse_xlsx_bytes(xlsx_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Parses real Excel (.xlsx) transactions using openpyxl.
    """
    import io
    transactions = []
    try:
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=True)
        sheet = wb.active
        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            return []

        header = [str(c).strip().lower() if c is not None else "" for c in rows[0]]
        date_idx = -1
        desc_idx = -1
        amt_idx = -1
        cat_idx = -1
        type_idx = -1

        for i, col in enumerate(header):
            if any(k in col for k in ['date', 'time']): date_idx = i
            elif any(k in col for k in ['desc', 'memo', 'payee', 'merchant']): desc_idx = i
            elif any(k in col for k in ['amount', 'total', 'amt', 'value']): amt_idx = i
            elif any(k in col for k in ['cat', 'category']): cat_idx = i
            elif any(k in col for k in ['type']): type_idx = i

        start_row = 1 if (date_idx != -1 or amt_idx != -1) else 0
        if date_idx == -1: date_idx = 0
        if desc_idx == -1: desc_idx = 1
        if amt_idx == -1: amt_idx = 2

        for row in rows[start_row:]:
            if len(row) <= max(date_idx, desc_idx, amt_idx):
                continue
            date_val = str(row[date_idx] or '').strip()
            desc_val = str(row[desc_idx] or '').strip()
            raw_amt = str(row[amt_idx] or '').replace('$', '').replace(',', '').strip()
            if not raw_amt:
                continue
            try:
                amt = float(raw_amt)
            except ValueError:
                continue

            is_income = amt > 0
            if type_idx != -1 and type_idx < len(row):
                t_val = str(row[type_idx] or '').lower()
                if 'income' in t_val or 'credit' in t_val or 'deposit' in t_val:
                    is_income = True
                elif 'expense' in t_val or 'debit' in t_val:
                    is_income = False

            category = str(row[cat_idx]).strip() if (cat_idx != -1 and cat_idx < len(row) and row[cat_idx]) else categorize_transaction(desc_val, is_income)

            transactions.append({
                "date": date_val or datetime.utcnow().strftime("%Y-%m-%d"),
                "description": desc_val or "Transaction",
                "amount": abs(amt),
                "type": "income" if is_income else "expense",
                "category": category,
            })
    except Exception:
        pass
    return transactions


def categorize_transaction(description: str, is_income: bool) -> str:
    desc_lower = description.lower()
    if is_income:
        return "Sales Revenue"
    
    if any(k in desc_lower for k in ["rent", "wework", "regus", "lease", "suite", "property"]):
        return "Rent"
    if any(k in desc_lower for k in ["payroll", "gusto", "adp", "salary", "wages", "contractor", "paychex"]):
        return "Payroll"
    if any(k in desc_lower for k in ["aws", "amazon web", "openai", "cloud", "azure", "google cloud", "github", "vercel", "stripe", "saas", "software", "figma", "hubspot", "slack", "zoom", "notion"]):
        return "Software and Tools"
    if any(k in desc_lower for k in ["ad ", "ads", "google ads", "meta", "facebook", "marketing", "campaign", "linkedin"]):
        return "Marketing"
    if any(k in desc_lower for k in ["flight", "airline", "delta", "hotel", "airbnb", "uber", "lyft", "travel", "cab"]):
        return "Travel"
    if any(k in desc_lower for k in ["utility", "electric", "water", "internet", "comcast", "verizon", "att"]):
        return "Utilities"
    if any(k in desc_lower for k in ["restaurant", "cafe", "coffee", "starbucks", "dinner", "doordash", "food"]):
        return "Food and Dining"
    if any(k in desc_lower for k in ["legal", "law", "attorney", "cpa", "accounting", "advisory", "consulting"]):
        return "Professional Services"
    if any(k in desc_lower for k in ["fee", "wire fee", "bank charge", "overdraft"]):
        return "Bank Fees"
    if any(k in desc_lower for k in ["tax", "irs", "treasury", "franchise"]):
        return "Tax"
    
    return "Other"


def parse_transactions_from_text(raw_text: str, doc_type: str, filename: str) -> List[Dict[str, Any]]:
    """
    Parses verified transaction records directly from text without inventing dummy data.
    """
    transactions = []
    lines = raw_text.split("\n")

    # Pattern for dates: MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY
    date_regex = re.compile(r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})')
    # Pattern for dollar amount: e.g. $1,200.00 or -4,200.00 or 24,500.00
    amount_regex = re.compile(r'([+-]?\$?[\d,]+(?:\.\d{2}))')

    # Check for Chase Statement specific items
    if "CHASE" in raw_text.upper() or "STATEMENT" in filename.upper():
        for line in lines:
            line_str = line.strip()
            # Match transaction lines: 08/04/2026 DEPOSIT ... +,500.00
            date_match = date_regex.search(line_str)
            if date_match and any(keyword in line_str.upper() for keyword in ["DEPOSIT", "DEBIT", "CHECK", "FEE", "TRANSFER", "PAYMENT"]):
                # Extract amount
                amounts = amount_regex.findall(line_str)
                if amounts:
                    raw_amt_str = amounts[-1].replace("$", "").replace(",", "")
                    try:
                        amt = abs(float(raw_amt_str))
                    except ValueError:
                        continue

                    # If Chase PDF missing leading digits like ,500.00, normalize cleanly
                    if raw_amt_str.startswith("."):
                        amt = float("0" + raw_amt_str)

                    # Determine income vs expense
                    is_income = "DEPOSIT" in line_str.upper() or "+" in line_str
                    
                    # Clean description
                    desc = line_str
                    desc = date_regex.sub("", desc)
                    desc = desc.replace("DEPOSIT", "").replace("DEBIT", "")
                    desc = amount_regex.sub("", desc)
                    desc = re.sub(r'[\+\-\$]', '', desc).strip()
                    desc = re.sub(r'\s+', ' ', desc)

                    if not desc:
                        desc = "Bank Transaction Item"

                    category = categorize_transaction(desc, is_income)

                    transactions.append({
                        "date": date_match.group(1),
                        "description": desc,
                        "amount": amt,
                        "type": "income" if is_income else "expense",
                        "category": category,
                    })

    # Check for Invoice line items
    elif "INVOICE" in raw_text.upper() or "INVOICE" in filename.upper():
        # Check if sent (income) or received (expense)
        is_income = (doc_type == "Invoice Sent") or ("ISSUED BY" in raw_text.upper())
        inv_date = datetime.utcnow().strftime("%Y-%m-%d")
        d_match = date_regex.search(raw_text)
        if d_match:
            inv_date = d_match.group(1)

        for line in lines:
            line_str = line.strip()
            amounts = amount_regex.findall(line_str)
            if amounts and len(line_str.split()) >= 3:
                # Exclude total / subtotal summaries to avoid double counting
                if any(k in line_str.upper() for k in ["SUBTOTAL", "TOTAL DUE", "TOTAL CHARGES", "TAX", "BALANCE"]):
                    continue

                raw_amt_str = amounts[-1].replace("$", "").replace(",", "")
                try:
                    amt = abs(float(raw_amt_str))
                except ValueError:
                    continue

                desc = amount_regex.sub("", line_str).strip()
                desc = re.sub(r'\s+', ' ', desc)
                if len(desc) > 3:
                    transactions.append({
                        "date": inv_date,
                        "description": desc,
                        "amount": amt,
                        "type": "income" if is_income else "expense",
                        "category": categorize_transaction(desc, is_income),
                    })

    # Generic Fallback: parse lines having dates and currency values
    if not transactions:
        for line in lines:
            line_str = line.strip()
            date_match = date_regex.search(line_str)
            amounts = amount_regex.findall(line_str)
            if date_match and amounts:
                raw_amt_str = amounts[-1].replace("$", "").replace(",", "")
                try:
                    amt = abs(float(raw_amt_str))
                except ValueError:
                    continue

                is_income = "+" in line_str or (doc_type == "Invoice Sent")
                desc = date_regex.sub("", line_str)
                desc = amount_regex.sub("", desc).strip()
                desc = re.sub(r'\s+', ' ', desc)

                if desc:
                    transactions.append({
                        "date": date_match.group(1),
                        "description": desc,
                        "amount": amt,
                        "type": "income" if is_income else "expense",
                        "category": categorize_transaction(desc, is_income),
                    })

    return transactions


async def process_and_store_document(
    file: UploadFile,
    doc_type: str,
    user_id: str,
    db: Session
) -> Tuple[Document, int]:
    if doc_type not in VALID_DOCUMENT_TYPES:
        doc_type = "Other"

    # Save physical file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    file_bytes = await file.read()
    file_size_kb = len(file_bytes) / 1024
    size_str = f"{file_size_kb:.1f} KB" if file_size_kb < 1024 else f"{file_size_kb/1024:.1f} MB"

    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    upload_date = datetime.utcnow().strftime("%Y-%m-%d")

    # Extract genuine transactions from file based on extension
    parsed_items: List[Dict[str, Any]] = []
    if file_ext.lower() == ".csv":
        parsed_items = parse_csv_bytes(file_bytes, file.filename)
    elif file_ext.lower() in [".xlsx", ".xls"]:
        parsed_items = parse_xlsx_bytes(file_bytes, file.filename)
    elif file_ext.lower() == ".pdf":
        extracted_text = extract_text_from_pdf_bytes(file_bytes)
        parsed_items = parse_transactions_from_text(extracted_text, doc_type, file.filename)
    else:
        try:
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = file_bytes.decode("latin1", errors="ignore")
        parsed_items = parse_transactions_from_text(extracted_text, doc_type, file.filename)


    # 4. Save extracted transactions
    extracted_transactions: List[Transaction] = []
    for item in parsed_items:
        extracted_transactions.append(Transaction(
            id=f"tx_{uuid.uuid4().hex[:10]}",
            user_id=user_id,
            document_id=doc_id,
            date=item["date"],
            description=item["description"],
            category=item["category"],
            amount=float(item["amount"]),
            type=item["type"],
            source_document=file.filename
        ))

    # 5. Create document record
    doc_record = Document(
        id=doc_id,
        user_id=user_id,
        name=file.filename,
        type=doc_type,
        size=size_str,
        date=upload_date,
        status="Completed" if len(extracted_transactions) > 0 else "Processing",
        file_path=saved_path,
        transaction_count=len(extracted_transactions)
    )

    db.add(doc_record)
    for tx in extracted_transactions:
        db.add(tx)
    db.commit()
    db.refresh(doc_record)

    return doc_record, len(extracted_transactions)
