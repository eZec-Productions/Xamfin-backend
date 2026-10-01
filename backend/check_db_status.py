import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from sqlalchemy import text

def inspect_db():
    db = SessionLocal()
    try:
        tables = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")).fetchall()
        print("DATABASE TABLES & COUNTS:")
        for t in tables:
            tname = t[0]
            count = db.execute(text(f'SELECT COUNT(*) FROM "{tname}"')).scalar()
            print(f"  - {tname}: {count} rows")
            
        print("\nUSERS:")
        users = db.execute(text("SELECT id, email, name, role, is_active FROM users;")).fetchall()
        for u in users:
            print(f"  User: id={u[0]}, email={u[1]}, name={u[2]}, role={u[3]}, active={u[4]}")
            
    except Exception as e:
        print("Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
