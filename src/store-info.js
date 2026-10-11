import { escapeHTML as e } from './ui.js';
import { policyFields } from './lib/commerce-config.js';
let config={};
export function setStoreInfo(settings={}) { config=settings.commerce || {}; }
export function initStoreInfo() {
  const modal=document.createElement('div');modal.id='store-info-modal';modal.className='modal-overlay';
  modal.innerHTML='<div class="modal-content info-modal-card"><button class="modal-close-btn" id="close-store-info" aria-label="Close store information">✕</button><div id="store-info-content"></div></div>';
  document.body.append(modal);
  document.getElementById('close-store-info').onclick=()=>modal.classList.remove('open');
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-store-page]');if(!link)return;
    event.preventDefault();openStoreInfo(link.dataset.storePage);
  });
}
export function storePolicyLinks() {
  return policyFields.map(([key,label])=>`<a href="?page=${key}" data-store-page="${key}">${label}</a>`).join('');
}
export function openStoreInfo(page) {
  const field=policyFields.find(([key])=>key===page);
  if(!field && !['contact','promotions'].includes(page))return;
  const email=config.support_email || document.getElementById('contact-email')?.textContent || '';
  const phone=config.support_phone || document.getElementById('contact-phone')?.textContent || '';
  const contact=`<div class="support-contact">${email?`<a href="mailto:${e(email)}">${e(email)}</a>`:''}${phone?`<a href="tel:${e(phone.replace(/[^+0-9]/g,''))}">${e(phone)}</a>`:''}</div>`;
  const title=field?.[1] || (page==='contact'?'Contact & support':'Promotion terms');
  let body;
  if(page==='contact') body=`${config.business_name?`<h3>${e(config.business_name)}</h3>`:''}${contact}${config.business_address?`<p class="policy-copy">${e(config.business_address)}</p>`:''}${config.support_hours?`<p>Support hours: ${e(config.support_hours)}</p>`:''}<p>For an order question, include your order reference. Never send card numbers or passwords.</p><p>For a cancellation or return, contact us before sending an item back.</p>`;
  else if(page==='promotions') body='<p>CHAMPION10 deducts 10% from the item subtotal. GENZVIP deducts up to USD $50 from the item subtotal. Only one code can be used per order. Discounts do not create store credit or cash value. Shipping and taxes are separate. An order request is subject to confirmation; a sandbox payment does not create a shippable order.</p>';
  else body=config[page]?.trim()?`<div class="policy-copy">${e(config[page])}</div>`:`<p>This policy has not been published yet. Contact the store for the details before placing an order.</p>${contact}`;
  document.getElementById('store-info-content').innerHTML=`<p class="eyebrow">GZN SPORTS / CUSTOMER CARE</p><h2>${e(title)}</h2>${body}`;
  document.querySelectorAll('.modal-overlay.open').forEach(el=>el.classList.remove('open'));
  document.getElementById('store-info-modal').classList.add('open');
}
