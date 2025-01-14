import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getColor(value: number) {
    if (value < 0.63) {
        return "text-red-500";
    }

    if (value < 0.69) {
        return "text-yellow-500";
    }

    return "text-green-500";
}
