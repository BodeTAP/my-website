import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("menggabungkan class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("mengabaikan nilai falsy", () => {
    expect(cn("base", false && "skip", undefined, null, "end")).toBe("base end");
  });

  it("menimpa class Tailwind yang konflik (class terakhir menang)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("menangani array class", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("menangani object class kondisional", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });
});
