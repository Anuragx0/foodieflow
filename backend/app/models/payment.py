from pydantic import BaseModel
from typing import Optional

class RazorpayOrderRequest(BaseModel):
    orderId: str

class RazorpayOrderResponse(BaseModel):
    status: str = "success"
    orderId: str
    razorpayOrderId: str
    amount: int  # amount in paise (1 INR = 100 paise)
    currency: str = "INR"
    keyId: str

class PaymentVerifyRequest(BaseModel):
    orderId: str
    razorpayOrderId: str
    razorpayPaymentId: str
    razorpaySignature: str

class PaymentVerifyResponse(BaseModel):
    status: str
    orderId: str
    tokenNumber: str
    message: str
    verified: bool

class WebhookResponse(BaseModel):
    status: str
    message: str
