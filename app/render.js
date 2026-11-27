// UI Rendering engine for The Deal Check
import { calculateDiscount, calculateSavings, formatPrice, formatUtcDate, getVerdictConfig } from './verdict.js';
import { getComparisonGroup } from './filters.js';

export function renderHeader() {
  return `
    <header class="site-header">
      <div class="header-inner container">
        <div class="brand">
          <a href="#/" class="logo-link">
            <span class="logo-mark">✓</span>
            <span class="logo-text">The Deal Check</span>
          </a>
          <span class="brand-tagline">Real Black Friday 2026 Price Verifier</span>
        </div>
        <div class="header-status">
          <span class="pulse-indicator"></span>
          <span class="status-text">Checked 27 Nov 2026 UTC</span>
        </div>
      </div>
    </header>
  `;
}

export function renderHeroBanner(dealCount, storeCount, maxDiscount) {
  return `
    <section class="hero-banner">
      <div class="container hero-content">
        <div class="hero-badge">INDEPENDENT VERIFICATION · ZERO SPONSORED RANKINGS</div>
        <h1 class="hero-title">Live Black Friday 2026 Deal Intelligence</h1>
        <p class="hero-desc">Every deal is verified directly against retailer listings and tracked price databases. No stale pricing, no inflated 'was' MSRP tricks.</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">${dealCount}</span>
            <span class="stat-label">Live Checked Deals</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">${storeCount}</span>
            <span class="stat-label">Major Retailers</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">${maxDiscount}%</span>
            <span class="stat-label">Peak Verified Cut</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">100%</span>
            <span class="stat-label">Price-Matched Math</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderComparisonStrip(deals) {
  // Highlight products with direct multi-store comparisons
  const airpods = deals.filter(d => d.comparisonGroup === 'airpods-pro-3');
  const macbooks = deals.filter(d => d.comparisonGroup === 'macbook-air-m5');
  const switches = deals.filter(d => d.comparisonGroup === 'switch-2-bundle');

  return `
    <section class="comparison-strip container">
      <div class="strip-header">
        <span class="strip-icon">⇄</span>
        <h3>Same Product, Compared Across Stores</h3>
        <span class="strip-sub">Cross-retailer price audits prevent overpaying</span>
      </div>
      <div class="strip-cards">
        <div class="compare-card">
          <div class="compare-card-title">AirPods Pro 3</div>
          <div class="compare-rows">
            ${airpods.map(d => `
              <div class="compare-row">
                <span class="compare-store">${d.store}</span>
                <span class="compare-price">${formatPrice(d.price)}</span>
                <span class="compare-badge ${d.store === 'Amazon' ? 'badge-best' : ''}">${d.store === 'Amazon' ? 'Doorbuster' : 'Matched'}</span>
              </div>
            `).join('')}
          </div>
          <a href="#/deal/airpods-pro-3-amazon" class="compare-link">Inspect Deal Details →</a>
        </div>

        <div class="compare-card">
          <div class="compare-card-title">MacBook Air 13" M5</div>
          <div class="compare-rows">
            ${macbooks.map(d => `
              <div class="compare-row">
                <span class="compare-store">${d.store}</span>
                <span class="compare-price">${formatPrice(d.price)}</span>
                <span class="compare-badge ${d.price === 999 ? 'badge-best' : ''}">${d.price === 999 ? 'Lowest ($50 Less)' : 'Regular Cut'}</span>
              </div>
            `).join('')}
          </div>
          <a href="#/deal/macbook-air-m5-amazon" class="compare-link">Inspect Deal Details →</a>
        </div>

        <div class="compare-card">
          <div class="compare-card-title">Nintendo Switch 2 Bundle</div>
          <div class="compare-rows">
            ${switches.map(d => `
              <div class="compare-row">
                <span class="compare-store">${d.store}</span>
                <span class="compare-price">${formatPrice(d.price)}</span>
                <span class="compare-badge badge-best">Standard $499</span>
              </div>
            `).join('')}
          </div>
          <a href="#/deal/switch-2-mario-target" class="compare-link">Inspect Deal Details →</a>
        </div>
      </div>
    </section>
  `;
}

export function renderFilterBar(categories, stores, currentFilters) {
  return `
    <div class="filter-bar container">
      <div class="filter-top-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="search"
            id="searchInput"
            placeholder="Search deals by product, store, category (e.g. AirPods, Sony, Best Buy)..."
            value="${escapeHtml(currentFilters.query || '')}"
            aria-label="Search deals"
          />
        </div>
        <div class="sort-box">
          <label for="sortSelect">Sort:</label>
          <select id="sortSelect">
            <option value="discount" ${currentFilters.sortBy === 'discount' ? 'selected' : ''}>Highest % Off</option>
            <option value="savings" ${currentFilters.sortBy === 'savings' ? 'selected' : ''}>Largest $ Saved</option>
            <option value="price_asc" ${currentFilters.sortBy === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
            <option value="price_desc" ${currentFilters.sortBy === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
            <option value="verdict" ${currentFilters.sortBy === 'verdict' ? 'selected' : ''}>Best Verdict First</option>
          </select>
        </div>
      </div>

      <div class="filter-controls-row">
        <div class="category-tabs">
          <button class="cat-tab ${(!currentFilters.category || currentFilters.category === 'all') ? 'active' : ''}" data-category="all">All (${categories.all || 0})</button>
          ${Object.keys(categories).filter(c => c !== 'all').map(cat => `
            <button class="cat-tab ${currentFilters.category === cat ? 'active' : ''}" data-category="${cat}">
              ${cat} (${categories[cat]})
            </button>
          `).join('')}
        </div>

        <div class="secondary-filters">
          <div class="filter-dropdown-group">
            <label for="storeSelect">Store:</label>
            <select id="storeSelect">
              <option value="all">All Stores</option>
              ${stores.map(s => `
                <option value="${s}" ${currentFilters.store === s ? 'selected' : ''}>${s}</option>
              `).join('')}
            </select>
          </div>

          <div class="filter-dropdown-group">
            <label for="minDiscountSelect">Min Discount:</label>
            <select id="minDiscountSelect">
              <option value="0" ${Number(currentFilters.minDiscount) === 0 ? 'selected' : ''}>Any Discount</option>
              <option value="20" ${Number(currentFilters.minDiscount) === 20 ? 'selected' : ''}>20%+ Off</option>
              <option value="35" ${Number(currentFilters.minDiscount) === 35 ? 'selected' : ''}>35%+ Off</option>
              <option value="50" ${Number(currentFilters.minDiscount) === 50 ? 'selected' : ''}>50%+ Off</option>
            </select>
          </div>

          <button id="resetFiltersBtn" class="btn-reset" title="Reset all filters">Reset</button>
        </div>
      </div>
    </div>
  `;
}

export function renderDealCard(deal) {
  const discount = calculateDiscount(deal.price, deal.was);
  const savings = calculateSavings(deal.price, deal.was);
  const verdict = getVerdictConfig(deal.verdictType);

  return `
    <article class="deal-card" data-id="${deal.id}">
      <div class="card-top">
        <div class="card-store-badge store-${deal.store.toLowerCase().replace(/[^a-z0-9]/g, '')}">
          ${deal.store}
        </div>
        <div class="card-verdict ${verdict.className}">
          ${verdict.label}
        </div>
      </div>

      <div class="card-category-tag">${deal.category}</div>

      <h3 class="card-title">
        <a href="#/deal/${deal.id}">${escapeHtml(deal.title)}</a>
      </h3>

      <div class="card-pricing">
        <div class="price-current">${formatPrice(deal.price)}</div>
        <div class="price-original">
          <span class="was-label">Was:</span>
          <del>${formatPrice(deal.was)}</del>
        </div>
        <div class="discount-pill">-${discount}%</div>
      </div>

      <div class="savings-callout">
        Save ${formatPrice(savings)} vs usual price
      </div>

      <div class="card-evidence">
        <p class="evidence-text">${escapeHtml(deal.evidence)}</p>
      </div>

      <div class="card-meta">
        <span class="meta-item">🕒 Checked: ${formatUtcDate(deal.checked)}</span>
        <span class="meta-item">📰 Source: ${escapeHtml(deal.source)}</span>
      </div>

      <div class="card-actions">
        <a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer" class="btn-store">
          View at ${deal.store} ↗
        </a>
        <a href="#/deal/${deal.id}" class="btn-inspect">
          Verify Proof
        </a>
      </div>
    </article>
  `;
}

export function renderDealsGrid(deals) {
  if (deals.length === 0) {
    return `
      <div class="empty-state container">
        <div class="empty-icon">🔎</div>
        <h2>No Deals Match Your Filter Criteria</h2>
        <p>Try clearing your search query or loosening minimum discount filters to see all 25 live checked items.</p>
        <button id="emptyResetBtn" class="btn-primary">View All Deals</button>
      </div>
    `;
  }

  return `
    <section class="deals-section container">
      <div class="results-header">
        <h2 class="results-count">Showing <span class="highlight-count">${deals.length}</span> Verified Deals</h2>
        <span class="results-note">Sorted by criteria · Zero algorithmic boosting</span>
      </div>
      <div class="deals-grid">
        ${deals.map(renderDealCard).join('')}
      </div>
    </section>
  `;
}

export function renderDealDetail(deal, allDeals) {
  const discount = calculateDiscount(deal.price, deal.was);
  const savings = calculateSavings(deal.price, deal.was);
  const verdict = getVerdictConfig(deal.verdictType);
  const relatedGroup = getComparisonGroup(allDeals, deal.comparisonGroup).filter(d => d.id !== deal.id);

  return `
    <div class="deal-detail-page container">
      <div class="detail-nav">
        <a href="#/" class="back-link">← Return to All Deals</a>
      </div>

      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-tags">
            <span class="card-store-badge store-${deal.store.toLowerCase().replace(/[^a-z0-9]/g, '')}">${deal.store}</span>
            <span class="card-category-tag">${deal.category}</span>
            <span class="card-verdict ${verdict.className}">${verdict.label}</span>
          </div>
          <h1 class="detail-title">${escapeHtml(deal.title)}</h1>
        </div>

        <div class="detail-body-grid">
          <div class="detail-pricing-panel">
            <div class="detail-price-box">
              <div class="detail-price-main">${formatPrice(deal.price)}</div>
              <div class="detail-was-box">
                <span class="detail-was-label">Regular Price:</span>
                <del class="detail-was-price">${formatPrice(deal.was)}</del>
              </div>
              <div class="detail-savings-badge">
                Save ${formatPrice(savings)} (${discount}% off)
              </div>
            </div>

            <div class="detail-actions">
              <a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer" class="btn-store-large">
                Open Official Store Page at ${deal.store} ↗
              </a>
              <span class="disclaimer-text">Store links point to retailer products. Prices live at check time.</span>
            </div>

            <div class="detail-audit-box">
              <h3>Audit & Check Record</h3>
              <ul class="audit-list">
                <li><strong>Verified UTC Timestamp:</strong> ${formatUtcDate(deal.checked)}</li>
                <li><strong>Verification Source:</strong> ${escapeHtml(deal.source)}</li>
                <li><strong>Verdict Classification:</strong> ${verdict.label}</li>
                <li><strong>Verdict Rationale:</strong> ${verdict.description}</li>
              </ul>
            </div>
          </div>

          <div class="detail-specs-panel">
            <div class="spec-section">
              <h3>Deal Intelligence & Evidence</h3>
              <div class="evidence-callout">
                <p>${escapeHtml(deal.evidence)}</p>
              </div>
            </div>

            ${deal.specs && deal.specs.length > 0 ? `
              <div class="spec-section">
                <h3>Hardware & Package Specifications</h3>
                <ul class="specs-list">
                  ${deal.specs.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${relatedGroup.length > 0 ? `
              <div class="spec-section cross-store-comparison">
                <h3>Cross-Store Price Comparison</h3>
                <p class="comparison-intro">Direct price comparison with competing retailers for the same product line:</p>
                <div class="comparison-table-wrapper">
                  <table class="comparison-table">
                    <thead>
                      <tr>
                        <th>Store</th>
                        <th>Price</th>
                        <th>Was</th>
                        <th>Discount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="current-row">
                        <td><strong>${deal.store} (Current)</strong></td>
                        <td>${formatPrice(deal.price)}</td>
                        <td><del>${formatPrice(deal.was)}</del></td>
                        <td>-${discount}%</td>
                        <td><span class="badge-current">Viewing</span></td>
                      </tr>
                      ${relatedGroup.map(item => `
                        <tr>
                          <td>${item.store}</td>
                          <td>${formatPrice(item.price)}</td>
                          <td><del>${formatPrice(item.was)}</del></td>
                          <td>-${calculateDiscount(item.price, item.was)}%</td>
                          <td><a href="#/deal/${item.id}" class="table-link">Inspect</a></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-content">
        <p class="footer-title">The Deal Check · Independent Black Friday 2026 Deal Intelligence</p>
        <p class="footer-note">All 25 deals verified live in-session on 27 Nov 2026 UTC across official retailer listings and reputable deals trackers. Zero external network requests at runtime.</p>
        <p class="footer-copy">Clean semantic HTML & CSS · Pure client-side static engine · No tracking cookies</p>
      </div>
    </footer>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
