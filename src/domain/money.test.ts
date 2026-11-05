import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertCents, formatCents, MoneyError, parseDollars, sumCents } from "./money";

describe("parseDollars", () => {
  it("parses whole and fractional dollar amounts", () => {
    assert.equal(parseDollars("12"), 1200);
    assert.equal(parseDollars("12.5"), 1250);
    assert.equal(parseDollars("12.05"), 1205);
    assert.equal(parseDollars("0.01"), 1);
  });

  it("accepts a leading $ and thousands separators", () => {
    assert.equal(parseDollars("$1,234.56"), 123456);
    assert.equal(parseDollars("  $980 "), 98000);
  });

  it("avoids floating point errors", () => {
    // 0.1 + 0.2 style bugs would make this 1028.9999...
    assert.equal(parseDollars("10.29"), 1029);
  });

  it("rejects invalid input", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1.2.3", "$", "1e3"]) {
      assert.throws(() => parseDollars(bad), MoneyError, bad);
    }
  });
});

describe("formatCents", () => {
  it("formats as US dollars", () => {
    assert.equal(formatCents(0), "$0.00");
    assert.equal(formatCents(5), "$0.05");
    assert.equal(formatCents(123456), "$1,234.56");
  });
});

describe("assertCents", () => {
  it("rejects fractions and negatives", () => {
    assert.throws(() => assertCents(1.5), MoneyError);
    assert.throws(() => assertCents(-1), MoneyError);
    assert.throws(() => assertCents(Number.NaN), MoneyError);
  });
});

describe("sumCents", () => {
  it("adds amounts", () => {
    assert.equal(sumCents([]), 0);
    assert.equal(sumCents([100, 250, 5]), 355);
  });
});
