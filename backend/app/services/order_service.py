import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from app.models.order import (
    OrderCreate,
    OrderResponse,
    OrderItemDetail,
    OrderStatus,
)
from app.services.menu_service import menu_service
from app.db.database import (
    db_save_order,
    db_get_order,
    db_find_order,
    db_list_orders,
    db_update_order_status,
)

class OrderService:
    def __init__(self):
        self._lock = asyncio.Lock()

    async def create_order(self, order_data: OrderCreate) -> OrderResponse:
        async with self._lock:
            # Count existing orders to get clean sequential tokens
            all_existing = await db_list_orders()
            token_count = 100 + len(all_existing) + 1
            token_num = f"FF-{token_count}"
            order_id = f"ORD-{datetime.now().strftime('%Y%m%d%H%M')}-{token_count}"

            detailed_items: List[OrderItemDetail] = []
            subtotal = 0.0
            max_prep_time = 5

            for item in order_data.items:
                menu_item = await menu_service.get_item_by_id(item.menuItemId)
                if menu_item:
                    title = menu_item.title
                    price = menu_item.price
                    max_prep_time = max(max_prep_time, menu_item.prepTimeMinutes)
                else:
                    title = f"Cafeteria Special #{item.menuItemId}"
                    price = 120.0

                item_total = price * item.quantity
                subtotal += item_total
                detailed_items.append(
                    OrderItemDetail(
                        menuItemId=item.menuItemId,
                        title=title,
                        quantity=item.quantity,
                        unitPrice=price,
                        totalPrice=item_total,
                    )
                )

            # 5% Cafeteria levy & packaging
            tax = round(subtotal * 0.05, 2)
            grand_total = round(subtotal + tax, 2)

            total_qty = sum(it.quantity for it in order_data.items)
            estimated_wait = min(35, max_prep_time + int(total_qty * 1.5))

            order_response = OrderResponse(
                status="success",
                orderId=order_id,
                tokenNumber=token_num,
                customerName=order_data.customerName,
                studentId=order_data.studentId,
                phone=order_data.phone,
                notes=order_data.notes or "",
                items=detailed_items,
                subtotal=subtotal,
                tax=tax,
                amount=grand_total,
                currency="INR",
                orderStatus=OrderStatus.PAID,
                estimatedWaitMinutes=estimated_wait,
                createdAt=datetime.now().isoformat(),
            )

            # Persist order directly to SQLite database
            await db_save_order(order_response.model_dump())
            return order_response

    async def get_order_by_id(self, order_id: str) -> Optional[OrderResponse]:
        order_dict = await db_get_order(order_id)
        if order_dict:
            items_detailed = [OrderItemDetail(**it) for it in order_dict["items"]]
            order_dict["items"] = items_detailed
            return OrderResponse(**order_dict)
        return None

    async def find_order(self, identifier: str) -> Optional[OrderResponse]:
        order_dict = await db_find_order(identifier)
        if order_dict:
            items_detailed = [OrderItemDetail(**it) for it in order_dict["items"]]
            order_dict["items"] = items_detailed
            return OrderResponse(**order_dict)
        return None

    async def list_orders(self, status_filter: Optional[str] = None) -> List[OrderResponse]:
        raw_orders = await db_list_orders(status_filter)
        result = []
        for o in raw_orders:
            items_detailed = [OrderItemDetail(**it) for it in o["items"]]
            o["items"] = items_detailed
            result.append(OrderResponse(**o))
        return result

    async def update_order_status(self, order_id: str, status: OrderStatus) -> bool:
        return await db_update_order_status(order_id, status.value if hasattr(status, 'value') else str(status))

order_service = OrderService()
