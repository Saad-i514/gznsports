import { escapeHTML } from './ui.js';

export function announcementMessages({
  banner_text = 'BUILT FOR THE MOMENT. MADE FOR THE EVERYDAY.',
  shipping_text = 'SHIPPING DETAILS ON REQUEST',
} = {}) {
  const messages = [banner_text, shipping_text].filter(text => typeof text === 'string' && text.trim());
  const content = messages.map(text => `<span>${escapeHTML(text)}</span>`).join('<span aria-hidden="true">✳</span>');
  return `<div class="announcement-group">${content}</div><div class="announcement-group" aria-hidden="true">${content}</div>`;
}
