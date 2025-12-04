"use client";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const toast = ({
  title,
  description,
  variant = "default",
}: Omit<Toast, "id">) => {
  // Simple console log for now - can be enhanced with a toast component later
  const message = `[${variant.toUpperCase()}] ${title}${
    description ? `: ${description}` : ""
  }`;
  console.log(message);

  // You can add a toast notification library here later
  // For now, we'll just log to console
};
