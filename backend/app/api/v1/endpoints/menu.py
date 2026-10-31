from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.models.menu import MenuListResponse, MenuItemResponse
from app.services.menu_service import menu_service

router = APIRouter()

@router.get("", response_model=MenuListResponse)
async def get_menu(
    category: Optional[str] = Query(None, description="Filter by category (e.g. Quick Bites, Campus Bowls)"),
    is_veg: Optional[bool] = Query(None, description="Filter for vegetarian items only"),
    search: Optional[str] = Query(None, description="Search term for dish name or description"),
):
    items = await menu_service.get_menu(category=category, is_veg=is_veg, search=search)
    return MenuListResponse(status="success", count=len(items), data=items)

@router.get("/categories", response_model=List[str])
async def get_categories():
    return ["All", "Quick Bites", "Campus Bowls", "Beverages", "Desserts"]

@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: int):
    item = await menu_service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cafeteria menu item not found")
    return MenuItemResponse(status="success", data=item)
