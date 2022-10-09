import { validate } from "class-validator";

import { IsNonEmptyString } from "../is-non-empty-string.decorator";

describe("IsNonEmptyString", () => {
  class TestClass {
    @IsNonEmptyString()
    value: unknown;
  }

  it("string returns no errors", async () => {
    const test = new TestClass();
    test.value = "hello world";
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("empty string returns error", async () => {
    const test = new TestClass();
    test.value = "";
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("null returns error", async () => {
    const test = new TestClass();
    test.value = null;
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("undefined returns error", async () => {
    const test = new TestClass();
    test.value = undefined;
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("number returns error", async () => {
    const test = new TestClass();
    test.value = 1;
    const result = await validate(test);
    expect(result.length).toBe(1);
  });
});
