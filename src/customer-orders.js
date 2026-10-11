import { adminApi } from './lib/admin-api.js';
import { escapeHTML as e } from './ui.js';
import { formatOrderDate } from './lib/order-format.js';
import { safeTrackingUrl } from './lib/commerce-config.js';
export function customerOrderMarkup(order) {
  const shipment=order.shipment || {}, url=safeTrackingUrl(shipment.url);
  return `<article class="customer-order"><h3>Order ${e(order.id.slice(0,8).toUpperCase())}</h3><p>${e(formatOrderDate(order.created_at))}</p><p>Order status: <strong>${e(order.status)}</strong> · Payment: <strong>${e(order.payment_status)}</strong></p><ul>${(order.items || []).map(item=>`<li>${e(item.title)} · ${e(item.size)} × ${e(item.quantity)}</li>`).join('')}</ul><p>Recorded total: USD $${Number(order.total).toFixed(2)}</p>${order.payment_status==='UNPAID'?'<p>This is an unpaid order request. Shipping, taxes and final payment arrangements require store confirmation.</p>':''}${shipment.carrier || shipment.number?`<p>Carrier: ${e(shipment.carrier || 'Not specified')}<br>Tracking number: ${e(shipment.number || 'Not available')}</p>${url?`<a href="${e(url)}" target="_blank" rel="noopener noreferrer">Track with carrier ↗</a>`:''}`:'<p>Shipment tracking will appear here once the store adds it.</p>'}<a href="?page=contact" data-store-page="contact">Contact support about this order</a></article>`;
}
export function initCustomerOrders() {
  const modal=document.createElement('div');modal.id='customer-orders-modal';modal.className='modal-overlay';
  modal.innerHTML='<div class="modal-content info-modal-card"><button class="modal-close-btn" id="close-customer-orders" aria-label="Close orders">✕</button><div id="customer-orders-content"></div></div>';
  document.body.append(modal);document.getElementById('close-customer-orders').onclick=()=>modal.classList.remove('open');
  document.addEventListener('click',event=>{if(event.target.closest('[data-track-order]')){event.preventDefault();openOrderTracking();}});
}
function open() {
  document.querySelectorAll('.modal-overlay.open').forEach(el=>el.classList.remove('open'));
  document.getElementById('customer-orders-modal').classList.add('open');
  return document.getElementById('customer-orders-content');
}
export async function openMyOrders() {
  const node=open();node.innerHTML='<h2>YOUR ORDERS</h2><p role="status">Loading your orders…</p>';
  let offset=0;
  const load=async()=>{
    const orders=await adminApi.fetchMyOrders(offset);
    node.innerHTML=`<h2>YOUR ORDERS</h2><p>Orders placed while signed in appear here. For guest orders, use the access code from your confirmation.</p><div>${orders.length?orders.map(customerOrderMarkup).join(''):'<p>No orders found on this page.</p>'}</div><div class="order-pagination"><button id="orders-previous" ${offset===0?'disabled':''}>Previous</button><button id="orders-next" ${orders.length<20?'disabled':''}>Next</button></div><button data-track-order>Find a guest order</button>`;
    node.querySelector('#orders-previous').onclick=()=>{offset=Math.max(0,offset-20);void run();};
    node.querySelector('#orders-next').onclick=()=>{offset+=20;void run();};
  };
  const run=async()=>{try{await load();}catch(error){node.innerHTML=`<h2>YOUR ORDERS</h2><p role="alert">${e(error.message)}</p>`;}};
  await run();
}
export function openOrderTracking(id='',token='') {
  const node=open();
  node.innerHTML=`<h2>TRACK YOUR ORDER</h2><p>Use the full reference and private access code from your order confirmation. These protect your order from being looked up by other people.</p><form id="track-order-form" class="auth-form"><label for="track-order-id">Full order reference</label><input id="track-order-id" name="id" required maxlength="36" value="${e(id)}" /><label for="track-order-code">Private access code</label><input id="track-order-code" name="code" required maxlength="36" autocomplete="off" value="${e(token)}" /><button class="action-button dark-button" type="submit">Find order</button></form><div id="tracking-result" role="status"></div>`;
  node.querySelector('form').onsubmit=async(event)=>{
    event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),result=node.querySelector('#tracking-result');button.disabled=true;
    try{const order=await adminApi.trackOrder(form.elements.id.value.trim(),form.elements.code.value.trim());result.innerHTML=customerOrderMarkup(order);}
    catch(error){result.textContent=error.message;}finally{button.disabled=false;}
  };
}
export function confirmationMarkup(order) {
  if (!order.access_token) return `<div class="order-success" role="status"><h3>REQUEST RECEIVED.</h3><p>Full reference: <code>${e(order.id)}</code></p><p>Your order is pending confirmation. No payment has been taken. Save this reference and contact support for updates while online tracking is being configured.</p><a href="?page=contact" data-store-page="contact">Contact support</a></div>`;
  return `<div class="order-success" role="status"><h3>REQUEST RECEIVED.</h3><p>Your order is pending confirmation. No payment has been taken.</p><p>Full reference: <code>${e(order.id)}</code></p><p>Private tracking code: <code>${e(order.access_token || '')}</code></p><p>Save this confirmation to check your order later. Keep the access code private.</p><button type="button" id="download-order-confirmation">Download confirmation</button><button type="button" id="track-confirmed-order">Track this order</button></div>`;
}
export function bindConfirmation(order) {
  if (!order.access_token) return;
  document.getElementById('track-confirmed-order').onclick=()=>openOrderTracking(order.id,order.access_token);
  document.getElementById('download-order-confirmation').onclick=()=>{
    const text=`GZN SPORTS — ORDER REQUEST\nReference: ${order.id}\nPrivate tracking code: ${order.access_token}\nStatus: ${order.status || 'PENDING'} / ${order.payment_status || 'UNPAID'}\n${(order.items || []).map(i=>`${i.title} (${i.size}) x ${i.quantity}`).join('\n')}\nRecorded item total: USD $${Number(order.total).toFixed(2)}\nNo payment has been taken. Shipping, taxes and availability require store confirmation.\nTrack: ${location.origin}/?page=tracking\nKeep this access code private.`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`gzn-order-${order.id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
}
