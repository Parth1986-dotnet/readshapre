// ✅ src/context/OrderService.js
import axiosConfig from "../axiosConfig";

export const placeOrder = async (orderPayload) => {
  try {
    const response = await axiosConfig.post("/api/orders", orderPayload, {
      withCredentials: true, // include HttpOnly JWT cookie
    });
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error.response?.data || error.message);
    throw error;
  }
};
