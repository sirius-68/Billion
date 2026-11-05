import { isOpenForSponsorship, type BillStatus } from "./bill-lifecycle";
import { assertCents, formatCents, type Cents } from "./money";

/** Smallest sponsorship we accept: $1.00. Keeps card fees from eating tiny gifts. */
export const MIN_SPONSORSHIP_CENTS: Cents = 100;

export interface BillFunding {
  status: BillStatus;
  amountDueCents: Cents;
  amountFundedCents: Cents;
}

export type SponsorshipCheck =
  | { ok: true; fullyFunds: boolean; remainingAfterCents: Cents }
  | { ok: false; reason: string };

export function remainingCents(bill: BillFunding): Cents {
  assertCents(bill.amountDueCents, "amountDueCents");
  assertCents(bill.amountFundedCents, "amountFundedCents");
  return Math.max(0, bill.amountDueCents - bill.amountFundedCents);
}

/**
 * Decides whether a sponsor may put `amountCents` toward a bill.
 * A sponsorship can never exceed what is still owed, so a bill is never over-funded.
 */
export function checkSponsorship(bill: BillFunding, amountCents: Cents): SponsorshipCheck {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    return { ok: false, reason: "Sponsorship amount must be a positive whole number of cents." };
  }
  if (!isOpenForSponsorship(bill.status)) {
    return { ok: false, reason: "This bill is not open for sponsorship." };
  }

  const remaining = remainingCents(bill);
  if (remaining === 0) {
    return { ok: false, reason: "This bill is already fully funded." };
  }
  if (amountCents > remaining) {
    return {
      ok: false,
      reason: `Only ${formatCents(remaining)} is still needed for this bill.`,
    };
  }
  // Allow a final top-up below the minimum so the last few cents can be covered.
  if (amountCents < MIN_SPONSORSHIP_CENTS && amountCents !== remaining) {
    return {
      ok: false,
      reason: `The minimum sponsorship is ${formatCents(MIN_SPONSORSHIP_CENTS)}.`,
    };
  }

  const remainingAfterCents = remaining - amountCents;
  return { ok: true, fullyFunds: remainingAfterCents === 0, remainingAfterCents };
}
