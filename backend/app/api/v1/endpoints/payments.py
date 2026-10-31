from fastapi import APIRouter, HTTPException, Header, Request, status
from app.models.payment import (
    RazorpayOrderRequest,
    RazorpayOrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
    WebhookResponse,
)
from app.services.razorpay_service import razorpay_service
from app.services.order_service import order_service

router = APIRouter()

@router.post("/create-razorpay-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(req: RazorpayOrderRequest):
    try:
        data = await razorpay_service.create_razorpay_order(req.orderId)
        return RazorpayOrderResponse(
            status="success",
            orderId=data["orderId"],
            razorpayOrderId=data["razorpayOrderId"],
            amount=data["amount"],
            currency=data["currency"],
            keyId=data["keyId"],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(req: PaymentVerifyRequest):
    order = await order_service.get_order_by_id(req.orderId)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{req.orderId}' not found"
        )

    verified = await razorpay_service.verify_payment(
        order_id=req.orderId,
        razorpay_order_id=req.razorpayOrderId,
        razorpay_payment_id=req.razorpayPaymentId,
        razorpay_signature=req.razorpaySignature,
    )

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed. Invalid Razorpay signature."
        )

    return PaymentVerifyResponse(
        status="success",
        orderId=order.orderId,
        tokenNumber=order.tokenNumber,
        message="Payment verified successfully. Order confirmed for cafeteria pickup!",
        verified=True,
    )

@router.post("/webhook", response_model=WebhookResponse)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
):
    raw_body = await request.body()
    try:
        json_payload = await request.json()
    except Exception:
        json_payload = {}

    success = await razorpay_service.handle_webhook(
        raw_body=raw_body,
        signature_header=x_razorpay_signature or "",
        event_payload=json_payload,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay webhook signature."
        )

    return WebhookResponse(
        status="success",
        message="Webhook event processed successfully."
    )
