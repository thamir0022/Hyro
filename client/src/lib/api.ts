import { toast } from "@/hooks/use-toast";

export async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
}

export function handleError(error: unknown) {
  console.error("Error:", error);
  toast({
    title: "Error",
    description: error instanceof Error ? error.message : "An unexpected error occurred",
    variant: "destructive",
  });
}

