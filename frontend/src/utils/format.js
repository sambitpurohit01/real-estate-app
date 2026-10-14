export function formatPrice(price, listingType) {
  const num = Number(price);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);

  return listingType === 'RENT' ? `${formatted}/mo` : formatted;
}

export function propertyTypeLabel(type) {
  if (!type) return '';
  return type.charAt(0) + type.slice(1).toLowerCase();
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Uploaded files come back as relative paths like "/uploads/xyz.jpg" (served by
// the backend). Pasted URLs (e.g. from Unsplash) are already absolute. This
// makes both work as an <img src>.
export function resolveImageUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
