// Verdict calculation and badge formatting for The Deal Check
// Provides transparent criteria:
// - NEW LOW: Documented all-time record low price supported by reputable trackers
// - STRONG PRICE: Substantial discount (>= 30% or >= $100) beating routine retailer promotions
// - ROUTINE SALE: Modest markdown (< 25% or inflated reference "comp value")

export function calculateDiscount(price, was) {
  if (!was || was <= 0 || price >= was) return 0;
  return Math.round(((was - price) / was) * 100);
}

export function calculateSavings(price, was) {
  if (!was || was <= price) return 0;
  return Math.round((was - price) * 100) / 100;
}

export function formatPrice(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatUtcDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  } catch {
    return isoString;
  }
}

export function getVerdictConfig(verdictType) {
  switch (verdictType) {
    case 'NEW LOW':
      return {
        label: 'NEW ALL-TIME LOW',
        className: 'badge-new-low',
        score: 3,
        description: 'Verified lowest historical price tracked at major retailers.'
      };
    case 'STRONG PRICE':
      return {
        label: 'STRONG DEAL',
        className: 'badge-strong-price',
        score: 2,
        description: 'Deep holiday markdown beating regular store promotions.'
      };
    case 'ROUTINE SALE':
    default:
      return {
        label: 'ROUTINE SALE',
        className: 'badge-routine-sale',
        score: 1,
        description: 'Modest price cut; verify if usual price was recently raised.'
      };
  }
}
