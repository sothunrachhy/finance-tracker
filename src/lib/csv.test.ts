import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins rows with CRLF", () => {
    expect(toCsv(["a", "b"], [[1, "x"]])).toBe("a,b\r\n1,x\r\n");
  });

  it("quotes commas, quotes and newlines", () => {
    expect(toCsv(["note"], [['Dinner, "fancy"\nplace']])).toBe(
      'note\r\n"Dinner, ""fancy""\nplace"\r\n',
    );
  });

  it("renders null as an empty cell", () => {
    expect(toCsv(["a", "b"], [[null, "x"]])).toBe("a,b\r\n,x\r\n");
  });

  it("neutralizes formulas in text columns only", () => {
    const csv = toCsv(["amount", "note"], [["-12.50", "=1+1"]], [1]);
    expect(csv).toBe("amount,note\r\n-12.50,'=1+1\r\n");
  });

  it.each(["=cmd", "+1", "-1", "@SUM(A1)"])("prefixes %j in text columns", (value) => {
    expect(toCsv(["note"], [[value]], [0])).toBe(`note\r\n'${value}\r\n`);
  });
});
