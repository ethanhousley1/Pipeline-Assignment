"""
Load shop.db (SQLite) into Postgres (e.g. Supabase) matching web/lib/db/schema.ts domain tables.

Usage:
  pip install -r scripts/requirements-etl.txt
  set DATABASE_URL=postgresql://...   # Session or direct URI from Supabase (sslmode=require in URL if needed)
  python scripts/import_sqlite_to_pg.py

Optional:
  python scripts/import_sqlite_to_pg.py --sqlite path/to/shop.db
  python scripts/import_sqlite_to_pg.py --clear   # TRUNCATE shop tables first (destructive)

Does not touch Better Auth tables (user, session, account, verification).
Skips order_predictions (fill via your scoring pipeline).
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

import psycopg

REPO_ROOT = Path(__file__).resolve().parent.parent


def _load_web_env() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(REPO_ROOT / "web" / ".env")
DEFAULT_SQLITE = REPO_ROOT / "shop.db"


def split_name(full_name: str) -> tuple[str, str]:
    full_name = (full_name or "").strip()
    if not full_name:
        return ("Unknown", "")
    parts = full_name.split(None, 1)
    first = parts[0]
    last = parts[1] if len(parts) > 1 else ""
    return (first, last)


def main() -> None:
    parser = argparse.ArgumentParser(description="ETL shop.db into Postgres")
    parser.add_argument(
        "--sqlite",
        type=Path,
        default=DEFAULT_SQLITE,
        help=f"path to SQLite file (default: {DEFAULT_SQLITE})",
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="truncate domain tables before load (keeps auth tables)",
    )
    args = parser.parse_args()

    _load_web_env()

    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("ERROR: Set DATABASE_URL to your Supabase Postgres connection string.", file=sys.stderr)
        sys.exit(1)

    if not args.sqlite.is_file():
        print(f"ERROR: SQLite file not found: {args.sqlite}", file=sys.stderr)
        sys.exit(1)

    sq = sqlite3.connect(args.sqlite)
    sq.row_factory = sqlite3.Row

    # Pre-aggregate from SQLite
    num_items_by_order: dict[int, int] = {}
    for (oid, cnt) in sq.execute(
        "SELECT order_id, COUNT(*) FROM order_items GROUP BY order_id"
    ):
        num_items_by_order[int(oid)] = int(cnt)

    late_by_order: dict[int, int] = {}
    for row in sq.execute(
        "SELECT order_id, late_delivery FROM shipments"
    ):
        late_by_order[int(row["order_id"])] = int(row["late_delivery"])

    with psycopg.connect(database_url) as pg:
        if args.clear:
            pg.execute(
                """
                TRUNCATE TABLE
                  order_predictions,
                  order_items,
                  shipments,
                  orders,
                  products,
                  customers
                RESTART IDENTITY CASCADE;
                """
            )
            print("Truncated domain tables.")

        # --- customers ---
        cust_rows = []
        for r in sq.execute("SELECT * FROM customers ORDER BY customer_id"):
            fn, ln = split_name(r["full_name"])
            cust_rows.append(
                (
                    int(r["customer_id"]),
                    fn,
                    ln,
                    r["email"],
                    r["birthdate"] or None,
                    r["gender"] or None,
                )
            )
        with pg.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO customers (customer_id, first_name, last_name, email, birthdate, gender)
                VALUES (%s, %s, %s, %s, %s::timestamp, %s)
                """,
                cust_rows,
            )
        print(f"customers: {len(cust_rows)}")

        # --- products ---
        prod_rows = []
        for r in sq.execute("SELECT * FROM products ORDER BY product_id"):
            prod_rows.append(
                (
                    int(r["product_id"]),
                    r["product_name"],
                    float(r["price"]),
                    None,  # weight not in SQLite
                )
            )
        with pg.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO products (product_id, product_name, price, weight)
                VALUES (%s, %s, %s, %s)
                """,
                prod_rows,
            )
        print(f"products: {len(prod_rows)}")

        # --- orders ---
        order_rows = []
        for r in sq.execute("SELECT * FROM orders ORDER BY order_id"):
            oid = int(r["order_id"])
            order_rows.append(
                (
                    oid,
                    int(r["customer_id"]),
                    r["order_datetime"],
                    0,  # fulfilled
                    num_items_by_order.get(oid),
                    float(r["order_total"]),
                    None,  # avg_weight — no product weights in SQLite
                    late_by_order.get(oid),
                    int(r["is_fraud"]),
                )
            )
        with pg.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO orders (
                  order_id, customer_id, order_timestamp, fulfilled,
                  num_items, total_value, avg_weight, late_delivery, is_fraud
                )
                VALUES (%s, %s, %s::timestamp, %s, %s, %s, %s, %s, %s)
                """,
                order_rows,
            )
        print(f"orders: {len(order_rows)}")

        # --- order_items ---
        oi_rows = []
        for r in sq.execute("SELECT * FROM order_items ORDER BY order_item_id"):
            oi_rows.append(
                (
                    int(r["order_id"]),
                    int(r["product_id"]),
                    int(r["quantity"]),
                    float(r["unit_price"]),
                    float(r["line_total"]),
                )
            )
        with pg.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
                VALUES (%s, %s, %s, %s, %s)
                """,
                oi_rows,
            )
        print(f"order_items: {len(oi_rows)}")

        # --- shipments ---
        ship_rows = []
        for r in sq.execute("SELECT * FROM shipments ORDER BY shipment_id"):
            ship_rows.append(
                (
                    int(r["shipment_id"]),
                    int(r["order_id"]),
                    r["carrier"],
                    r["shipping_method"],
                    r["distance_band"],
                    float(r["promised_days"]),
                    float(r["actual_days"]),
                    int(r["late_delivery"]),
                )
            )
        with pg.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO shipments (
                  shipment_id, order_id, carrier, shipping_method, distance_band,
                  promised_days, actual_days, late_delivery
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                ship_rows,
            )
        print(f"shipments: {len(ship_rows)}")

        # Sequences (explicit IDs leave serial counters stale)
        for table, col in [
            ("customers", "customer_id"),
            ("products", "product_id"),
            ("orders", "order_id"),
            ("order_items", "id"),
            ("shipments", "shipment_id"),
        ]:
            pg.execute(
                f"""
                SELECT setval(
                  pg_get_serial_sequence('{table}', '{col}'),
                  COALESCE((SELECT MAX({col}) FROM {table}), 1)
                );
                """
            )

        pg.commit()

    sq.close()
    print("Done.")


if __name__ == "__main__":
    main()
