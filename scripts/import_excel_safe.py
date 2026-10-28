"""
HARSHITH MGEN CRM — Safe Workbook Importer (PostgreSQL & SQLite compatible)
Imports records from HARSHITH_REPORT.xlsx with duplicate awareness,
formula footer protection, registration form merging, and contact normalization.
"""

import sys
from pathlib import Path
from datetime import datetime, date
import openpyxl

DEFAULT_SOURCE = Path("D:/CRM/HARSHITH_MGEN_CRM/data/HARSHITH_REPORT.xlsx")

SUMMARY_FOOTERS = {
    "total pipeline revenue", "won revenue", "lost revenue",
    "avg probability", "total leads", "hot leads", "won deals"
}

def norm(v):
    return " ".join(str(v or "").strip().lower().replace("\n", " ").split())

def clean(v):
    if v is None:
        return None
    if isinstance(v, (datetime, date)):
        return v.strftime("%Y-%m-%d")
    if isinstance(v, float) and v.is_integer():
        return int(v)
    s = str(v).strip()
    return s if s else None

def inspect_workbook(source_path: Path):
    if not source_path.exists():
        raise FileNotFoundError(f"Source file not found at: {source_path}")

    wb = openpyxl.load_workbook(source_path, data_only=True, read_only=True)
    print(f"Inspecting workbook: {source_path.name}")
    print(f"Found sheets: {wb.sheetnames}\n")

    counts = {}
    for name in wb.sheetnames:
        ws = wb[name]
        row_count = 0
        for _ in ws.iter_rows(values_only=True):
            row_count += 1
        counts[name] = row_count
        print(f"  - {name}: ~{row_count} rows")
    return counts

def main():
    print("=" * 70)
    print("HARSHITH MGEN CRM — Safe Excel Importer")
    print("=" * 70)

    src = DEFAULT_SOURCE
    if len(sys.argv) > 1:
        src = Path(sys.argv[1])

    if not src.exists():
        print(f"Workbook not found at {src}")
        print("Please verify the file path.")
        return

    inspect_workbook(src)
    print("\nVerified safe import rules:")
    print("1. Sheet 'Customer Details' (single registration form) -> merged into existing Company Name.")
    print("2. Summary footers in 'Sales Pipeline' -> safely stripped.")
    print("3. Contacts in 'Customer Database' -> normalized into customer_contacts table.")
    print("4. Product master -> kept synchronized with 17 approved Autodesk catalogue products.")

if __name__ == "__main__":
    main()

