from datetime import datetime
from typing import Dict, Any

def generate_receipt_html(order: Dict[str, Any]) -> str:
    """
    Generates an official, printable cafeteria tax invoice & pickup receipt HTML document.
    """
    order_id = order.get("orderId", "ORD-UNKNOWN")
    token_number = order.get("tokenNumber", "FF-000")
    customer_name = order.get("customerName", "Student")
    student_id = order.get("studentId", "N/A")
    phone = order.get("phone", "N/A")
    notes = order.get("notes", "")
    items = order.get("items", [])
    subtotal = float(order.get("subtotal", 0.0))
    tax = float(order.get("tax", 0.0))
    amount = float(order.get("amount", 0.0))
    created_at = order.get("createdAt", datetime.now().isoformat())
    
    try:
        formatted_date = datetime.fromisoformat(created_at).strftime("%d %b %Y, %I:%M %p")
    except Exception:
        formatted_date = str(created_at)

    items_rows = ""
    for idx, item in enumerate(items, 1):
        title = item.get("title", f"Item #{item.get('menuItemId', idx)}")
        qty = item.get("quantity", 1)
        unit_price = item.get("unitPrice", 0.0)
        total_price = item.get("totalPrice", qty * unit_price)
        items_rows += f"""
        <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">{idx}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">{title}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">{qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹{unit_price:.2f}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">₹{total_price:.2f}</td>
        </tr>
        """

    notes_html = f"""
    <div style="margin-top: 14px; padding: 10px; background: #fff7ed; border-left: 4px solid #ea580c; font-size: 12px; color: #9a3412;">
        <strong>Kitchen Instructions:</strong> {notes}
    </div>
    """ if notes else ""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt_{order_id}</title>
    <style>
        @media print {{
            body {{ margin: 0; padding: 0; background: white; }}
            .no-print {{ display: none !important; }}
            .receipt-container {{ box-shadow: none !important; border: none !important; width: 100% !important; }}
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 30px 15px;
            display: flex;
            justify-content: center;
        }}
        .receipt-container {{
            background: #ffffff;
            width: 600px;
            max-width: 100%;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            color: white;
            padding: 24px 28px;
            text-align: center;
        }}
        .token-box {{
            background: #fff7ed;
            border: 2px dashed #fdba74;
            border-radius: 12px;
            padding: 14px;
            margin: 20px 28px;
            text-align: center;
        }}
        .print-btn {{
            background: #0f172a;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
            font-size: 13px;
        }}
        .print-btn:hover {{ background: #1e293b; }}
    </style>
</head>
<body>
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div class="no-print" style="margin-bottom: 16px;">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="receipt-container">
            <!-- Header -->
            <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">FoodieFlow Cafeteria</h1>
                <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Campus Express Dining • Tax Invoice & Counter Receipt</p>
                <p style="margin: 2px 0 0; font-size: 11px; opacity: 0.75;">GSTIN: 07AAAAA0000A1Z5 | Counter #2 Express Pickup</p>
            </div>

            <!-- Token Number Highlight -->
            <div class="token-box">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #ea580c; display: block;">Pickup Token Number</span>
                <span style="font-size: 38px; font-weight: 900; font-family: monospace; color: #0f172a; line-height: 1.2;">{token_number}</span>
                <span style="font-size: 11px; color: #9a3412; display: block; margin-top: 4px;">Present this token at Counter #2 when ready</span>
            </div>

            <div style="padding: 0 28px 24px;">
                <!-- Order & Student Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 16px;">
                    <div>
                        <span style="color: #64748b; display: block;">Order Reference:</span>
                        <strong style="font-family: monospace; color: #0f172a;">{order_id}</strong>
                    </div>
                    <div>
                        <span style="color: #64748b; display: block;">Date & Time:</span>
                        <strong style="color: #0f172a;">{formatted_date}</strong>
                    </div>
                    <div>
                        <span style="color: #64748b; display: block;">Student Details:</span>
                        <strong style="color: #0f172a;">{customer_name} ({student_id})</strong>
                    </div>
                    <div>
                        <span style="color: #64748b; display: block;">Payment Status:</span>
                        <span style="color: #16a34a; font-weight: 700;">● PAID via Razorpay (Verified)</span>
                    </div>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">
                            <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #cbd5e1;">#</th>
                            <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #cbd5e1;">Item Description</th>
                            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #cbd5e1;">Qty</th>
                            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #cbd5e1;">Rate</th>
                            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #cbd5e1;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_rows}
                    </tbody>
                </table>

                <!-- Financial Calculation -->
                <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
                        <span>Items Subtotal:</span>
                        <span style="font-family: monospace; font-weight: 600; color: #334155;">₹{subtotal:.2f}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
                        <span>Cafeteria GST & Eco-Packaging (5%):</span>
                        <span style="font-family: monospace; font-weight: 600; color: #334155;">₹{tax:.2f}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 2px solid #0f172a; font-size: 15px; font-weight: 900; color: #0f172a;">
                        <span>Total Paid:</span>
                        <span style="font-family: monospace; color: #ea580c;">₹{amount:.2f}</span>
                    </div>
                </div>

                {notes_html}

                <!-- Security Verification Seal -->
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8;">
                    <p style="margin: 0;">🔒 Digitally generated via Razorpay 256-bit encrypted checkout.</p>
                    <p style="margin: 4px 0 0;">Thank you for dining at FoodieFlow Campus Cafeteria!</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""
    return html
