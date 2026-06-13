import axios from "axios";
import { env } from "../config/env.js";

export const httpClient = axios.create({
    baseURL: env.EVENT_SERVICE_URL,
    timeout: 5000,
});

export type HttpClient = typeof httpClient;
