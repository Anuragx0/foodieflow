import time
import httpx
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.models.menu import FoodItem
from app.db.database import (
    db_get_menu,
    db_get_menu_item,
    db_clear_and_seed_menu,
    db_toggle_stock,
    db_add_menu_item,
    db_update_menu_item,
    db_delete_menu_item,
)

FOOD_ITEMS_CATALOG = [
    # --- QUICK BITES (8 items) ---
    {
        "id": 1,
        "title": "Fiery Paneer Tikka Kathi Wrap",
        "category": "Quick Bites",
        "description": "Char-grilled cottage cheese cubes tossed in spicy tandoori marinade, rolled in whole wheat roti with purple cabbage, pickled onions, and mint dip.",
        "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 7,
        "calories": 380,
        "spicyLevel": "Spicy",
        "price": 139.0,
        "rating": 4.8,
        "reviewsCount": 142,
    },
    {
        "id": 2,
        "title": "Crispy Double-Decker Chicken Burger",
        "category": "Quick Bites",
        "description": "Double crispy spiced chicken patties with melted cheddar cheese slice, fresh lettuce, and secret cafeteria burger sauce in a toasted sesame brioche bun.",
        "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        "isVeg": False,
        "prepTimeMinutes": 10,
        "calories": 540,
        "spicyLevel": "Medium",
        "price": 179.0,
        "rating": 4.9,
        "reviewsCount": 215,
    },
    {
        "id": 3,
        "title": "Peri-Peri Masala Fries Bucket",
        "category": "Quick Bites",
        "description": "Golden, hand-cut crispy french fries generously dusted with fiery peri-peri spice blend and served with creamy garlic dip.",
        "imageUrl": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 5,
        "calories": 320,
        "spicyLevel": "Medium",
        "price": 99.0,
        "rating": 4.7,
        "reviewsCount": 185,
    },
    {
        "id": 4,
        "title": "Bombay Grilled Cheese Corn Sandwich",
        "category": "Quick Bites",
        "description": "Tri-layer golden grilled sandwich stuffed with sweet American corn, melted mozzarella cheese, chopped bell peppers, and spiced green chutney.",
        "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 6,
        "calories": 360,
        "spicyLevel": "Mild",
        "price": 129.0,
        "rating": 4.7,
        "reviewsCount": 164,
    },
    {
        "id": 5,
        "title": "Cheesy Herb Garlic Bread Slices (4 pcs)",
        "category": "Quick Bites",
        "description": "Oven-baked artisan garlic toast smothered with melted mozzarella, roasted garlic butter, chili flakes, and Italian oregano seasoning.",
        "imageUrl": "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 7,
        "calories": 340,
        "spicyLevel": "Mild",
        "price": 119.0,
        "rating": 4.6,
        "reviewsCount": 110,
    },
    {
        "id": 6,
        "title": "Punjabi Samosa with Mint Chutney (2 pcs)",
        "category": "Quick Bites",
        "description": "Two golden, flaky crust samosas stuffed with spiced potatoes and green peas, served with tangy tamarind chutney and fresh spicy green chutney.",
        "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 4,
        "calories": 290,
        "spicyLevel": "Medium",
        "price": 69.0,
        "rating": 4.8,
        "reviewsCount": 380,
    },
    {
        "id": 7,
        "title": "Steamed Himalayan Veg Momos (6 pcs)",
        "category": "Quick Bites",
        "description": "Delicate thin-wrapper steamed dumplings stuffed with seasoned finely diced garden vegetables, served with authentic fiery Tibetan chili sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 8,
        "calories": 260,
        "spicyLevel": "Spicy",
        "price": 109.0,
        "rating": 4.8,
        "reviewsCount": 195,
    },
    {
        "id": 8,
        "title": "Smoky BBQ Chicken Pizza Slice",
        "category": "Quick Bites",
        "description": "Generous artisanal hand-tossed pizza wedge topped with smoky BBQ chicken, caramelized red onions, fresh cilantro, and stringy mozzarella.",
        "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
        "isVeg": False,
        "prepTimeMinutes": 8,
        "calories": 420,
        "spicyLevel": "Medium",
        "price": 149.0,
        "rating": 4.7,
        "reviewsCount": 152,
    },

    # --- CAMPUS BOWLS (7 items) ---
    {
        "id": 9,
        "title": "Butter Paneer Makhani Rice Bowl",
        "category": "Campus Bowls",
        "description": "Fragrant basmati rice served alongside a rich, velvety tomato-butter gravy simmered with soft malai paneer cubes, fresh cream, and crisp papad.",
        "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 8,
        "calories": 590,
        "spicyLevel": "Mild",
        "price": 189.0,
        "rating": 4.8,
        "reviewsCount": 220,
    },
    {
        "id": 10,
        "title": "Hyderabadi Dum Chicken Biryani Bowl",
        "category": "Campus Bowls",
        "description": "Slow-cooked aromatic long-grain basmati rice layered with juicy tender marinated chicken, saffron milk, caramelized birista, and mint raita.",
        "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
        "isVeg": False,
        "prepTimeMinutes": 11,
        "calories": 650,
        "spicyLevel": "Spicy",
        "price": 219.0,
        "rating": 4.9,
        "reviewsCount": 340,
    },
    {
        "id": 11,
        "title": "Royal Executive Indian Thali",
        "category": "Campus Bowls",
        "description": "Complete executive meal with steamed basmati rice, warm butter naan, dal makhani, shahi paneer subzi, mixed vegetable korma, salad, and raita.",
        "imageUrl": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 12,
        "calories": 720,
        "spicyLevel": "Medium",
        "price": 239.0,
        "rating": 4.9,
        "reviewsCount": 290,
    },
    {
        "id": 12,
        "title": "Butter Chicken with Garlic Naan",
        "category": "Campus Bowls",
        "description": "Tender chicken tikka simmered in a silken aromatic makhani gravy, served with two fresh tandoor-baked garlic butter naan breads.",
        "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
        "isVeg": False,
        "prepTimeMinutes": 10,
        "calories": 680,
        "spicyLevel": "Medium",
        "price": 229.0,
        "rating": 4.9,
        "reviewsCount": 310,
    },
    {
        "id": 13,
        "title": "Crispy Butter Masala Dosa Platter",
        "category": "Campus Bowls",
        "description": "Huge golden crispy fermented crepe brushed with butter, filled with spiced mustard potato masala, served with piping hot sambar and trio of chutneys.",
        "imageUrl": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 9,
        "calories": 410,
        "spicyLevel": "Mild",
        "price": 129.0,
        "rating": 4.8,
        "reviewsCount": 275,
    },
    {
        "id": 14,
        "title": "Spicy Egg Maggi & Ramen Bowl",
        "category": "Campus Bowls",
        "description": "Campus favourite instant spiced noodles cooked with farm-fresh boiled egg, scallions, sweet peppers, chili flakes, and butter.",
        "imageUrl": "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80",
        "isVeg": False,
        "prepTimeMinutes": 6,
        "calories": 430,
        "spicyLevel": "Spicy",
        "price": 119.0,
        "rating": 4.7,
        "reviewsCount": 210,
    },
    {
        "id": 15,
        "title": "South Indian Steamed Idli Platter (3 pcs)",
        "category": "Campus Bowls",
        "description": "Three ultra-soft, fluffy steamed rice-lentil cakes served on banana leaf with fresh coconut chutney and vegetable drumstick sambar.",
        "imageUrl": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 5,
        "calories": 240,
        "spicyLevel": "Mild",
        "price": 89.0,
        "rating": 4.7,
        "reviewsCount": 140,
    },

    # --- BEVERAGES (5 items) ---
    {
        "id": 16,
        "title": "Cafeteria Cold Coffee Frappé",
        "category": "Beverages",
        "description": "Chilled espresso blended thick with whole milk, sweet chocolate syrup, and ice cubes, finished with a generous dusting of cocoa.",
        "imageUrl": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 4,
        "calories": 240,
        "spicyLevel": "None",
        "price": 89.0,
        "rating": 4.8,
        "reviewsCount": 260,
    },
    {
        "id": 17,
        "title": "Fresh Alphonso Mango Juice Cooler",
        "category": "Beverages",
        "description": "Thick sweet Alphonso mango nectar served over crushed ice with fresh lime wheels and mint sprig. 100% natural and refreshing.",
        "imageUrl": "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 4,
        "calories": 140,
        "spicyLevel": "None",
        "price": 79.0,
        "rating": 4.7,
        "reviewsCount": 125,
    },
    {
        "id": 18,
        "title": "Chilled Virgin Mint Lime Mojito",
        "category": "Beverages",
        "description": "Muddled fresh garden mint leaves, tangy lime juice, simple cane syrup, and bubbly sparkling soda over cracked crystal ice.",
        "imageUrl": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 4,
        "calories": 110,
        "spicyLevel": "None",
        "price": 79.0,
        "rating": 4.6,
        "reviewsCount": 95,
    },
    {
        "id": 19,
        "title": "Adrak Masala Chai & Cookies",
        "category": "Beverages",
        "description": "Freshly brewed hot tea infused with crushed ginger root, green cardamom, and rich milk, served with two crunchy bakery butter cookies.",
        "imageUrl": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 4,
        "calories": 160,
        "spicyLevel": "Mild",
        "price": 49.0,
        "rating": 4.9,
        "reviewsCount": 410,
    },
    {
        "id": 20,
        "title": "Oreo Chocolate Thickshake",
        "category": "Beverages",
        "description": "Creamy chocolate ice cream shake blended with real Oreo cookies, topped with whipped chocolate cream and fudge sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 5,
        "calories": 390,
        "spicyLevel": "None",
        "price": 119.0,
        "rating": 4.9,
        "reviewsCount": 180,
    },

    # --- DESSERTS (2 items) ---
    {
        "id": 21,
        "title": "Belgian Dark Chocolate Fudge Brownie",
        "category": "Desserts",
        "description": "Decadent, rich dark chocolate fudge brownie warmed through and smothered with cascading velvety hot chocolate sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 5,
        "calories": 410,
        "spicyLevel": "None",
        "price": 119.0,
        "rating": 4.9,
        "reviewsCount": 194,
    },
    {
        "id": 22,
        "title": "Crispy Belgian Waffles with Maple Syrup",
        "category": "Desserts",
        "description": "Two golden, freshly baked Belgian waffle squares served with fresh berries, melted butter, and premium warm maple syrup.",
        "imageUrl": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80",
        "isVeg": True,
        "prepTimeMinutes": 6,
        "calories": 350,
        "spicyLevel": "None",
        "price": 139.0,
        "rating": 4.8,
        "reviewsCount": 115,
    },
]

