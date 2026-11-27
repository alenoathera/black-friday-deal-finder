// Filtering and sorting logic for The Deal Check
import { calculateDiscount, calculateSavings, getVerdictConfig } from './verdict.js';

export function filterDeals(deals, options = {}) {
  const {
    query = '',
    category = 'all',
    store = 'all',
    minDiscount = 0,
    sortBy = 'discount'
  } = options;

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = deals.filter(deal => {
    // Search query check
    if (normalizedQuery) {
      const matchTitle = deal.title.toLowerCase().includes(normalizedQuery);
      const matchStore = deal.store.toLowerCase().includes(normalizedQuery);
      const matchCat = deal.category.toLowerCase().includes(normalizedQuery);
      const matchSpecs = deal.specs && deal.specs.some(s => s.toLowerCase().includes(normalizedQuery));
      if (!matchTitle && !matchStore && !matchCat && !matchSpecs) {
        return false;
      }
    }

    // Category filter
    if (category && category !== 'all') {
      if (deal.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // Store filter
    if (store && store !== 'all') {
      if (deal.store.toLowerCase() !== store.toLowerCase()) {
        return false;
      }
    }

    // Min discount filter
    const discount = calculateDiscount(deal.price, deal.was);
    if (minDiscount > 0 && discount < minDiscount) {
      return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const discA = calculateDiscount(a.price, a.was);
    const discB = calculateDiscount(b.price, b.was);
    const savA = calculateSavings(a.price, a.was);
    const savB = calculateSavings(b.price, b.was);
    const scoreA = getVerdictConfig(a.verdictType).score;
    const scoreB = getVerdictConfig(b.verdictType).score;

    switch (sortBy) {
      case 'discount':
        return discB - discA || a.price - b.price;
      case 'savings':
        return savB - savA;
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'verdict':
        return scoreB - scoreA || discB - discA;
      default:
        return discB - discA;
    }
  });

  return filtered;
}

export function getComparisonGroup(deals, groupId) {
  if (!groupId) return [];
  return deals.filter(d => d.comparisonGroup === groupId);
}
