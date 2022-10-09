import { validate } from "class-validator";

import { IsStrongPassword } from "../is-strong-password.decorator";

describe("IsStrongPassword", () => {
  class TestClass {
    @IsStrongPassword()
    value: unknown;
  }

  it("strong password returns no errors", async () => {
    const test = new TestClass();
    test.value = "P@ssw0rd";
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("missing numbers password returns error", async () => {
    const test = new TestClass();
    test.value = "P@ssword";
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("missing uppercase password returns error", async () => {
    const test = new TestClass();
    test.value = "p@ssw0rd";
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("missing lowercase password returns error", async () => {
    const test = new TestClass();
    test.value = "P@SSW0RD";
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("missing symbol password returns error", async () => {
    const test = new TestClass();
    test.value = "Passw0rd";
    const result = await validate(test);
    expect(result.length).toBe(1);
  });

  it("short password returns error", async () => {
    const test = new TestClass();
    test.value = "P@sw0rd";
    const result = await validate(test);
    expect(result.length).toBe(1);
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
