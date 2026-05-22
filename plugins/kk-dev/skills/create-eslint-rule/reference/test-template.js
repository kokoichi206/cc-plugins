#!/usr/bin/env node

/**
 * Tests for {rule-name} ESLint rule
 */
const { RuleTester } = require("eslint");
const rule = require("./rule");

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("{rule-name}", rule, {
  valid: [
    {
      code: `// valid code`,
      filename: "/project/src/example.ts",
    },
  ],

  invalid: [
    {
      code: `// invalid code`,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "messageId" }],
      output: `// fixed code`, // fixable の場合のみ
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
