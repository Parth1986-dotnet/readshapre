import AxiosConfig from "../axiosConfig"; // make sure path matches your folder structure

const API_URL = "/api/orders"; // relative to baseURL in AxiosConfig

export const placeOrder = async (orderItems) => {
  try {
    const payload = { items: orderItems };
    const response = await AxiosConfig.post(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};
