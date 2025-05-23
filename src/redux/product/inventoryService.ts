import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class InventoryService {
  async getLowStockProducts(threshold: number = 10) {
    const response = await axios.get(
      `${API_URL}/products/low-stock?threshold=${threshold}`
    );
    return response.data;
  }

  async updateStockLevel(productId: number, quantity: number) {
    const response = await axios.patch(
      `${API_URL}/products/${productId}/stock`,
      { quantity }
    );
    return response.data;
  }

  async getStockAlerts() {
    const response = await axios.get(`${API_URL}/products/stock-alerts`);
    return response.data;
  }

  async setStockAlert(productId: number, threshold: number) {
    const response = await axios.post(
      `${API_URL}/products/${productId}/stock-alert`,
      { threshold }
    );
    return response.data;
  }
}

export default new InventoryService();
