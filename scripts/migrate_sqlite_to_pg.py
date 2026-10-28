"""
HARSHITH MGEN CRM — SQLite to PostgreSQL Migration Engine
Safely migrates data from the desktop SQLite database (crm_data.sqlite3)
to PostgreSQL or generates verified PostgreSQL transactional SQL DDL/DML.

Key features:
1. Preserves table dependency order (parent customer -> child customer_contacts).
2. Sanitizes empty strings to NULL for unique constraints (Invoice Number, Transaction Reference).
3. Strips invalid footer/summary rows from Sales Pipeline.
4. Handles PostgreSQL double-quoted column identifiers with spaces (e.g., "Customer Code").
5. Resets PostgreSQL SERIAL sequences after import.
"""

import os
import sys
import sqlite3
from pathlib import Path
from datetime import datetime

DEFAULT_SQLITE_PATH = Path.home() / "OfflineDesktopCRM" / "crm_data.sqlite3"
FALLBACK_SQLITE_PATH = Path("D:/CRM/HARSHITH_MGEN_CRM/crm_data.sqlite3")

TABLES_IN_ORDER = [
    "admin",
    "records_product_master",
    "records_customers",
    "customer_contacts",
    "records_sales_pipeline",
    "records_support",
    "records_training",
    "records_demo",
    "records_services",
    "records_learning",
    "records_seat_tracker",
    "records_revenue_tracker",
    "records_events",
    "records_webinars",
    "records_tour_management",
    "records_tour_expenses",
    "records_tour_report",
    "records_employee_performance",
    "audit_log",
]

SUMMARY_FILTER_VALUES = {
    "total pipeline revenue",
    "won revenue",
    "lost revenue",
    "avg probability",
    "total leads",
    "hot leads",
    "won deals",
}


def safe_exists(p: Path) -> bool:
    try:
        return p.exists()
    except (PermissionError, OSError):
        return False

def sanitize_value(val, col_name, table_name):
    if val is None:
        return None
    if isinstance(val, str):
        val = val.strip()
        if val == "":
            # For unique columns in revenue tracker or empty values, map empty string to NULL
            if table_name == "records_revenue_tracker" and col_name in ("Invoice Number", "Transaction Reference"):
                return None
            return None
    return val


def generate_pg_sql(sqlite_path: Path, output_sql_path: Path):
    if not sqlite_path.exists():
        raise FileNotFoundError(f"Source SQLite database not found at {sqlite_path}")

    con = sqlite3.connect(sqlite_path)
    con.row_factory = sqlite3.Row

    report = {}
    sql_lines = [
        "-- HARSHITH MGEN CRM: SQLite to PostgreSQL Migration Dump",
        f"-- Generated at: {datetime.now().isoformat(timespec='seconds')}",
        "-- Safe transactional execution with foreign key enforcement",
        "BEGIN;\n",
    ]

    for table in TABLES_IN_ORDER:
        # Check if table exists in SQLite
        exists = con.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone()
        if not exists:
            report[table] = {"found": False, "count": 0}
            continue

        cols_info = con.execute(f'PRAGMA table_info("{table}")').fetchall()
        col_names = [r["name"] for r in cols_info]

        rows = con.execute(f'SELECT * FROM "{table}" ORDER BY id ASC').fetchall()
        inserted_count = 0

        sql_lines.append(f"-- Table: {table}")
        for r in rows:
            row_dict = dict(r)

            # Filter known accidental Excel footer summary rows in Sales Pipeline
            if table == "records_sales_pipeline":
                customer_val = str(row_dict.get("Customer") or "").strip().lower()
                if customer_val in SUMMARY_FILTER_VALUES:
                    continue

            # Filter completely empty customer company names
            if table == "records_customers":
                company_val = str(row_dict.get("Company Name") or "").strip()
                if not company_val:
                    continue

            cols_quoted = [f'"{c}"' for c in col_names]
            val_strs = []
            for c in col_names:
                v = sanitize_value(row_dict.get(c), c, table)
                if v is None:
                    val_strs.append("NULL")
                elif isinstance(v, (int, float)):
                    val_strs.append(str(v))
                else:
                    # Escape single quotes for SQL
                    clean_str = str(v).replace("'", "''")
                    val_strs.append(f"'{clean_str}'")

            sql_lines.append(
                f'INSERT INTO "{table}" ({", ".join(cols_quoted)}) VALUES ({", ".join(val_strs)}) '
                f'ON CONFLICT (id) DO NOTHING;'
            )
            inserted_count += 1

        # Sequence reset statement for PostgreSQL
        sql_lines.append(
            f"SELECT setval(pg_get_serial_sequence('\"{table}\"', 'id'), COALESCE(MAX(id), 1)) FROM \"{table}\";\n"
        )
        report[table] = {"found": True, "count": inserted_count}

    sql_lines.append("COMMIT;\n")

    output_sql_path.write_text("\n".join(sql_lines), encoding="utf-8")
    return report


def main():
    print("=" * 70)
    print("HARSHITH MGEN CRM — SQLite to PostgreSQL Migration Utility")
    print("=" * 70)

    sqlite_path = DEFAULT_SQLITE_PATH
    if not safe_exists(sqlite_path) and safe_exists(FALLBACK_SQLITE_PATH):
        sqlite_path = FALLBACK_SQLITE_PATH

    print(f"Checking SQLite source: {sqlite_path}")
    output_sql = Path(__file__).resolve().parent / "postgres_migration_dump.sql"

    if not safe_exists(sqlite_path):
        print(f"Notice: SQLite file {sqlite_path} does not exist yet.")
        print("To migrate an existing SQLite database, place crm_data.sqlite3 at:")
        print(f"  {DEFAULT_SQLITE_PATH}")
        print("or provide path via: python migrate_sqlite_to_pg.py <path_to_sqlite>")
        if len(sys.argv) > 1 and Path(sys.argv[1]).exists():
            sqlite_path = Path(sys.argv[1])
        else:
            print("Creating empty sample verification dump...")
            output_sql.write_text(
                "-- HARSHITH MGEN CRM PostgreSQL Migration Ready\n-- Run when crm_data.sqlite3 is available.\n",
                encoding="utf-8"
            )
            return

    try:
        report = generate_pg_sql(sqlite_path, output_sql)
        print(f"\nMigration SQL dump successfully created: {output_sql}")
        print("\nRecords exported by table:")
        for t, stat in report.items():
            if stat["found"]:
                print(f"  - {t}: {stat['count']} records")
        print("\nTo apply to PostgreSQL:")
        print("  psql -d $DATABASE_URL -f scripts/postgres_migration_dump.sql")
    except Exception as exc:
        print(f"Error during migration export: {exc}")


if __name__ == "__main__":
    main()
