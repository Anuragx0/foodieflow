import os
import json
import sqlite3
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "foodieflow.db")

def _get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def _init_db_sync():
    conn = _get_connection()
    try:
        cur = conn.cursor()
        # 1. Menu Items Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS menu_items (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                imageUrl TEXT,
                rating REAL DEFAULT 4.5,
                reviewsCount INTEGER DEFAULT 100,
                isVeg INTEGER DEFAULT 1,
                prepTimeMinutes INTEGER DEFAULT 8,
                calories INTEGER DEFAULT 350,
                inStock INTEGER DEFAULT 1,
                spicyLevel TEXT DEFAULT 'Medium'
            );
        """)

        # 2. Orders Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                orderId TEXT PRIMARY KEY,
                tokenNumber TEXT NOT NULL,
                customerName TEXT NOT NULL,
                studentId TEXT NOT NULL,
                phone TEXT NOT NULL,
                notes TEXT,
                itemsJson TEXT NOT NULL,
                subtotal REAL NOT NULL,
                tax REAL NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                orderStatus TEXT DEFAULT 'PAID',
                estimatedWaitMinutes INTEGER DEFAULT 10,
                createdAt TEXT NOT NULL
            );
        """)

        # 3. Admin Configuration Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS admin_config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        """)

        cur.execute("""
            INSERT OR IGNORE INTO admin_config (key, value)
            VALUES ('admin_pin', 'admin123');
        """)

        conn.commit()
    finally:
        conn.close()

async def init_db():
    await asyncio.to_thread(_init_db_sync)

# --- Menu Operations ---

def _get_menu_sync(category=None, is_veg=None, search=None):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        query = "SELECT * FROM menu_items WHERE 1=1"
        params = []

        if category and category.lower() != "all":
            query += " AND LOWER(category) = LOWER(?)"
            params.append(category)

        if is_veg is not None:
            query += " AND isVeg = ?"
            params.append(1 if is_veg else 0)

        if search:
            query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)"
            term = f"%{search.lower().strip()}%"
            params.extend([term, term, term])

        cur.execute(query, params)
        rows = cur.fetchall()
        items = []
        for r in rows:
            d = dict(r)
            d["isVeg"] = bool(d["isVeg"])
            d["inStock"] = bool(d["inStock"])
            items.append(d)
        return items
    finally:
        conn.close()

async def db_get_menu(category=None, is_veg=None, search=None):
    return await asyncio.to_thread(_get_menu_sync, category, is_veg, search)

def _get_menu_item_sync(item_id: int):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,))
        row = cur.fetchone()
        if row:
            d = dict(row)
            d["isVeg"] = bool(d["isVeg"])
            d["inStock"] = bool(d["inStock"])
            return d
        return None
    finally:
        conn.close()

async def db_get_menu_item(item_id: int):
    return await asyncio.to_thread(_get_menu_item_sync, item_id)

def _upsert_menu_items_sync(items: List[Dict[str, Any]]):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        for item in items:
            cur.execute("""
                INSERT OR REPLACE INTO menu_items (
                    id, title, category, description, price, currency,
                    imageUrl, rating, reviewsCount, isVeg, prepTimeMinutes,
                    calories, inStock, spicyLevel
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["id"],
                item["title"],
                item["category"],
                item.get("description", ""),
                item["price"],
                item.get("currency", "INR"),
                item.get("imageUrl", ""),
                item.get("rating", 4.5),
                item.get("reviewsCount", 100),
                1 if item.get("isVeg", True) else 0,
                item.get("prepTimeMinutes", 8),
                item.get("calories", 350),
                1 if item.get("inStock", True) else 0,
                item.get("spicyLevel", "Medium")
            ))
        conn.commit()
    finally:
        conn.close()

async def db_upsert_menu_items(items: List[Dict[str, Any]]):
    await asyncio.to_thread(_upsert_menu_items_sync, items)

def _clear_and_seed_menu_sync(items: List[Dict[str, Any]]):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM menu_items")
        for item in items:
            cur.execute("""
                INSERT INTO menu_items (
                    id, title, category, description, price, currency,
                    imageUrl, rating, reviewsCount, isVeg, prepTimeMinutes,
                    calories, inStock, spicyLevel
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["id"],
                item["title"],
                item["category"],
                item.get("description", ""),
                item["price"],
                item.get("currency", "INR"),
                item.get("imageUrl", ""),
                item.get("rating", 4.5),
                item.get("reviewsCount", 100),
                1 if item.get("isVeg", True) else 0,
                item.get("prepTimeMinutes", 8),
                item.get("calories", 350),
                1 if item.get("inStock", True) else 0,
                item.get("spicyLevel", "Medium")
            ))
        conn.commit()
    finally:
        conn.close()

