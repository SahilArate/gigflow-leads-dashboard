"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111111",
              color: "#ffffff",
              border: "1px solid #333333",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#ffffff", secondary: "#000000" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            },
          }}
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}