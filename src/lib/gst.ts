export interface GSTConfig {
  storeGstin: string;
  storeLegalName: string;
  storeAddress: string;
  storeState: string;
  storeStateCode: string;
  invoicePrefix: string;
}

export function getStoreGSTConfig(): GSTConfig {
  return {
    storeGstin: process.env.STORE_GSTIN || "24AAAAA0000A1Z5",
    storeLegalName: process.env.STORE_LEGAL_NAME || "Ramdev Vasan Bhandar",
    storeAddress: process.env.STORE_ADDRESS || "Shop No. 12, Bartan Bazaar, Relief Road, Ahmedabad, Gujarat - 380001",
    storeState: process.env.STORE_STATE || "Gujarat",
    storeStateCode: process.env.STORE_STATE_CODE || "24",
    invoicePrefix: process.env.INVOICE_PREFIX || "RVB",
  };
}

export interface GSTBreakdown {
  taxableAmount: number;
  gstRate: number; // e.g. 18
  cgstRate: number; // e.g. 9
  sgstRate: number; // e.g. 9
  igstRate: number; // e.g. 18 or 0
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  isInterstate: boolean;
}

export function calculateOrderGST({
  subtotal,
  discount = 0,
  customerState = "Gujarat",
}: {
  subtotal: number;
  discount?: number;
  customerState?: string;
}): GSTBreakdown {
  const config = getStoreGSTConfig();
  const taxableAmount = Math.max(0, subtotal - discount);

  const cleanCustomerState = (customerState || "Gujarat").trim();
  const isInterstate = cleanCustomerState.toLowerCase() !== config.storeState.toLowerCase();

  const gstRate = 18;

  if (isInterstate) {
    const igstAmount = Math.round(taxableAmount * (gstRate / 100) * 100) / 100;
    return {
      taxableAmount,
      gstRate,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalTax: igstAmount,
      isInterstate: true,
    };
  } else {
    const cgstRate = 9;
    const sgstRate = 9;
    const cgstAmount = Math.round(taxableAmount * (cgstRate / 100) * 100) / 100;
    const sgstAmount = Math.round(taxableAmount * (sgstRate / 100) * 100) / 100;
    return {
      taxableAmount,
      gstRate,
      cgstRate,
      sgstRate,
      igstRate: 0,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalTax: cgstAmount + sgstAmount,
      isInterstate: false,
    };
  }
}
