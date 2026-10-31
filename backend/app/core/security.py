import hmac
import hashlib
from app.core.config import settings

def verify_razorpay_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    key_secret: str = settings.RAZORPAY_KEY_SECRET,
) -> bool:
    """
    Validates Razorpay client checkout response signature.
    Signature is HMAC-SHA256 of "{razorpay_order_id}|{razorpay_payment_id}" using the key_secret.
    """
    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return False

    msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
    generated_sig = hmac.new(key_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated_sig, razorpay_signature)

def verify_razorpay_webhook_signature(
    raw_body: bytes,
    webhook_signature: str,
    webhook_secret: str = settings.RAZORPAY_WEBHOOK_SECRET,
) -> bool:
    """
    Validates incoming Razorpay Webhook HTTP signature against X-Razorpay-Signature.
    Signature is HMAC-SHA256 of the raw request payload body using the webhook_secret.
    """
    if not raw_body or not webhook_signature:
        return False

    generated_sig = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated_sig, webhook_signature)
