from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from enum import Enum
import re

class OrderStatus(str, Enum):
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAID = "PAID"
    PREPARING = "PREPARING"
    READY_FOR_PICKUP = "READY_FOR_PICKUP"
    COMPLETED = "COMPLETED"

class OrderItemCreate(BaseModel):
    menuItemId: int
    quantity: int = Field(gt=0, description="Quantity must be at least 1")

class OrderCreate(BaseModel):
    customerName: str = Field(..., description="Student full name is compulsory")
    studentId: str = Field(..., description="Student ID / Roll number is compulsory")
    phone: str = Field(..., description="10-digit mobile number is compulsory")
    notes: Optional[str] = ""
    items: List[OrderItemCreate] = Field(..., min_length=1, description="At least one menu item is compulsory")

    @field_validator("customerName")
    @classmethod
    def validate_customer_name(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Student full name is compulsory and cannot be empty")
        if len(clean) < 2:
            raise ValueError("Student full name must be at least 2 characters long")
        return clean

    @field_validator("studentId")
    @classmethod
    def validate_student_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Student ID / Roll number is compulsory and cannot be empty")
        if len(clean) < 2:
            raise ValueError("Student ID / Roll number must be at least 2 characters long")
        return clean.upper()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = re.sub(r"[\s\-\+]", "", v.strip())
        if clean.startswith("91") and len(clean) == 12:
            clean = clean[2:]
        if not re.match(r"^[0-9]{10}$", clean):
            raise ValueError("Valid 10-digit mobile number is compulsory")
        return clean

class OrderItemDetail(BaseModel):
    menuItemId: int
    title: str
    quantity: int
    unitPrice: float
    totalPrice: float

class OrderResponse(BaseModel):
    status: str = "success"
    orderId: str
    tokenNumber: str
    customerName: str
    studentId: str
    phone: str
    notes: Optional[str] = ""
    items: List[OrderItemDetail]
    subtotal: float
    tax: float
    amount: float
    currency: str = "INR"
    orderStatus: OrderStatus = OrderStatus.PAID
    estimatedWaitMinutes: int = 10
    createdAt: str
