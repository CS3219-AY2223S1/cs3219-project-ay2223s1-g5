import { validate } from "class-validator";

import { Difficulty } from "../../types/base";
import { IsDifficulty } from "../is-difficulty.decorator";

describe("IsDifficulty", () => {
  class TestClass {
    @IsDifficulty()
    value: unknown;
  }

  it("easy difficulty returns no errors", async () => {
    const test = new TestClass();
    test.value = Difficulty.EASY;
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("medium difficulty returns no errors", async () => {
    const test = new TestClass();
    test.value = Difficulty.MEDIUM;
    const result = await validate(test);
    expect(result).toStrictEqual([]);
  });

  it("hard difficulty returns no errors", async () => {
    const test = new TestClass();
    test.value = Difficulty.HARD;
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
