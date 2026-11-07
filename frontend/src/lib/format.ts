export const CATEGORY_LABELS: Record<string, string> = {
  FOOD_BEVERAGE: "Food & beverage",
  FASHION: "Fashion",
  BEAUTY: "Beauty",
  ELECTRONICS: "Electronics",
  HOME_LIVING: "Home & living",
  HEALTH_WELLNESS: "Health & wellness",
  TOYS_KIDS: "Toys & kids",
  OTHER: "Other",
};

export function categoryLabel(category: string) {
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
  const text = category.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The backend stores prices in paise. */
export function formatPrice(paise: number) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function priceRange(variants: { pricePaise: number }[]) {
  if (variants.length === 0) return "Price to be announced";
  const prices = variants.map((v) => v.pricePaise);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function timeLeft(endsAt: string) {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "Ended";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(minutes, 1)}m left`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}