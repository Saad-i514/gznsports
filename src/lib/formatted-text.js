import { escapeHTML } from '../ui.js';

// Only bare emphasis tags are accepted; attributes, links and other HTML stay text.
export function formattedText(value = '') {
  return String(value).split(/(<\/?(?:strong|em|b|i)>)/gi).map(part => {
    if (/^<\/?(?:strong|em|b|i)>$/i.test(part))
      return part.toLowerCase().replace(/\bb\b/, 'strong').replace(/\bi\b/, 'em');
    return escapeHTML(part).replace(/\r?\n/g, '<br>');
  }).join('');
}

export function editorValue(node) {
  if (node.nodeType === 3) return node.textContent;
  const tag = node.nodeName.toLowerCase();
  if (tag === 'br') return '\n';
  const content = Array.from(node.childNodes || [], editorValue).join('');
  if (['strong', 'b'].includes(tag)) return `<strong>${content}</strong>`;
  if (['em', 'i'].includes(tag)) return `<em>${content}</em>`;
  return ['div', 'p'].includes(tag) ? '\n' + content : content;
}
