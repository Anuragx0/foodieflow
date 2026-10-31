# FoodieFlow: Production Deployment Guide

This guide details the complete deployment architecture for **FoodieFlow**, providing step-by-step instructions for hosting the React frontend on **Amazon S3 + CloudFront** and the FastAPI asynchronous backend on **Amazon EC2 + Nginx**.

---

## Architecture Topology

```
[Students / Campus Users]
          │
          ├── (Static Content / Web App) ──► [Amazon CloudFront CDN] ──► [Amazon S3 Bucket]
          │                                                               (React Vite SPA)
          │
          └── (API & Webhook Requests) ────► [Amazon EC2 Instance]
                                              ├── Nginx (Reverse Proxy & SSL)
                                              └── Systemd: Uvicorn (4 Workers)
                                                   └── FastAPI Async Backend
```

---

## Part 1: FastAPI Backend Deployment on Amazon EC2

### Step 1: Provision EC2 Instance
1. Launch an EC2 Instance:
   - **AMI**: Ubuntu Server 22.04 LTS or 24.04 LTS (HVM), SSD Volume Type
   - **Instance Type**: `t3.small` or `t3.medium` (recommended for campus rush hours)
   - **Security Group Inbound Rules**:
     - Port 22 (SSH): Restrict to your admin IP
     - Port 80 (HTTP): `0.0.0.0/0`
     - Port 443 (HTTPS): `0.0.0.0/0`

### Step 2: System Setup & Dependencies
Connect to your EC2 instance via SSH:
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Python 3, pip, venv, and Nginx
sudo apt install -y python3-pip python3-venv nginx git curl
```

### Step 3: Clone Codebase & Configure Python Environment
```bash
# Clone repository
cd /home/ubuntu
git clone <YOUR_REPOSITORY_URL> foodieflow
cd foodieflow/backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install production dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Environment Variables Setup
Create the production `.env` file in `/home/ubuntu/foodieflow/backend/.env`:
```bash
nano /home/ubuntu/foodieflow/backend/.env
```
Populate with your production values:
```ini
PROJECT_NAME=FoodieFlow
API_V1_STR=/api/v1
CORS_ORIGINS=["https://foodieflow.campus.edu","https://d123456abcdef.cloudfront.net"]
FAKE_STORE_API_URL=https://fakestoreapi.com/products
MENU_CACHE_TTL_SECONDS=600

# Live Razorpay Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Configure Systemd Daemon
Copy the service configuration:
```bash
sudo cp /home/ubuntu/foodieflow/deployment/systemd/foodieflow.service /etc/systemd/system/foodieflow.service

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable and start the FoodieFlow backend
sudo systemctl enable foodieflow
sudo systemctl start foodieflow

# Check status
sudo systemctl status foodieflow
```

### Step 6: Configure Nginx Reverse Proxy
```bash
sudo cp /home/ubuntu/foodieflow/deployment/nginx/foodieflow.conf /etc/nginx/sites-available/foodieflow.conf

# Enable site
sudo ln -s /etc/nginx/sites-available/foodieflow.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate (Let's Encrypt / Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.foodieflow.campus.edu
```

---

## Part 2: React Frontend Deployment on Amazon S3 + CloudFront

### Step 1: Generate Production Build
On your local machine or CI/CD pipeline:
```bash
cd frontend

# Set production API URL if connecting across domains
# VITE_API_URL=https://api.foodieflow.campus.edu

npm run build
```
This produces the optimized single-page static output in `frontend/dist/`.

### Step 2: Create Amazon S3 Bucket
1. Open AWS S3 Console $\rightarrow$ **Create bucket**.
2. **Bucket name**: e.g., `foodieflow-campus-frontend`.
3. Uncheck **Block all public access** (or keep blocked if using CloudFront Origin Access Control - OAC).
4. Enable **Static website hosting**:
   - Index document: `index.html`
   - Error document: `index.html` (crucial for client-side React SPA routing)

### Step 3: Upload Static Assets
Deploy the build files using the AWS CLI:
```bash
# Upload files with gzip & caching headers
aws s3 sync frontend/dist s3://foodieflow-campus-frontend \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html"

# Upload index.html with no-cache for instant updates
aws s3 cp frontend/dist/index.html s3://foodieflow-campus-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Step 4: Amazon CloudFront CDN Distribution
1. In the AWS CloudFront Console $\rightarrow$ **Create distribution**.
2. **Origin domain**: Select your S3 bucket website endpoint.
3. **Viewer Protocol Policy**: Redirect HTTP to HTTPS.
4. **Custom Error Response**:
   - HTTP Error Code: `403` and `404`
   - Customize response: Yes $\rightarrow$ Response Page Path: `/index.html` $\rightarrow$ HTTP Response Code: `200` (handles React SPA routing).
5. Deploy distribution. You will receive a distribution URL like `https://d123456abcdef.cloudfront.net`.

---

## Part 3: Razorpay Payment Gateway & Webhook Setup

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings** $\rightarrow$ **API Keys** $\rightarrow$ Generate your **Key ID** and **Key Secret**.
3. Configure Webhooks:
   - Navigate to **Settings** $\rightarrow$ **Webhooks** $\rightarrow$ **Add New Webhook**.
   - **Webhook URL**: `https://api.foodieflow.campus.edu/api/v1/payments/webhook`
   - **Secret**: Copy and add to `RAZORPAY_WEBHOOK_SECRET` in `.env`.
   - **Active Events**:
     - `payment.captured`
     - `order.paid`
4. Test the flow:
   - Make a test payment via UPI or Cards.
   - Verify that webhook updates order state to `PREPARING` in real-time.
