export const LOAN_DAYS = 14;

export function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDate(value: Date | string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createReference(prefix: "INV" | "LOAN") {
  const date = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `${prefix}-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function multiplyMoney(value: string, quantity: number) {
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  const subtotal = cents * quantity;
  if (!Number.isSafeInteger(subtotal) || subtotal > 999_999_999_999) {
    throw new RangeError("Subtotal melampaui batas sistem.");
  }
  return `${Math.floor(subtotal / 100)}.${String(subtotal % 100).padStart(2, "0")}`;
}

export function addMoney(values: string[]) {
  const cents = values.reduce((total, value) => {
    const [whole, fraction = ""] = value.split(".");
    return total + Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  }, 0);
  if (!Number.isSafeInteger(cents) || cents > 999_999_999_999) {
    throw new RangeError("Total transaksi melampaui batas sistem.");
  }
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
