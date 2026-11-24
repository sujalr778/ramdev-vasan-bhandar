


export function formatINR(price: number | string | undefined | null): string {
  if (price === undefined || price === null || price === '') return '₹0';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function calculateDiscount(originalPrice?: number, currentPrice?: number): number {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}




