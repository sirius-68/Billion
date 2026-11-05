import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkSponsorship,
  MIN_SPONSORSHIP_CENTS,
  remainingCents,
  type BillFunding,
} from "./sponsorship";

const openBill = (overrides: Partial<BillFunding> = {}): BillFunding => ({
  status: "VERIFIED",
  amountDueCents: 50_000,
  amountFundedCents: 0,
  ...overrides,
});

describe("remainingCents", () => {
  it("is what is still owed, never negative", () => {
    assert.equal(remainingCents(openBill({ amountFundedCents: 20_000 })), 30_000);
    assert.equal(remainingCents(openBill({ amountFundedCents: 60_000 })), 0);
  });
});

describe("checkSponsorship", () => {
  it("accepts a partial sponsorship", () => {
    assert.deepEqual(checkSponsorship(openBill(), 10_000), {
      ok: true,
      fullyFunds: false,
      remainingAfterCents: 40_000,
    });
  });

  it("detects when a sponsorship completes the bill", () => {
    const result = checkSponsorship(openBill({ amountFundedCents: 45_000 }), 5_000);
    assert.deepEqual(result, { ok: true, fullyFunds: true, remainingAfterCents: 0 });
  });

  it("refuses to over-fund a bill", () => {
    const result = checkSponsorship(openBill({ amountFundedCents: 45_000 }), 6_000);
    assert.equal(result.ok, false);
    assert.match(!result.ok ? result.reason : "", /\$50\.00/);
  });

  it("refuses bills that are not verified", () => {
    for (const status of ["SUBMITTED", "UNDER_REVIEW", "FUNDED", "PAID", "EXPIRED"] as const) {
      assert.equal(checkSponsorship(openBill({ status }), 1_000).ok, false, status);
    }
  });

  it("enforces the minimum except for a final top-up", () => {
    assert.equal(checkSponsorship(openBill(), MIN_SPONSORSHIP_CENTS - 1).ok, false);
    assert.equal(checkSponsorship(openBill(), MIN_SPONSORSHIP_CENTS).ok, true);
    const almostDone = openBill({ amountFundedCents: 49_950 });
    assert.equal(checkSponsorship(almostDone, 50).ok, true);
  });

  it("rejects non-positive and fractional amounts", () => {
    for (const amount of [0, -100, 10.5, Number.NaN]) {
      assert.equal(checkSponsorship(openBill(), amount).ok, false, String(amount));
    }
  });
});
