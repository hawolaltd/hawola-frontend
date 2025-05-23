import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class CustomerServiceService {
  async getFAQs() {
    const response = await axios.get(`${API_URL}/customer-service/faqs`);
    return response.data;
  }

  async submitSupportTicket(data: any) {
    const response = await axios.post(
      `${API_URL}/customer-service/tickets`,
      data
    );
    return response.data;
  }

  async getTicketStatus(ticketId: string) {
    const response = await axios.get(
      `${API_URL}/customer-service/tickets/${ticketId}`
    );
    return response.data;
  }

  async submitFeedback(data: any) {
    const response = await axios.post(
      `${API_URL}/customer-service/feedback`,
      data
    );
    return response.data;
  }

  async getReturnRequests() {
    const response = await axios.get(`${API_URL}/customer-service/returns`);
    return response.data;
  }

  async submitReturnRequest(data: any) {
    const response = await axios.post(
      `${API_URL}/customer-service/returns`,
      data
    );
    return response.data;
  }
}

export default new CustomerServiceService();
