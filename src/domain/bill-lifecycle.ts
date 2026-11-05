/**
 * The lifecycle of a bill on Billion.
 *
 *   DRAFT ─▶ SUBMITTED ─▶ UNDER_REVIEW ─▶ VERIFIED ─▶ FUNDED ─▶ PAYMENT_SENT ─▶ PAID
 *                │               │            │                     │
 *                ▼               ▼            ▼                     ▼
 *            CANCELLED        REJECTED    EXPIRED / CANCELLED    PAYMENT_FAILED ─▶ PAYMENT_SENT (retry)
 *
 * VERIFIED is the only state in which a bill is visible to sponsors.
 * Keep this list in sync with the BillStatus enum in prisma/schema.prisma.
 */
export const BILL_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "FUNDED",
  "PAYMENT_SENT",
  "PAYMENT_FAILED",
  "PAID",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
] as const;

export type BillStatus = (typeof BILL_STATUSES)[number];

const TRANSITIONS: Readonly<Record<BillStatus, readonly BillStatus[]>> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["VERIFIED", "REJECTED"],
  VERIFIED: ["FUNDED", "EXPIRED", "CANCELLED"],
  FUNDED: ["PAYMENT_SENT"],
  PAYMENT_SENT: ["PAID", "PAYMENT_FAILED"],
  PAYMENT_FAILED: ["PAYMENT_SENT"],
  PAID: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
};

/** States after which nothing further can happen to a bill. */
export const TERMINAL_STATUSES: readonly BillStatus[] = BILL_STATUSES.filter(
  (status) => TRANSITIONS[status].length === 0,
);

/** Terminal states where any money collected from sponsors must be refunded. */
export const REFUND_STATUSES: readonly BillStatus[] = ["CANCELLED", "EXPIRED"];

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: BillStatus,
    readonly to: BillStatus,
  ) {
    super(`A bill cannot move from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function allowedTransitions(from: BillStatus): readonly BillStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: BillStatus, to: BillStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Returns `to` if the move is allowed, otherwise throws InvalidTransitionError. */
export function transition(from: BillStatus, to: BillStatus): BillStatus {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
  return to;
}

export function isTerminal(status: BillStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** Only verified bills are listed publicly and can accept sponsorships. */
export function isOpenForSponsorship(status: BillStatus): boolean {
  return status === "VERIFIED";
}
