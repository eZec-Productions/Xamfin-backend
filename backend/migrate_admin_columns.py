import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__)))

from sqlalchemy import text
from app.database import engine
from seed import seed

def migrate_and_seed():
    print("[*] Running migration for admin columns...")
    with engine.connect() as conn:
        # Users table columns
        queries = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'client';",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS internal_notes TEXT;",
            "ALTER TABLE reports ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING';",
            "ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;",
            "ALTER TABLE reports ADD COLUMN IF NOT EXISTS ai_draft JSONB;",
        ]
        for q in queries:
            try:
                conn.execute(text(q))
                conn.commit()
                print(f"[+] Executed: {q}")
            except Exception as ex:
                print(f"[-] Note on query {q}: {ex}")

    print("[*] Migration completed. Now running seed...")
    seed()

if __name__ == "__main__":
    migrate_and_seed()
