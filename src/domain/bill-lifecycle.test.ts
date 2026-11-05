import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BILL_STATUSES,
  canTransition,
  InvalidTransitionError,
  isOpenForSponsorship,
  isTerminal,
  REFUND_STATUSES,
  TERMINAL_STATUSES,
  transition,
} from "./bill-lifecycle";

describe("bill lifecycle", () => {
  it("follows the happy path from draft to paid", () => {
    const path = [
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "VERIFIED",
      "FUNDED",
      "PAYMENT_SENT",
      "PAID",
    ] as const;
    path.slice(1).forEach((to, i) => {
      assert.equal(transition(path[i]!, to), to);
    });
  });

  it("allows retrying a failed payment", () => {
    assert.ok(canTransition("PAYMENT_SENT", "PAYMENT_FAILED"));
    assert.ok(canTransition("PAYMENT_FAILED", "PAYMENT_SENT"));
  });

  it("never lists a bill that skipped verification", () => {
    assert.equal(canTransition("SUBMITTED", "VERIFIED"), false);
    assert.equal(canTransition("DRAFT", "VERIFIED"), false);
    assert.throws(() => transition("SUBMITTED", "FUNDED"), InvalidTransitionError);
  });

  it("cannot cancel once funded", () => {
    assert.equal(canTransition("FUNDED", "CANCELLED"), false);
    assert.equal(canTransition("PAYMENT_SENT", "CANCELLED"), false);
  });

  it("treats paid, rejected, cancelled and expired as terminal", () => {
    assert.deepEqual([...TERMINAL_STATUSES].sort(), ["CANCELLED", "EXPIRED", "PAID", "REJECTED"]);
    for (const status of TERMINAL_STATUSES) {
      assert.ok(isTerminal(status));
      for (const to of BILL_STATUSES) {
        assert.equal(canTransition(status, to), false, `${status} -> ${to}`);
      }
    }
  });

  it("only refunds from terminal states", () => {
    for (const status of REFUND_STATUSES) {
      assert.ok(isTerminal(status), status);
    }
  });

  it("is open for sponsorship only when verified", () => {
    const open = BILL_STATUSES.filter(isOpenForSponsorship);
    assert.deepEqual(open, ["VERIFIED"]);
  });

  it("can reach every status from DRAFT", () => {
    const seen = new Set<string>(["DRAFT"]);
    const queue = ["DRAFT"] as (typeof BILL_STATUSES)[number][];
    while (queue.length > 0) {
      const from = queue.shift()!;
      for (const to of BILL_STATUSES) {
        if (canTransition(from, to) && !seen.has(to)) {
          seen.add(to);
          queue.push(to);
        }
      }
    }
    assert.deepEqual([...seen].sort(), [...BILL_STATUSES].sort());
  });
});
