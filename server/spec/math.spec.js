// spec/math.spec.js
const { add, multiply } = require('../math');

describe("Math functions", () => {
  it("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("multiplies two numbers", () => {
    expect(multiply(2, 3)).toBe(6);
  });
});
