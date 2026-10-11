import { handlingTime } from './handling-time.js';
export const policyFields = [
  ['shipping','Shipping & delivery','Destinations, charges, carriers, dispatch and delivery estimates, international duties.'],
  ['returns','Returns & refunds','Return window, eligibility, exclusions, costs, refund timing and how to request a return.'],
  ['privacy','Privacy policy','Data collected, purposes, service providers, retention and how customers exercise their rights.'],
  ['terms','Terms of sale','Business identity, order acceptance, payment, cancellations, disputes and applicable terms.'],
];
export const businessFields = [
  ['business_name','Business name'],['business_address','Business / correspondence address'],
  ['support_email','Support email'],['support_phone','Support phone'],['support_hours','Support hours and time zone'],
];
export function validateCommerceConfig(config) {
  for (const [key] of [...businessFields,...policyFields]) {
    if (typeof config[key] !== 'string' || config[key].length > (policyFields.some(([id])=>id===key)?15000:1000))
      throw new Error('Check the store information fields and their lengths.');
  }
  if(config.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.support_email)) throw new Error('Enter a valid support email.');
  return config;
}
export function launchChecks(config={}, products=[]) {
  return [
    ...businessFields.map(([key,label])=>({label,ready:!!config[key]?.trim()})),
    ...policyFields.map(([key,label])=>({label,ready:!!config[key]?.trim()})),
    {label:'Real product descriptions and photography (no sample listings)',ready:products.length>0 && products.every(p=>!/sample|placeholder/i.test(`${p.tag} ${p.description}`))},
    {label:'Handling time on every product',ready:products.length>0 && products.every(p=>handlingTime(p))},
    {label:'Live payment processing and signed webhook delivery tested',ready:false,external:true},
    {label:'Shipping destinations, rates and taxes configured in checkout',ready:false,external:true},
    {label:'Transactional confirmation / dispatch emails configured and tested',ready:false,external:true},
    {label:'Refund workflow, backups, rate limits and monitoring verified',ready:false,external:true},
  ];
}
export function safeTrackingUrl(value) {
  try {const url=new URL(value);return url.protocol==='https:' && !url.username && !url.password ? url.href : null;}catch{return null;}
}
