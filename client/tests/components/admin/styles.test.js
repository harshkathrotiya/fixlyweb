import { tableStyles as legacyTableStyles } from "../../../src/components/admin/shared/styles.js";

describe("Admin Styles", () => {
  test("styles tableStyles keys exist", () => {
    expect(legacyTableStyles.table).toContain("divide-y");
    expect(legacyTableStyles.thead).toContain("bg-gray-50");
    expect(legacyTableStyles.td).toContain("text-sm");
  });

  test("tableStyles object is not empty", () => {
    expect(Object.keys(legacyTableStyles).length).toBeGreaterThan(0);
  });
});
