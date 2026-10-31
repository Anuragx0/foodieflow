from fastapi import APIRouter
from app.api.v1.endpoints import menu, orders, payments, admin

api_router = APIRouter()

api_router.include_router(menu.router, prefix="/menu", tags=["Cafeteria Menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders & Cart"])
api_router.include_router(payments.router, prefix="/payments", tags=["Razorpay Payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["Cafeteria Kitchen Admin"])


