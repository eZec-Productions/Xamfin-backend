import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import User, Document, Transaction, Report, ChatConversation, ChatMessage
from app.services.auth_service import get_password_hash

def seed():
    print("[*] Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check or create Admin user
        admin_user = db.query(User).filter(User.email == "admin@finlytics.ai").first()
        if not admin_user:
            print("[*] Creating Admin user...")
            admin_user = User(
                id="usr_admin_hq",
                email="admin@finlytics.ai",
                name="Finlytics Advisory Team",
                company_name="Finlytics HQ",
                hashed_password=get_password_hash("AdminSecret2026!"),
                is_first_time_login=False,
                is_active=True,
                role="admin",
                account_status="active",
                industry="Financial Technology & AI",
                fiscal_start_month="January",
                currency="USD ($)",
                current_plan="Finlytics Advisory Operations",
                plan_price="$0/mo",
                renewal_date="Lifetime",
            )
            db.add(admin_user)
            db.commit()
            print("[+] Admin user created: admin@finlytics.ai / AdminSecret2026!")
        else:
            admin_user.role = "admin"
            db.commit()

        # Check or create Mushaf Khan
        mushaf = db.query(User).filter(User.email == "muhammadmushafkhan973@gmail.com").first()
        if not mushaf:
            print("[*] Creating client: Muhammad Mushaf Khan...")
            mushaf = User(
                id="usr_mushaf_973",
                email="muhammadmushafkhan973@gmail.com",
                name="Muhammad Mushaf Khan",
                company_name="Finlytics Technologies",
                hashed_password=get_password_hash("Password123!"),
                is_first_time_login=False,
                is_active=True,
                role="client",
                account_status="active",
                industry="Technology & Artificial Intelligence",
                fiscal_start_month="January",
                currency="USD ($)",
                current_plan="Finlytics Pro Plan",
                plan_price="$299/mo",
                renewal_date="Oct 15, 2026",
            )
            db.add(mushaf)
            db.commit()

        # Check Meridian Group
        user1 = db.query(User).filter(User.email == "darlene@meridiangroup.com").first()
        if not user1:
            print("[*] Seeding Meridian Digital Group...")
            user1 = User(
                id="usr_meridian_01",
                email="darlene@meridiangroup.com",
                name="Darlene Roberts",
                company_name="Meridian Digital Group",
                hashed_password=get_password_hash("Password123!"),
                is_first_time_login=False,
                is_active=True,
                role="client",
                account_status="active",
                industry="Digital Marketing & Performance Tech",
                fiscal_start_month="January",
                currency="USD ($)",
                current_plan="Finlytics Pro Plan",
                plan_price="$299/mo",
                renewal_date="Oct 1, 2026",
            )
            db.add(user1)
            db.commit()

        # Check Brody Logistics
        user2 = db.query(User).filter(User.email == "marcus@brodyenterprises.io").first()
        if not user2:
            print("[*] Seeding Brody Logistics...")
            user2 = User(
                id="usr_brody_02",
                email="marcus@brodyenterprises.io",
                name="Marcus Brody",
                company_name="Brody Logistics & Supply Co.",
                hashed_password=get_password_hash("TempPass123!"),
                is_first_time_login=True,
                is_active=True,
                role="client",
                account_status="active",
                industry="Freight & 3PL Logistics",
                fiscal_start_month="April",
                currency="USD ($)",
                current_plan="Finlytics Enterprise Plan",
                plan_price="$699/mo",
                renewal_date="Nov 15, 2026",
            )
            db.add(user2)
            db.commit()

        # Seed Documents if needed
        existing_doc = db.query(Document).filter(Document.user_id == user1.id).first()
        if not existing_doc:
            doc1 = Document(
                id="doc_aug_statement_01",
                user_id=user1.id,
                name="Chase_Business_Checking_Aug2026.pdf",
                type="Bank Statement",
                size="2.4 MB",
                date="2026-08-31",
                status="Completed",
                transaction_count=6,
            )
            db.add(doc1)

            txs = [
                Transaction(
                    id="tx_01",
                    user_id=user1.id,
                    document_id=doc1.id,
                    date="2026-08-28",
                    description="Apex Global Retainer - August",
                    category="Client Retainer",
                    amount=24500.0,
                    type="income",
                    source_document=doc1.name,
                ),
                Transaction(
                    id="tx_02",
                    user_id=user1.id,
                    document_id=doc1.id,
                    date="2026-08-25",
                    description="Amazon Web Services EMEA",
                    category="Cloud Infrastructure",
                    amount=4250.0,
                    type="expense",
                    source_document=doc1.name,
                ),
                Transaction(
                    id="tx_03",
                    user_id=user1.id,
                    document_id=doc1.id,
                    date="2026-08-20",
                    description="Gusto Payroll Direct Deposit",
                    category="Payroll & Salaries",
                    amount=38500.0,
                    type="expense",
                    source_document=doc1.name,
                ),
            ]
            for t in txs:
                db.add(t)
            db.commit()

        # Seed Reports with proper status & ai_draft
        rep_approved = db.query(Report).filter(Report.id == "rep_aug_2026_meridian").first()
        if not rep_approved:
            print("[*] Seeding Approved August Report...")
            rep_approved = Report(
                id="rep_aug_2026_meridian",
                user_id=user1.id,
                month="August",
                year="2026",
                date_generated="2026-09-01",
                status="APPROVED",
                is_approved=True,
                approved_by="Finlytics Chief Advisor",
                reviewer_notes="Approved with slight margin rounding adjustment.",
                summary_metrics={
                    "revenue": {"value": "$124,500", "change": "+14.8%"},
                    "expenses": {"value": "$78,200", "change": "-3.2%"},
                    "net_profit": {"value": "$46,300", "change": "+28.4%"},
                    "cash_flow": {"value": "+$182,400", "change": "Healthy operating margin"},
                    "health_score": 88,
                },
                pl_statement={
                    "revenueStreams": [
                        {"name": "Performance Marketing Retainers", "amount": 84500},
                        {"name": "Creative & Branding Deliverables", "amount": 26000},
                        {"name": "Tech Infrastructure Consulting", "amount": 14000},
                    ],
                    "expenseCategories": [
                        {"name": "Payroll & Engineering Salaries", "amount": 42000},
                        {"name": "Cloud & Infrastructure", "amount": 12500},
                        {"name": "Office & Workspace", "amount": 8200},
                        {"name": "Software & SaaS Subscriptions", "amount": 7500},
                        {"name": "Legal, Accounting & Admin", "amount": 8000},
                    ],
                },
                cash_flow={
                    "moneyIn": 124500,
                    "moneyOut": 78200,
                    "netChange": 46300,
                    "endingCashBalance": 182400,
                },
                growth_analysis="August was a solid growth month for Meridian Digital Group. Total revenue grew by 14.8% driven by retainer expansions. Gross margins improved to 37.2% as cloud optimization reduced cost per account.",
                action_plan=[
                    {
                        "id": "act_1",
                        "title": "Review Unused SaaS Tool Seats",
                        "description": "Found 8 dormant Figma and HubSpot user licenses that can be downgraded.",
                        "impact": "Save ~$480/month",
                        "status": "pending",
                    },
                    {
                        "id": "act_2",
                        "title": "Follow Up on Overdue Apex Invoices",
                        "description": "Invoice #1042 ($8,500) has reached 14 days overdue.",
                        "impact": "Accelerate $8,500 cash in-flow",
                        "status": "pending",
                    },
                    {
                        "id": "act_3",
                        "title": "Set Aside Q3 Tax Reserve",
                        "description": "Allocate $11,500 into your designated tax escrow account before Sept 15.",
                        "impact": "Avoid Q3 IRS late penalties",
                        "status": "pending",
                    },
                ],
            )
            db.add(rep_approved)
            db.commit()

        # Seed PENDING report for Review Queue
        rep_pending = db.query(Report).filter(Report.id == "rep_sep_2026_pending").first()
        if not rep_pending:
            print("[*] Seeding Pending September Report for Review Queue...")
            ai_draft = {
                "summary_metrics": {
                    "revenue": {"value": "$138,200", "change": "+11.0% vs August"},
                    "expenses": {"value": "$81,400", "change": "+4.1% vs August"},
                    "net_profit": {"value": "$56,800", "change": "+22.7% vs August"},
                    "cash_flow": {"value": "+$215,800", "change": "Strong operating buffer"},
                    "health_score": 91,
                },
                "pl_statement": {
                    "revenueStreams": [
                        {"name": "Client Retainers", "amount": 92000},
                        {"name": "Consulting & Growth Advisory", "amount": 31200},
                        {"name": "Software License Reselling", "amount": 15000},
                    ],
                    "expenseCategories": [
                        {"name": "Payroll & Contractor Compensation", "amount": 44500},
                        {"name": "Cloud Infrastructure (AWS/Google)", "amount": 13200},
                        {"name": "Marketing Acquisition Campaigns", "amount": 9500},
                        {"name": "SaaS Platform Subscriptions", "amount": 8200},
                        {"name": "Office & Facility Leases", "amount": 6000},
                    ],
                },
                "cash_flow": {
                    "moneyIn": 138200,
                    "moneyOut": 81400,
                    "netChange": 56800,
                    "endingCashBalance": 215800,
                },
                "growth_analysis": "September demonstrates strong client retention across core tech marketing engagements. Net margin accelerated to 41.1%. Runway expanded to 6.2 months at current burn rate.",
                "action_plan": [
                    {
                        "id": "act_s1",
                        "title": "Migrate AWS Dev Instances to Savings Plan",
                        "description": "Locking in 1-year compute savings plan will save ~$1,100 monthly.",
                        "impact": "High Savings",
                        "status": "pending",
                    },
                    {
                        "id": "act_s2",
                        "title": "Renegotiate HubSpot Tier",
                        "description": "Current contact count is 40% below tier limit; downgrade plan.",
                        "impact": "Save $320/mo",
                        "status": "pending",
                    },
                    {
                        "id": "act_s3",
                        "title": "Establish High-Yield Treasury Account",
                        "description": "Place $100,000 cash reserves in 5.2% treasury yield fund.",
                        "impact": "+$430/mo passive yield",
                        "status": "pending",
                    },
                ],
            }

            rep_pending = Report(
                id="rep_sep_2026_pending",
                user_id=user1.id,
                month="September",
                year="2026",
                date_generated="2026-09-14",
                status="PENDING",
                is_approved=False,
                approved_by="AI Report Engine (Awaiting Sign-off)",
                reviewer_notes=None,
                ai_draft=ai_draft,
                summary_metrics=ai_draft["summary_metrics"],
                pl_statement=ai_draft["pl_statement"],
                cash_flow=ai_draft["cash_flow"],
                growth_analysis=ai_draft["growth_analysis"],
                action_plan=ai_draft["action_plan"],
            )
            db.add(rep_pending)
            db.commit()

        # Seed HELD report for Brody Logistics
        rep_held = db.query(Report).filter(Report.id == "rep_brody_held_01").first()
        if not rep_held:
            print("[*] Seeding HELD Report for Brody Logistics...")
            held_draft = {
                "summary_metrics": {
                    "revenue": {"value": "$210,000", "change": "+5.5%"},
                    "expenses": {"value": "$185,000", "change": "+18.2%"},
                    "net_profit": {"value": "$25,000", "change": "-38.0%"},
                    "cash_flow": {"value": "+$42,000", "change": "Tighter operating runway"},
                    "health_score": 68,
                },
                "pl_statement": {
                    "revenueStreams": [
                        {"name": "Freight Logistics Services", "amount": 175000},
                        {"name": "Warehousing & Storage", "amount": 35000},
                    ],
                    "expenseCategories": [
                        {"name": "Fuel & Fleet Maintenance", "amount": 92000},
                        {"name": "Driver Salaries", "amount": 68000},
                        {"name": "Insurance & Compliance", "amount": 25000},
                    ],
                },
                "cash_flow": {
                    "moneyIn": 210000,
                    "moneyOut": 185000,
                    "netChange": 25000,
                    "endingCashBalance": 42000,
                },
                "growth_analysis": "Brody Logistics experienced margin pressure due to increased fuel surcharges. Operating expenses rose 18.2%, causing net margin compression to 11.9%.",
                "action_plan": [
                    {
                        "id": "act_b1",
                        "title": "Audit Fleet Fuel Card Surcharges",
                        "description": "Discrepancy identified in Midwest regional fuel surcharges.",
                        "impact": "Cost Recovery",
                        "status": "pending",
                    },
                ],
            }

            rep_held = Report(
                id="rep_brody_held_01",
                user_id=user2.id,
                month="August",
                year="2026",
                date_generated="2026-09-02",
                status="HELD",
                is_approved=False,
                approved_by="Pending Review",
                reviewer_notes="Placed on hold pending fuel receipt verification from dispatch team.",
                ai_draft=held_draft,
                summary_metrics=held_draft["summary_metrics"],
                pl_statement=held_draft["pl_statement"],
                cash_flow=held_draft["cash_flow"],
                growth_analysis=held_draft["growth_analysis"],
                action_plan=held_draft["action_plan"],
            )
            db.add(rep_held)
            db.commit()

        print("[+] Database successfully seeded with Admin, Clients, and Review Queue reports!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
