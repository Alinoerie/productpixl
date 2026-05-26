import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isStubMode() {
  return (
    !process.env.REPLICATE_API_TOKEN ||
    process.env.REPLICATE_API_TOKEN === "***" ||
    process.env.REPLICATE_API_TOKEN.includes("placeholder")
  );
}