class MenuService:
    def __init__(self):
        self._last_seeded: bool = False

    async def get_menu(
        self,
        category: Optional[str] = None,
        is_veg: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> List[FoodItem]:
        if not self._last_seeded:
            existing = await db_get_menu()
            if not existing:
                await self.refresh_menu_cache()
            self._last_seeded = True

        raw_items = await db_get_menu(category=category, is_veg=is_veg, search=search)
        return [FoodItem(**item) for item in raw_items]

    async def get_item_by_id(self, item_id: int) -> Optional[FoodItem]:
        item_dict = await db_get_menu_item(item_id)
        if item_dict:
            return FoodItem(**item_dict)
        return None

    async def add_item(self, item_data: Dict[str, Any]) -> FoodItem:
        created = await db_add_menu_item(item_data)
        return FoodItem(**created)

    async def update_item(self, item_id: int, item_data: Dict[str, Any]) -> Optional[FoodItem]:
        updated = await db_update_menu_item(item_id, item_data)
        if updated:
            return FoodItem(**updated)
        return None

    async def delete_item(self, item_id: int) -> bool:
        return await db_delete_menu_item(item_id)

    async def toggle_item_stock(self, item_id: int, in_stock: bool) -> bool:
        return await db_toggle_stock(item_id, in_stock)

    async def refresh_menu_cache(self):
        """Populates SQLite database with authentic, curated cafeteria meals with 0 duplicates."""
        adapted_items: List[Dict[str, Any]] = []
        for item in FOOD_ITEMS_CATALOG:
            adapted_items.append({
                "id": item["id"],
                "title": item["title"],
                "category": item["category"],
                "description": item["description"],
                "price": float(item["price"]),
                "currency": "INR",
                "imageUrl": item["imageUrl"],
                "rating": item.get("rating", 4.8),
                "reviewsCount": item.get("reviewsCount", 150),
                "isVeg": item["isVeg"],
                "prepTimeMinutes": item["prepTimeMinutes"],
                "calories": item["calories"],
                "inStock": True,
                "spicyLevel": item["spicyLevel"],
            })

        await db_clear_and_seed_menu(adapted_items)

menu_service = MenuService()

