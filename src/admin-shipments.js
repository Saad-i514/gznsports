import { adminApi } from './lib/admin-api.js';
import { safeTrackingUrl } from './lib/commerce-config.js';
import { escapeHTML as e } from './ui.js';

export function attachShipmentForms(content, orders) {
  content.querySelectorAll('.admin-order-card').forEach(card => {
    const order = orders.find(o => o.id === card.dataset.id);
    if (!['PROCESSING', 'DISPATCHED', 'DELIVERED'].includes(order.status)) return;
    const shipment = order.shipment || {};
    const form = document.createElement('form');
    form.className = 'shipment-form';
    form.innerHTML = `<h4>Shipment tracking</h4><label>Carrier<input name="carrier" maxlength="100" value="${e(shipment.carrier || '')}" /></label><label>Tracking number<input name="number" maxlength="100" value="${e(shipment.number || '')}" /></label><label>Tracking URL (HTTPS, optional)<input name="url" type="url" maxlength="2000" value="${e(shipment.url || '')}" /></label><button class="btn-secondary" type="submit">Save tracking</button><p role="status"></p>`;
    card.append(form);
    form.onsubmit = async event => {
      event.preventDefault();
      const button = form.querySelector('button'), status = form.querySelector('[role="status"]');
      button.disabled = true;
      try {
        const details = Object.fromEntries(new FormData(form));
        for (const key in details) details[key] = details[key].trim();
        if (details.url && !safeTrackingUrl(details.url)) throw new Error('Enter a valid HTTPS tracking URL without login details.');
        await adminApi.updateOrderShipment(order.id, details);
        status.textContent = 'Tracking saved. Customers can view it using their order reference and access code.';
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    };
  });
}
