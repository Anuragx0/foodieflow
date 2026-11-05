# FoodieFlow: Post-Deployment Next Steps & Operational Guidance

This document is for the phase **immediately after** you have completed the base installation steps from `DEPLOYMENT_GUIDE.md` (EC2 Backend + S3/CloudFront Frontend + Razorpay configuration).

---

## Current Status & What Was Just Configured

1. **Frontend `.env` Created** ([frontend/.env](file:///c:/Users/anura/OneDrive/Desktop/Mini%20Project(FoodieFlow)/frontend/.env)):
   - Configured with `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID`.
   - Built with detailed inline comments explaining multi-domain vs. unified CloudFront setups.

2. **Frontend Dynamic API Integration Complete**:
   - Created [frontend/src/utils/api.js](file:///c:/Users/anura/OneDrive/Desktop/Mini%20Project(FoodieFlow)/frontend/src/utils/api.js).
   - All network calls (`fetch`) across Menu, Orders, Checkout, Razorpay Payment, Admin, and Receipt generation now automatically respect `VITE_API_URL`.
   - **Zero deployment errors**: If `VITE_API_URL` is set, calls reach your EC2 backend across domains. If empty, it safely falls back to relative paths for local dev and single-domain reverse proxying.

---

## 5 Essential Steps to Finalize Your Deployment

### Step 1: Re-Build and Re-Deploy Frontend to S3 & CloudFront

Because Vite embeds `VITE_*` environment variables into the compiled static JavaScript bundle at **build time**, any change to `.env` requires a rebuild and S3 sync:

1. **Configure your actual EC2 domain or IP in [frontend/.env](file:///c:/Users/anura/OneDrive/Desktop/Mini%20Project(FoodieFlow)/frontend/.env)**:
   ```ini
   VITE_API_URL=https://api.foodieflow.campus.edu
   # (Or http://<YOUR_EC2_PUBLIC_IP> if SSL is not yet active)
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
   ```

2. **Run production build**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Upload the fresh build to Amazon S3**:
   ```bash
   # Sync static assets with 1-year cache headers
   aws s3 sync dist/ s3://<YOUR_S3_BUCKET_NAME> \
     --delete \
     --cache-control "max-age=31536000,public" \
     --exclude "index.html"

   # Upload index.html with no-cache so browsers always fetch newest bundle
   aws s3 cp dist/index.html s3://<YOUR_S3_BUCKET_NAME>/index.html \
     --cache-control "no-cache, no-store, must-revalidate"
   ```

4. **Invalidate CloudFront Cache**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id <YOUR_CLOUDFRONT_DISTRIBUTION_ID> \
     --paths "/*"
   ```

---

### Step 2: Verify Backend CORS Origins on EC2

To avoid `CORS header 'Access-Control-Allow-Origin' missing` errors in the browser:

1. SSH into your EC2 instance:
   ```bash
   ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
   ```

2. Open `/home/ubuntu/foodieflow/backend/.env`:
   ```bash
   nano /home/ubuntu/foodieflow/backend/.env
   ```

3. Ensure `CORS_ORIGINS` includes your CloudFront distribution URL and custom domain:
   ```ini
   CORS_ORIGINS=["https://<YOUR_DISTRIBUTION_ID>.cloudfront.net","https://foodieflow.campus.edu","http://localhost:3000"]
   ```

4. Restart the backend service:
   ```bash
   sudo systemctl restart foodieflow
   sudo systemctl status foodieflow
   ```

---

### Step 3: End-to-End Verification Checklist

Run these sanity checks to ensure full system health:

| Component | Test Action | Expected Result |
| :--- | :--- | :--- |
| **Backend Health** | `curl -I https://api.foodieflow.campus.edu/health` | `HTTP/1.1 200 OK` |
| **Backend API** | `curl https://api.foodieflow.campus.edu/api/v1/menu` | JSON payload containing menu items |
| **Frontend CDN** | Open `https://<YOUR_DISTRIBUTION_ID>.cloudfront.net` | App loads instant dark/light UI |
| **Browser Console** | Press `F12` $\rightarrow$ Console tab | No red CORS or 404 errors |
| **Cart & Order Flow** | Add item $\rightarrow$ Checkout $\rightarrow$ Submit | Order created, Razorpay modal opens |
| **Live Webhook** | Trigger payment $\rightarrow$ Check Razorpay Dashboard | Webhook delivery reports status `200` |
| **Admin Panel** | Click Admin icon $\rightarrow$ PIN: `admin123` | Real-time kitchen board & stats display |

---

### Step 4: (Optional Pro Tip) Zero-CORS CloudFront Routing

If you want the cleanest possible architecture where students access everything through **one single domain** (e.g. `https://foodieflow.campus.edu`):

1. Go to AWS CloudFront Console $\rightarrow$ **Origins** $\rightarrow$ **Create Origin**:
   - **Origin Domain**: `api.foodieflow.campus.edu` (or your EC2 public DNS).
   - **Protocol**: HTTPS only (or HTTP if testing).
   - **Name**: `EC2-FastAPI-Backend`.

2. Go to **Behaviors** $\rightarrow$ **Create Behavior**:
   - **Path Pattern**: `/api/*`
   - **Target Origin**: `EC2-FastAPI-Backend`
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - **Cache Policy**: `CachingDisabled`
   - **Origin Request Policy**: `AllViewerExceptHostHeader` (or `AllViewer`)

3. **Benefit**:
   - Requests to `/api/v1/...` are routed directly to EC2 by CloudFront.
   - You can leave `VITE_API_URL=` empty in [frontend/.env](file:///c:/Users/anura/OneDrive/Desktop/Mini%20Project(FoodieFlow)/frontend/.env).
   - Browser views everything as the same origin — completely bypassing CORS limitations.

---

### Step 5: Production Maintenance & Security Hardening

1. **Keep EC2 Ports Secure**:
   In AWS EC2 $\rightarrow$ Security Groups, ensure **only** ports `80` (HTTP), `443` (HTTPS), and `22` (SSH) are accessible from the internet. Port `8000` (FastAPI) should NOT be open to `0.0.0.0/0` — Nginx handles all public traffic.

2. **Automate SQLite Backups**:
   Set up a nightly cron job to back up the SQLite database:
   ```bash
   crontab -e
   # Add this line to backup daily at 3:00 AM:
   0 3 * * * cp /home/ubuntu/foodieflow/backend/foodieflow.db /home/ubuntu/backups/foodieflow_$(date +\%F).db
   ```

3. **Check SSL Auto-Renewal**:
   Verify Certbot renewal timer:
   ```bash
   sudo certbot renew --dry-run
   ```

4. **Monitor Live Logs During Rush Hours**:
   ```bash
   # FastAPI application logs:
   journalctl -u foodieflow -f

   # Nginx access & rate-limiting logs:
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

