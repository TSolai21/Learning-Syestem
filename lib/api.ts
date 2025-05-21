import axios from "axios"

export const api = axios.create({
  baseURL: "https://lms-be-sqpa.onrender.com/api",
})

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle errors globally
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

