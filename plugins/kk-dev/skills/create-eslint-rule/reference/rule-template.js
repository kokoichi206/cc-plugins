/**
 * ESLint rule to {description}
 *
 * {詳細な説明}
 */

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // "problem" | "suggestion" | "layout"
    docs: {
      description: "{ルールの説明}",
      recommended: true,
    },
    fixable: "code", // 自動修正可能な場合のみ
    messages: {
      messageId: "{エラーメッセージ}",
    },
    schema: [],
  },

  create(context) {
    return {
      // AST ノードに対するビジターパターン
    };
  },
};
