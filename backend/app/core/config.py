from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FoodieFlow"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ]
    FAKE_STORE_API_URL: str = "https://fakestoreapi.com/products"
    MENU_CACHE_TTL_SECONDS: int = 600  # 10 minutes cache for rush hours

    # Razorpay Payment Gateway Settings
    RAZORPAY_KEY_ID: str = "rzp_test_FoodieFlowDemo"
    RAZORPAY_KEY_SECRET: str = "FoodieFlowDemoSecret123"
    RAZORPAY_WEBHOOK_SECRET: str = "FoodieFlowWebhookSecret456"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

