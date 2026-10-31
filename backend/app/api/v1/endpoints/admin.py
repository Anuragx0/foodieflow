from fastapi import APIRouter, HTTPException, status, Header, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.db.database import (
    db_verify_admin_pin,
    db_get_admin_stats,
    db_toggle_stock,
)
from app.models.order import OrderResponse, OrderStatus
from app.models.menu import MenuItemResponse, MenuItemCreate, MenuItemUpdate, FoodItem
from app.services.order_service import order_service
from app.services.menu_service import menu_service

router = APIRouter()

class AdminLoginRequest(BaseModel):
    pin: str

class AdminLoginResponse(BaseModel):
    status: str
    token: str
    message: str

class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus

class StockUpdateRequest(BaseModel):
    inStock: bool

# Simple session token check for the admin dashboard
def verify_admin_auth(auth_token: Optional[str]):
    if not auth_token or not auth_token.startswith("foodieflow_admin_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required. Access denied for student view."
        )

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(payload: AdminLoginRequest):
    is_valid = await db_verify_admin_pin(payload.pin)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Cafeteria Admin PIN"
        )
    return AdminLoginResponse(
        status="success",
        token=f"foodieflow_admin_{payload.pin}_session",
        message="Cafeteria Admin Dashboard unlocked"
    )

@router.get("/stats")
async def get_admin_stats(authorization: Optional[str] = Header(None)):
    verify_admin_auth(authorization)
    return await db_get_admin_stats()

@router.get("/orders", response_model=List[OrderResponse])
async def get_admin_orders(
    status: Optional[str] = Query("ALL", description="Filter by status: ALL, PAID, PREPARING, READY_FOR_PICKUP, COMPLETED"),
    authorization: Optional[str] = Header(None),
):
    verify_admin_auth(authorization)
    return await order_service.list_orders(status_filter=status)

@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdateRequest,
    authorization: Optional[str] = Header(None),
):
    verify_admin_auth(authorization)
    success = await order_service.update_order_status(order_id, payload.status)
    if not success:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    order = await order_service.get_order_by_id(order_id)
    return {
        "status": "success",
        "orderId": order_id,
        "newStatus": payload.status,
        "tokenNumber": order.tokenNumber if order else "",
    }

@router.patch("/menu/{item_id}/stock")
async def toggle_menu_stock(
    item_id: int,
    payload: StockUpdateRequest,
    authorization: Optional[str] = Header(None),
):
    verify_admin_auth(authorization)
    await menu_service.toggle_item_stock(item_id, payload.inStock)
    return {
        "status": "success",
        "itemId": item_id,
        "inStock": payload.inStock,
        "message": f"Dish #{item_id} marked as {'In Stock' if payload.inStock else 'Sold Out'}"
    }

@router.post("/menu/items", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    payload: MenuItemCreate,
    authorization: Optional[str] = Header(None),
):
    verify_admin_auth(authorization)
    created_item = await menu_service.add_item(payload.model_dump())
    return MenuItemResponse(status="success", data=created_item)

@router.put("/menu/items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: int,
    payload: MenuItemUpdate,
    authorization: Optional[str] = Header(None),
):
    verify_admin_auth(authorization)
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated_item = await menu_service.update_item(item_id, update_data)
    if not updated_item:
        raise HTTPException(status_code=404, detail=f"Menu item #{item_id} not found")
    return MenuItemResponse(status="success", data=updated_item)

@router.delete("/menu/items/{item_id}")
async def delete_menu_item(
    item_id: int,
    authorization: Optional[str] = Header(None),
):
    verify_admin_auth(authorization)
    deleted = await menu_service.delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Menu item #{item_id} not found")
    return {"status": "success", "message": f"Menu item #{item_id} deleted successfully"}
