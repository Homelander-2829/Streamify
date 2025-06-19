import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5001/api", // Set the base URL for the API
    withCredentials: true, //send cookies with the request
})
