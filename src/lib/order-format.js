export function formatAddress(value) {
  if (typeof value === 'string') {
    try { return formatAddress(JSON.parse(value)); }
    catch { return value.trim() || 'Not provided'; }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Not provided';
  const keys = ['address', 'destination', 'line1', 'address_line1', 'street', 'line2', 'address_line2', 'city', 'state', 'province', 'postal_code', 'zip', 'country'];
  const lines = [...new Set(keys.map(key => value[key]).filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()))];
  return lines.join('\n') || 'Not provided';
}

export function formatOrderDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(date);
}
