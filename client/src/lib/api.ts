import { Report } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export interface PredictPayload {
    model: string;
    tuning: string;
    input: number[];
}

export class ApiError extends Error {
    status: number;
    constructor(status: number) {
        super(`Server responded with ${status}`);
        this.status = status;
    }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, options);
    if (!response.ok) {
        throw new ApiError(response.status);
    }
    return response.json() as Promise<T>;
}

export function fetchPrediction(payload: PredictPayload) {
    return request<{ prediction: number[] }>("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export function fetchEvaluation() {
    return request<{ [key: string]: Report }>("/evaluate");
}
