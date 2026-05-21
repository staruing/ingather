import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function externalLinkProps() {
  return {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };
}
