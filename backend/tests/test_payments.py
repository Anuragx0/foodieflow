import asyncio
import sys
import os
import hmac
import hashlib
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

async def run_payment_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Create a food order first
        print("1. Creating order for payment test...")
        order_res = await ac.post("/api/v1/orders/create", json={
            "customerName": "Kavya Patel",
            "studentId": "IT-2024-501",
            "phone": "9876543210",
            "notes": "Extra tissues",
            "items": [{"menuItemId": 1, "quantity": 1}, {"menuItemId": 8, "quantity": 1}]
        })
        assert order_res.status_code == 201, f"Failed to create order: {order_res.text}"
        order = order_res.json()
        order_id = order["orderId"]
        print(f"[OK] Order created: {order_id}, Amount: Rs.{order['amount']}")

        # 2. Create Razorpay Order
        print("2. Generating Razorpay payment order...")
        rzp_res = await ac.post("/api/v1/payments/create-razorpay-order", json={"orderId": order_id})
        assert rzp_res.status_code == 200, f"Failed to create rzp order: {rzp_res.text}"
        rzp_data = rzp_res.json()
        assert rzp_data["status"] == "success"
        razorpay_order_id = rzp_data["razorpayOrderId"]
        amount_paise = rzp_data["amount"]
        print(f"[OK] Razorpay order created: {razorpay_order_id}, Amount (paise): {amount_paise}")

        # 3. Verify Payment Signature
        print("3. Testing cryptographic signature verification...")
        razorpay_payment_id = "pay_test_9823471029"
        # Generate valid HMAC-SHA256 signature
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        valid_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
            msg,
            hashlib.sha256
        ).hexdigest()

        verify_res = await ac.post("/api/v1/payments/verify", json={
            "orderId": order_id,
            "razorpayOrderId": razorpay_order_id,
            "razorpayPaymentId": razorpay_payment_id,
            "razorpaySignature": valid_signature,
        })
        assert verify_res.status_code == 200, f"Verification failed: {verify_res.text}"
        verify_data = verify_res.json()
        assert verify_data["verified"] is True
        print(f"[OK] Payment signature verified! Token: {verify_data['tokenNumber']}")

        # 4. Test Webhook Verification
        print("4. Testing Razorpay webhook handling with HMAC signature...")
        webhook_payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": razorpay_payment_id,
                        "amount": amount_paise,
                        "currency": "INR",
                        "status": "captured",
                        "notes": {
                            "orderId": order_id
                        }
                    }
                }
            }
        }
        raw_body = json.dumps(webhook_payload).encode("utf-8")
        webhook_sig = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        hook_res = await ac.post(
            "/api/v1/payments/webhook",
            content=raw_body,
            headers={"X-Razorpay-Signature": webhook_sig, "Content-Type": "application/json"}
        )
        assert hook_res.status_code == 200, f"Webhook failed: {hook_res.text}"
        assert hook_res.json()["status"] == "success"
        print("[OK] Webhook received & verified successfully!")

    print("\nALL RAZORPAY PAYMENT & WEBHOOK TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_payment_tests())