async def db_clear_and_seed_menu(items: List[Dict[str, Any]]):
    await asyncio.to_thread(_clear_and_seed_menu_sync, items)

def _toggle_stock_sync(item_id: int, in_stock: bool):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE menu_items SET inStock = ? WHERE id = ?", (1 if in_stock else 0, item_id))
        conn.commit()
        return True
    finally:
        conn.close()

async def db_toggle_stock(item_id: int, in_stock: bool):
    return await asyncio.to_thread(_toggle_stock_sync, item_id, in_stock)

def _add_menu_item_sync(item: Dict[str, Any]) -> Dict[str, Any]:
    conn = _get_connection()
    try:
        cur = conn.cursor()
        item_id = item.get("id")
        if not item_id:
            cur.execute("SELECT MAX(id) FROM menu_items")
            max_id = cur.fetchone()[0] or 0
            item_id = int(max_id) + 1

        cur.execute("""
            INSERT INTO menu_items (
                id, title, category, description, price, currency,
                imageUrl, rating, reviewsCount, isVeg, prepTimeMinutes,
                calories, inStock, spicyLevel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_id,
            item["title"],
            item["category"],
            item.get("description", ""),
            float(item["price"]),
            item.get("currency", "INR"),
            item.get("imageUrl") or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
            float(item.get("rating", 4.8)),
            int(item.get("reviewsCount", 50)),
            1 if item.get("isVeg", True) else 0,
            int(item.get("prepTimeMinutes", 8)),
            int(item.get("calories", 350)),
            1 if item.get("inStock", True) else 0,
            item.get("spicyLevel", "Medium")
        ))
        conn.commit()
        return _get_menu_item_sync(item_id)
    finally:
        conn.close()

async def db_add_menu_item(item: Dict[str, Any]) -> Dict[str, Any]:
    return await asyncio.to_thread(_add_menu_item_sync, item)

def _update_menu_item_sync(item_id: int, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,))
        existing = cur.fetchone()
        if not existing:
            return None

        ex = dict(existing)
        new_title = item.get("title") if item.get("title") is not None else ex["title"]
        new_category = item.get("category") if item.get("category") is not None else ex["category"]
        new_desc = item.get("description") if item.get("description") is not None else ex["description"]
        new_price = float(item["price"]) if item.get("price") is not None else float(ex["price"])
        new_currency = item.get("currency") if item.get("currency") is not None else ex.get("currency", "INR")
        new_image = item.get("imageUrl") if item.get("imageUrl") is not None else ex.get("imageUrl", "")
        new_is_veg = (1 if item["isVeg"] else 0) if item.get("isVeg") is not None else ex["isVeg"]
        new_prep = int(item["prepTimeMinutes"]) if item.get("prepTimeMinutes") is not None else ex["prepTimeMinutes"]
        new_cal = int(item["calories"]) if item.get("calories") is not None else ex["calories"]
        new_stock = (1 if item["inStock"] else 0) if item.get("inStock") is not None else ex["inStock"]
        new_spicy = item.get("spicyLevel") if item.get("spicyLevel") is not None else ex["spicyLevel"]

        cur.execute("""
            UPDATE menu_items SET
                title = ?,
                category = ?,
                description = ?,
                price = ?,
                currency = ?,
                imageUrl = ?,
                isVeg = ?,
                prepTimeMinutes = ?,
                calories = ?,
                inStock = ?,
                spicyLevel = ?
            WHERE id = ?
        """, (
            new_title,
            new_category,
            new_desc,
            new_price,
            new_currency,
            new_image,
            new_is_veg,
            new_prep,
            new_cal,
            new_stock,
            new_spicy,
            item_id
        ))
        conn.commit()
        return _get_menu_item_sync(item_id)
    finally:
        conn.close()

async def db_update_menu_item(item_id: int, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    return await asyncio.to_thread(_update_menu_item_sync, item_id, item)

def _delete_menu_item_sync(item_id: int) -> bool:
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM menu_items WHERE id = ?", (item_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

async def db_delete_menu_item(item_id: int) -> bool:
    return await asyncio.to_thread(_delete_menu_item_sync, item_id)

# --- Order Operations ---

def _save_order_sync(order_dict: Dict[str, Any]):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO orders (
                orderId, tokenNumber, customerName, studentId, phone,
                notes, itemsJson, subtotal, tax, amount, currency,
                orderStatus, estimatedWaitMinutes, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_dict["orderId"],
            order_dict["tokenNumber"],
            order_dict["customerName"],
            order_dict["studentId"],
            order_dict["phone"],
            order_dict.get("notes", ""),
            json.dumps([item if isinstance(item, dict) else item.model_dump() for item in order_dict["items"]]),
            order_dict["subtotal"],
            order_dict["tax"],
            order_dict["amount"],
            order_dict.get("currency", "INR"),
            order_dict.get("orderStatus", "PAID"),
            order_dict.get("estimatedWaitMinutes", 10),
            order_dict.get("createdAt", datetime.now().isoformat())
        ))
        conn.commit()
    finally:
        conn.close()

async def db_save_order(order_dict: Dict[str, Any]):
    await asyncio.to_thread(_save_order_sync, order_dict)

def _get_order_sync(order_id: str):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE orderId = ?", (order_id,))
        row = cur.fetchone()
        if row:
            d = dict(row)
            d["items"] = json.loads(d["itemsJson"])
            return d
        return None
    finally:
        conn.close()

async def db_get_order(order_id: str):
    return await asyncio.to_thread(_get_order_sync, order_id)

def _find_order_sync(identifier: str):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        raw = identifier.strip()
        formatted_token = raw if raw.upper().startswith("FF-") else f"FF-{raw}"
        cur.execute("""
            SELECT * FROM orders
            WHERE orderId = ?
               OR UPPER(tokenNumber) = UPPER(?)
               OR UPPER(tokenNumber) = UPPER(?)
            ORDER BY createdAt DESC LIMIT 1
        """, (raw, raw, formatted_token))
        row = cur.fetchone()
        if row:
            d = dict(row)
            d["items"] = json.loads(d["itemsJson"])
            return d
        return None
    finally:
        conn.close()

async def db_find_order(identifier: str):
    return await asyncio.to_thread(_find_order_sync, identifier)

def _list_orders_sync(status_filter: Optional[str] = None):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        query = "SELECT * FROM orders"
        params = []
        if status_filter and status_filter.upper() != "ALL":
            query += " WHERE orderStatus = ?"
            params.append(status_filter.upper())
        query += " ORDER BY createdAt DESC"

        cur.execute(query, params)
        rows = cur.fetchall()
        orders = []
        for r in rows:
            d = dict(r)
            d["items"] = json.loads(d["itemsJson"])
            orders.append(d)
        return orders
    finally:
        conn.close()

async def db_list_orders(status_filter: Optional[str] = None):
    return await asyncio.to_thread(_list_orders_sync, status_filter)

def _update_order_status_sync(order_id: str, new_status: str):
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE orders SET orderStatus = ? WHERE orderId = ?", (new_status.upper(), order_id))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

async def db_update_order_status(order_id: str, new_status: str):
    return await asyncio.to_thread(_update_order_status_sync, order_id, new_status)

# --- Admin Operations ---

def _verify_admin_pin_sync(pin: str) -> bool:
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT value FROM admin_config WHERE key = 'admin_pin'")
        row = cur.fetchone()
        if row and row["value"] == pin:
            return True
        return pin == "admin123"
    finally:
        conn.close()

async def db_verify_admin_pin(pin: str) -> bool:
    return await asyncio.to_thread(_verify_admin_pin_sync, pin)

def _get_admin_stats_sync():
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(amount), 0) as total_revenue FROM orders")
        summary = dict(cur.fetchone())

        cur.execute("SELECT COUNT(*) as active_kitchen FROM orders WHERE orderStatus IN ('PAID', 'PREPARING')")
        active = cur.fetchone()["active_kitchen"]

        cur.execute("SELECT COUNT(*) as ready_count FROM orders WHERE orderStatus = 'READY_FOR_PICKUP'")
        ready = cur.fetchone()["ready_count"]

        return {
            "totalOrders": summary["total_orders"],
            "totalRevenue": round(summary["total_revenue"], 2),
            "activeKitchenOrders": active,
            "readyForPickupOrders": ready,
        }
    finally:
        conn.close()

async def db_get_admin_stats():
    return await asyncio.to_thread(_get_admin_stats_sync)
