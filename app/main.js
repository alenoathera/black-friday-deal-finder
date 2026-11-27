// Client application bootstrap and hash router for The Deal Check
import { deals } from './deals.js';
import { filterDeals } from './filters.js';
import { calculateDiscount } from './verdict.js';
import {
  renderHeader,
  renderHeroBanner,
  renderComparisonStrip,
  renderFilterBar,
  renderDealsGrid,
  renderDealDetail,
  renderFooter
} from './render.js';

// Application state
const state = {
  query: '',
  category: 'all',
  store: 'all',
  minDiscount: 0,
  sortBy: 'discount'
};

// Compute categories and stores
const categories = { all: deals.length };
deals.forEach(d => {
  categories[d.category] = (categories[d.category] || 0) + 1;
});

const stores = Array.from(new Set(deals.map(d => d.store))).sort();
const maxDiscount = Math.max(...deals.map(d => calculateDiscount(d.price, d.was)));

function parseHash() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/deal/')) {
    const dealId = hash.replace('#/deal/', '').trim();
    return { view: 'detail', dealId };
  }

  if (hash.startsWith('#/filter?')) {
    const searchParams = new URLSearchParams(hash.slice('#/filter?'.length));
    if (searchParams.has('q')) state.query = searchParams.get('q') || '';
    if (searchParams.has('category')) state.category = searchParams.get('category') || 'all';
    if (searchParams.has('store')) state.store = searchParams.get('store') || 'all';
    if (searchParams.has('minDiscount')) state.minDiscount = Number(searchParams.get('minDiscount')) || 0;
    if (searchParams.has('sort')) state.sortBy = searchParams.get('sort') || 'discount';
    return { view: 'list' };
  }

  return { view: 'list' };
}

function updateUrlParams() {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.category && state.category !== 'all') params.set('category', state.category);
  if (state.store && state.store !== 'all') params.set('store', state.store);
  if (state.minDiscount > 0) params.set('minDiscount', String(state.minDiscount));
  if (state.sortBy !== 'discount') params.set('sort', state.sortBy);

  const queryString = params.toString();
  const targetHash = queryString ? `#/filter?${queryString}` : '#/';
  if (window.location.hash !== targetHash) {
    history.replaceState(null, '', targetHash);
  }
}

function render() {
  const root = document.getElementById('app');
  if (!root) return;

  const route = parseHash();

  if (route.view === 'detail') {
    const targetDeal = deals.find(d => d.id === route.dealId);
    if (targetDeal) {
      root.innerHTML = `
        ${renderHeader()}
        <main id="main-content">
          ${renderDealDetail(targetDeal, deals)}
        </main>
        ${renderFooter()}
      `;
      setupEventListeners();
      window.__shotReady = true;
      return;
    }
  }

  // List view
  const filteredDeals = filterDeals(deals, state);

  root.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      ${renderHeroBanner(deals.length, stores.length, maxDiscount)}
      ${renderComparisonStrip(deals)}
      ${renderFilterBar(categories, stores, state)}
      ${renderDealsGrid(filteredDeals)}
    </main>
    ${renderFooter()}
  `;

  setupEventListeners();
  window.__shotReady = true;
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.query = e.target.value;
      updateUrlParams();
      render();
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      updateUrlParams();
      render();
    });
  }

  const catTabs = document.querySelectorAll('.cat-tab');
  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      state.category = tab.getAttribute('data-category');
      updateUrlParams();
      render();
    });
  });

  const storeSelect = document.getElementById('storeSelect');
  if (storeSelect) {
    storeSelect.addEventListener('change', (e) => {
      state.store = e.target.value;
      updateUrlParams();
      render();
    });
  }

  const minDiscountSelect = document.getElementById('minDiscountSelect');
  if (minDiscountSelect) {
    minDiscountSelect.addEventListener('change', (e) => {
      state.minDiscount = Number(e.target.value) || 0;
      updateUrlParams();
      render();
    });
  }

  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetFilters();
    });
  }

  const emptyResetBtn = document.getElementById('emptyResetBtn');
  if (emptyResetBtn) {
    emptyResetBtn.addEventListener('click', () => {
      resetFilters();
    });
  }
}

function resetFilters() {
  state.query = '';
  state.category = 'all';
  state.store = 'all';
  state.minDiscount = 0;
  state.sortBy = 'discount';
  updateUrlParams();
  render();
}

window.addEventListener('hashchange', () => {
  render();
});

// Boot app
window.addEventListener('DOMContentLoaded', () => {
  render();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  render();
}
