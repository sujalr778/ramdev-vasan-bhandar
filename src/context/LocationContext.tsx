"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDeliveryTier, SuratDeliveryTier } from "@/lib/delivery";

interface LocationContextType {
  pincode: string;
  deliveryTier: SuratDeliveryTier;
  setPincode: (code: string) => void;
  clearPincode: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const defaultTier = getDeliveryTier("");

const LocationContext = createContext<LocationContextType>({
  pincode: "",
  deliveryTier: defaultTier,
  setPincode: () => {},
  clearPincode: () => {},
  isModalOpen: false,
  setIsModalOpen: () => {},
});

const STORAGE_KEY = "ramdev_user_pincode";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [pincode, setPincodeState] = useState<string>("");
  const [deliveryTier, setDeliveryTier] = useState<SuratDeliveryTier>(defaultTier);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
        setPincodeState(saved);
        setDeliveryTier(getDeliveryTier(saved));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const setPincode = (code: string) => {
    const clean = (code || "").trim();
    setPincodeState(clean);
    const tier = getDeliveryTier(clean);
    setDeliveryTier(tier);

    try {
      if (clean) {
        localStorage.setItem(STORAGE_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  };

  const clearPincode = () => {
    setPincodeState("");
    setDeliveryTier(getDeliveryTier(""));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <LocationContext.Provider
      value={{
        pincode,
        deliveryTier,
        setPincode,
        clearPincode,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}

