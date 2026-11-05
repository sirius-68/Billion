import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { BILL_STATUSES } from "./bill-lifecycle";

// Guards against the domain list and the database enum drifting apart.
describe("BillStatus enum", () => {
  it("matches prisma/schema.prisma", () => {
    const schema = readFileSync(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
    const block = /enum BillStatus \{([^}]*)\}/.exec(schema);
    assert.ok(block, "BillStatus enum not found in schema.prisma");
    const values = block[1]!
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"));
    assert.deepEqual(values, [...BILL_STATUSES]);
  });
});
