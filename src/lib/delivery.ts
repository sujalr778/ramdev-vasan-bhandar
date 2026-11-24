export interface ServiceabilityResult {
  serviceable: boolean;
  estimatedDays: number | null;
  message: string;
  pincode: string;
}

export interface SuratDeliveryTier {
  isSurat: boolean;
  tier: '30_MIN' | '60_MIN' | 'PAN_INDIA';
  etaMinutes: number | null;
  etaText: string;
  badgeText: string;
  areaName: string;
  serviceable: boolean;
  message: string;
}

// Surat Core Pincodes (30-Minute Rocket Delivery)
export const SURAT_CORE_PINCODES: Record<string, string> = {
  "395001": "Chowk Bazar / Old Surat",
  "395002": "Inderpura / Begampura / Ring Road",
  "395003": "Varachha / Surat RS / Mini Bazar",
  "395004": "Katargam / Gotalawadi",
  "395005": "Rander / Tadwadi",
  "395006": "Varachha Road / Hirabaugh",
  "395008": "A. K. Road / Ashwanikumar",
  "395009": "Adajan / Pal / Honey Park",
};

// Surat Outer / Extended Pincodes (45-60 Minute Express Delivery)
export const SURAT_OUTER_PINCODES: Record<string, string> = {
  "395007": "Vesu / Dumas / VIP Road",
  "395010": "Udhna / Pandesara",
  "395011": "Dindoli / Karadva",
  "395012": "Godadara / Parvat Patia",
  "395017": "Althan / Bhimrad",
  "394210": "Sachin GIDC",
  "394221": "Palsana / Kadodara",
  "394180": "Olpad / Sayan",
};

export function getDeliveryTier(pincode: string): SuratDeliveryTier {
  const cleaned = (pincode || "").trim();
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return {
      isSurat: false,
      tier: 'PAN_INDIA',
      etaMinutes: null,
      etaText: 'Standard Delivery',
      badgeText: '🚚 Express Courier',
      areaName: '',
      serviceable: false,
      message: 'Please enter a valid 6-digit Indian postal pincode.'
    };
  }

  // 1. Core Surat 30-Min Zone
  if (SURAT_CORE_PINCODES[cleaned]) {
    return {
      isSurat: true,
      tier: '30_MIN',
      etaMinutes: 30,
      etaText: 'Under 30 Minutes',
      badgeText: '⚡ 30-Min Rocket Delivery',
      areaName: SURAT_CORE_PINCODES[cleaned],
      serviceable: true,
      message: `🎉 Surat Special: 30-minute delivery unlocked to ${SURAT_CORE_PINCODES[cleaned]} (${cleaned})!`
    };
  }

  // 2. Outer Surat 60-Min Zone
  if (SURAT_OUTER_PINCODES[cleaned] || cleaned.startsWith("395") || cleaned.startsWith("394")) {
    const area = SURAT_OUTER_PINCODES[cleaned] || "Surat Greater Region";
    return {
      isSurat: true,
      tier: '60_MIN',
      etaMinutes: 60,
      etaText: 'Within 45–60 Minutes',
      badgeText: '⚡ 60-Min Express Dispatch',
      areaName: area,
      serviceable: true,
      message: `🎉 Surat Special: 60-minute express courier delivery unlocked to ${area} (${cleaned})!`
    };
  }

  // 3. Pan-India Delivery
  return {
    isSurat: false,
    tier: 'PAN_INDIA',
    etaMinutes: null,
    etaText: '2–3 Business Days',
    badgeText: '🚚 Pan-India Express',
    areaName: 'All India',
    serviceable: true,
    message: `Pan-India express delivery available to ${cleaned} (2-3 business days).`
  };
}

export function checkPincodeServiceability(pincode: string): ServiceabilityResult {
  const cleaned = (pincode || "").trim();
  
  // Validation: 6-digit Indian Pincode format (100000 - 999999)
  const isValidFormat = /^[1-9][0-9]{5}$/.test(cleaned);
  
  if (!isValidFormat) {
    return {
      serviceable: false,
      estimatedDays: null,
      message: "Please enter a valid 6-digit Indian postal pincode.",
      pincode: cleaned
    };
  }

  const tier = getDeliveryTier(cleaned);
  if (tier.isSurat) {
    return {
      serviceable: true,
      estimatedDays: 0,
      message: tier.message,
      pincode: cleaned
    };
  }

  // Sample unserviceable pincode patterns for testing (e.g., starting with '900' or ending in '999')
  if (cleaned.startsWith("900") || cleaned.endsWith("999")) {
    return {
      serviceable: false,
      estimatedDays: null,
      message: `Delivery is currently unavailable to pincode ${cleaned}.`,
      pincode: cleaned
    };
  }

  return {
    serviceable: true,
    estimatedDays: 3,
    message: `Delivery available to ${cleaned} within 2-3 business days.`,
    pincode: cleaned
  };
}

export function calculateDeliveryCharge({
  subtotal,
  pincode,
}: {
  subtotal: number;
  pincode?: string;
}) {
  const FREE_SHIPPING_THRESHOLD = 999;
  const STANDARD_DELIVERY_FEE = 99;

  const validSubtotal = Math.max(0, subtotal);

  if (validSubtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      deliveryCharge: 0,
      isFree: true,
      thresholdRemaining: 0,
      threshold: FREE_SHIPPING_THRESHOLD
    };
  }

  return {
    deliveryCharge: STANDARD_DELIVERY_FEE,
    isFree: false,
    thresholdRemaining: FREE_SHIPPING_THRESHOLD - validSubtotal,
    threshold: FREE_SHIPPING_THRESHOLD
  };
}
