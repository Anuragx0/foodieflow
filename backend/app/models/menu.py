from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DietaryType(str, Enum):
    VEG = "Veg"
    NON_VEG = "Non-Veg"

class SpiceLevel(str, Enum):
    NONE = "None"
    MILD = "Mild"
    MEDIUM = "Medium"
    SPICY = "Spicy"
    HOT = "Hot"

class FoodItem(BaseModel):
    id: int
    title: str
    category: str
    description: str
    price: float
    currency: str = "INR"
    imageUrl: str
    rating: float = 4.5
    reviewsCount: int = 100
    isVeg: bool = True
    prepTimeMinutes: int = 8
    calories: Optional[int] = 350
    inStock: bool = True
    spicyLevel: str = "Medium"

class MenuListResponse(BaseModel):
    status: str = "success"
    count: int
    data: List[FoodItem]

class MenuItemResponse(BaseModel):
    status: str = "success"
    data: FoodItem

class MenuItemCreate(BaseModel):
    title: str = Field(..., min_length=2, description="Dish name")
    category: str = Field(..., min_length=2, description="Dish category")
    description: str = Field(..., description="Description / ingredients")
    price: float = Field(..., gt=0, description="Price in INR")
    currency: str = "INR"
    imageUrl: Optional[str] = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
    isVeg: bool = True
    prepTimeMinutes: int = Field(default=8, ge=1)
    calories: Optional[int] = 350
    inStock: bool = True
    spicyLevel: str = "Medium"

class MenuItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    imageUrl: Optional[str] = None
    isVeg: Optional[bool] = None
    prepTimeMinutes: Optional[int] = None
    calories: Optional[int] = None
    inStock: Optional[bool] = None
    spicyLevel: Optional[str] = None
