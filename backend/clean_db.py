import sys
import os
import glob
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from sqlalchemy import text

def clean_database():
    db = SessionLocal()
    try:
        print("[*] Starting Production Database Cleanup...")
        
        # 1. Delete Chat messages and conversations
        msg_count = db.execute(text("DELETE FROM chat_messages;")).rowcount
        conv_count = db.execute(text("DELETE FROM chat_conversations;")).rowcount
        print(f"[+] Cleared {msg_count} chat messages and {conv_count} chat conversations.")

        # 2. Delete Transactions
        tx_count = db.execute(text("DELETE FROM transactions;")).rowcount
        print(f"[+] Cleared {tx_count} demo transactions.")

        # 3. Delete Reports
        rep_count = db.execute(text("DELETE FROM reports;")).rowcount
        print(f"[+] Cleared {rep_count} demo reports.")

        # 4. Delete Documents
        doc_count = db.execute(text("DELETE FROM documents;")).rowcount
        print(f"[+] Cleared {doc_count} demo documents.")

        # 5. Delete Dummy Users (Meridian, Brody)
        dummy_users = db.execute(text("""
            DELETE FROM users 
            WHERE email IN ('darlene@meridiangroup.com', 'marcus@brodyenterprises.io');
        """)).rowcount
        print(f"[+] Removed {dummy_users} dummy client accounts (Meridian, Brody).")

        db.commit()
        print("[+] Database tables successfully purged!")

        # 6. Delete uploaded PDF files in backend/uploads
        upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
        if os.path.exists(upload_dir):
            files = glob.glob(os.path.join(upload_dir, "*.*"))
            for f in files:
                try:
                    os.remove(f)
                except Exception as ex:
                    print(f"  [-] Could not delete {f}: {ex}")
            print(f"[+] Removed {len(files)} uploaded files from backend/uploads.")

        # Print current remaining state
        print("\n--- REMAINING PRODUCTION DATA ---")
        users = db.execute(text("SELECT id, email, name, role, is_active FROM users;")).fetchall()
        print("Users:")
        for u in users:
            print(f"  - {u[1]} ({u[2]}) | Role: {u[3]} | Active: {u[4]}")
            
        plans = db.execute(text("SELECT id, name, price, billing_period FROM subscription_plans;")).fetchall()
        print("\nActive Plans:")
        for p in plans:
            print(f"  - {p[1]}: ${p[2]}/{p[3]}")

        # Summary of core tables
        for table in ["transactions", "documents", "reports", "chat_conversations", "chat_messages"]:
            cnt = db.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
            print(f"Table '{table}': {cnt} records")

    except Exception as e:
        db.rollback()
        print("[-] Error during cleanup:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()
