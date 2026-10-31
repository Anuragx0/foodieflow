/**
 * Helper to download or print official cafeteria tax invoice receipt
 * @param {string} orderId
 * @param {boolean} directDownload - if true triggers file download, else opens print view
 */
export const downloadOrderReceipt = (orderId, directDownload = true) => {
  if (!orderId) return;

  if (directDownload) {
    // Create an invisible link to trigger immediate file download
    const link = document.createElement('a');
    link.href = `/api/v1/orders/${encodeURIComponent(orderId)}/receipt/download`;
    link.setAttribute('download', `FoodieFlow_Receipt_${orderId}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Open in a new tab for instant browser printing / Save to PDF
    window.open(`/api/v1/orders/${encodeURIComponent(orderId)}/receipt`, '_blank');
  }
};
