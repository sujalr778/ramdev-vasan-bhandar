"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { LocationProvider } from "@/context/LocationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocationProvider>
        <CompareProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CompareProvider>
      </LocationProvider>
    </SessionProvider>
  );
}
