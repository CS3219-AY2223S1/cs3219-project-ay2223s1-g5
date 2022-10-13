import { validate } from "class-validator";

import { Language } from "../../types/base";
import { IsLanguage } from "../is-language.decorator";

describe("IsLanguage", () => {
  class TestClass {
    @IsLanguage()
    value: unknown;
  }

  it("c++ language returns no errors", async () => {
    const test = new TestClass();
    test.value = Language.CPP;
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("python language returns no errors", async () => {
    const test = new TestClass();
    test.value = Language.PYTHON;
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("java language returns no errors", async () => {
    const test = new TestClass();
    test.value = Language.JAVA;
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("javascript language returns no errors", async () => {
    const test = new TestClass();
    test.value = Language.JAVASCRIPT;
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("other string returns error", async () => {
    const test = new TestClass();
    test.value = "something else";
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
