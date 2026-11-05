/**
 * Money is always handled as an integer number of US cents.
 * Never use floating point for stored or computed amounts.
 */
export type Cents = number;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

/** Throws unless `value` is a non-negative safe integer number of cents. */
export function assertCents(value: number, label = "amount"): asserts value is Cents {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`${label} must be a whole number of cents, got ${value}`);
  }
  if (value < 0) {
    throw new MoneyError(`${label} cannot be negative, got ${value}`);
  }
}

/**
 * Parses a user-entered dollar amount into cents.
 * Accepts "1234", "1234.5", "1234.56", "$1,234.56". Rejects more than two decimals.
 */
export function parseDollars(input: string): Cents {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) {
    throw new MoneyError(`"${input}" is not a valid dollar amount`);
  }
  const dollars = Number(match[1]);
  const fraction = (match[2] ?? "").padEnd(2, "0");
  const cents = dollars * 100 + Number(fraction);
  assertCents(cents);
  return cents;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats cents as a US dollar string, e.g. 123456 -> "$1,234.56". */
export function formatCents(cents: Cents): string {
  assertCents(cents);
  // Integer division keeps the formatter's input exact.
  return usd.format(Math.trunc(cents / 100) + (cents % 100) / 100);
}

/** Sums a list of cent amounts, validating each one. */
export function sumCents(amounts: readonly Cents[]): Cents {
  let total = 0;
  for (const amount of amounts) {
    assertCents(amount);
    total += amount;
  }
  assertCents(total, "total");
  return total;
}
