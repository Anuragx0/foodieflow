from fastapi import APIRouter, HTTPException, status
from fastapi.responses import HTMLResponse, Response
from typing import List
from app.models.order import OrderCreate, OrderResponse
from app.services.order_service import order_service
from app.services.receipt_service import generate_receipt_html

router = APIRouter()

@router.post("/create", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate):
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one cafeteria food item"
        )
    order = await order_service.create_order(order_data)
    return order

@router.get("/{order_id}/receipt", response_class=HTMLResponse)
async def get_order_receipt_html(order_id: str):
    order = await order_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    html = generate_receipt_html(order.model_dump())
    return HTMLResponse(content=html)

@router.get("/{order_id}/receipt/download")
async def download_order_receipt(order_id: str):
    order = await order_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    html = generate_receipt_html(order.model_dump())
    return Response(
        content=html,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="FoodieFlow_Receipt_{order_id}.html"'
        }
    )

@router.get("/track/{identifier}", response_model=OrderResponse)
async def track_order(identifier: str):
    order = await order_service.find_order(identifier)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order or Token '{identifier}' not found"
        )
    return order

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    order = await order_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found"
        )
    return order


@router.get("", response_model=List[OrderResponse])
async def list_orders():
    return await order_service.list_orders()
