import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from httpx import AsyncClient, ASGITransport
from app.main import app


async def run_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Health check
        print("Testing GET /api/health ...")
        res = await ac.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        assert res.json()["status"] == "healthy"
        print("[OK] Health check OK")

        # 2. Get menu list
        print("Testing GET /api/v1/menu ...")
        res = await ac.get("/api/v1/menu")
        assert res.status_code == 200, f"Menu list failed: {res.text}"
        data = res.json()
        assert data["status"] == "success"
        assert data["count"] > 0
        first_item = data["data"][0]
        print(f"[OK] Menu list OK: Received {data['count']} items. First: {first_item['title']} (Rs.{first_item['price']})")

        # 3. Get menu categories
        print("Testing GET /api/v1/menu/categories ...")
        res = await ac.get("/api/v1/menu/categories")
        assert res.status_code == 200
        assert "Campus Bowls" in res.json()
        print("[OK] Menu categories OK")

        # 4. Filter by veg
        print("Testing GET /api/v1/menu?is_veg=true ...")
        res = await ac.get("/api/v1/menu?is_veg=true")
        assert res.status_code == 200
        veg_items = res.json()["data"]
        assert all(item["isVeg"] is True for item in veg_items)
        print(f"[OK] Veg filter OK: {len(veg_items)} veg items found")

        # 5. Create order
        print("Testing POST /api/v1/orders/create ...")
        order_payload = {
            "customerName": "Rohan Sharma",
            "studentId": "CS-2024-412",
            "phone": "9876543210",
            "notes": "Extra crispy",
            "items": [
                {"menuItemId": first_item["id"], "quantity": 2}
            ]
        }
        res = await ac.post("/api/v1/orders/create", json=order_payload)
        assert res.status_code == 201, f"Order create failed: {res.text}"
        order = res.json()
        assert order["status"] == "success"
        assert order["tokenNumber"].startswith("FF-")
        order_id = order["orderId"]
        print(f"[OK] Order created OK: Token={order['tokenNumber']}, OrderID={order_id}, Total=Rs.{order['amount']}")

        # 6. Retrieve order
        print(f"Testing GET /api/v1/orders/{order_id} ...")
        res = await ac.get(f"/api/v1/orders/{order_id}")
        assert res.status_code == 200
        assert res.json()["customerName"] == "Rohan Sharma"
        print("[OK] Order retrieval OK")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_tests())
