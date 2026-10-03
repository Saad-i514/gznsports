export const cartMarkup = `    <!-- 11. SLIDEOUT CART DRAWER -->
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping Bag">
      <div class="cart-drawer-header">
        <div>
          <span class="mono-tag" style="background:#f1f5f9; color:#b45309; border:1px solid #e2e8f0; font-weight:700;">GNZSPORTS / YOUR SELECTION</span>
          <h3 class="cart-title">YOUR BAG</h3>
        </div>
        <button class="cart-close-btn" id="cart-close-btn" aria-label="Close Cart">✕</button>
      </div>

      <div class="shipping-meter" id="shipping-meter">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="mono-tag" id="shipping-status-text">SHIPPING PROGRESS</span>
          <span class="mono-tag" id="shipping-percent-text" style="color:#b45309; font-weight:700;">0%</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" id="shipping-meter-fill" style="width: 0%;"></div>
        </div>
      </div>

      <div class="cart-items-scroll" id="cart-items-container">
        <!-- Rendered dynamically -->
      </div>

      <!-- PROMO CODE INPUT SECTION -->
      <div class="cart-promo-section">
        <div class="cart-promo-form">
          <input aria-label="Promo code" type="text" id="cart-promo-input" placeholder="PROMO CODE (e.g. CHAMPION10)" />
          <button id="cart-promo-btn" class="btn-promo-apply">APPLY</button>
        </div>
        <button id="cart-promo-remove" type="button" hidden>Remove discount</button><div id="cart-promo-status" class="cart-promo-status"></div>
      </div>

      <div class="cart-drawer-footer">
        <div class="cart-totals-breakdown">
          <div class="totals-row">
            <span>SUBTOTAL:</span>
            <span id="cart-subtotal-price" style="font-weight:700; color:#0f172a;">$0.00</span>
          </div>
          <div class="totals-row discount-row" id="cart-discount-row" style="display:none; color: #059669;">
            <span id="cart-discount-label">PROMO DISCOUNT:</span>
            <span id="cart-discount-amount">-$0.00</span>
          </div>
          <div class="totals-row" style="border-top:1px solid #e2e8f0; padding-top:0.6rem; font-weight:700;">
            <span style="font-family: var(--font-display); font-size: 1.15rem; color: #0f172a;">TOTAL:</span>
            <span id="cart-total-price" style="font-size:1.35rem; color:#0f172a; font-weight:800;">$0.00</span>
          </div>
        </div>

        <button class="btn-primary" id="checkout-btn" style="width: 100%; padding: 1.1rem; background:#0f172a; border-color:#1e293b;">
          <span>REVIEW YOUR ORDER</span>
          <span>→</span>
        </button>

        <p class="checkout-note">Review your details before placing an order request. No payment is collected here.</p>
      </div>
    </aside>

    <!-- 12. QUICK VIEW / INSPECT MODAL -->
    <div class="modal-overlay" id="quick-view-modal">
      <div class="modal-content" id="quick-view-content">
        <!-- Injected dynamically on click -->
      </div>
    </div>
`;
