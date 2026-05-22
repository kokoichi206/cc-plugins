---
name: create-eslint-rule
description: カスタム ESLint ルールを作成する。ESLint ルール、lint ルール、コード規約の追加、静的解析ルールの作成時に使用。トリガー - ESLint, lint ルール, コード規約, 静的解析, ルール作成, no-xxx を検出
model: sonnet
disable-model-invocation: true
argument-hint: "<ルールの説明>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash(pnpm exec node:*)
  - Bash(pnpm lint:*)
  - Bash(ls:*)
---

# ESLint ルール作成 Skill

指定された仕様に基づいてカスタム ESLint ルールを作成します。

## 前提条件

- ESLint ルールは JavaScript (.js) で記述する
- 各ルールはディレクトリ構造で管理する
- テストを必ず書く
- 作成後は eslint.config.mjs に追加する

## ディレクトリ構造

```
eslint-rules/
├── index.js                          # ルールのエクスポート
├── {rule-name}/
│   ├── rule.js                       # ルール本体
│   └── test.js                       # テスト (RuleTester 使用)
└── {another-rule}/
    ├── rule.js
    ├── test.js
    └── fixtures/                     # (オプション) テスト用フィクスチャ
        ├── valid.ts
        └── invalid.ts
```

## 実行手順

### 1. 仕様の確認

ユーザーから以下の情報を収集:

- **ルール名**: kebab-case で命名 (例: `require-server-only`, `no-hardcoded-secrets`)
- **目的**: 何を検出/禁止するルールか
- **対象ファイル**: どのファイルに適用するか (例: `src/server/**/*.ts`)
- **自動修正**: --fix で自動修正可能にするか
- **エラーレベル**: error / warn

### 2. 既存ルールの参照

既存のカスタムルールを参考にする:

```bash
ls eslint-rules/
cat eslint-rules/require-server-only/rule.js
cat eslint-rules/require-server-only/test.js
```

### 3. ルールファイルの作成

`eslint-rules/{rule-name}/rule.js` を作成。テンプレートは [reference/rule-template.js](reference/rule-template.js) を参照。

### 4. テストファイルの作成

`eslint-rules/{rule-name}/test.js` を作成。テンプレートは [reference/test-template.js](reference/test-template.js) を参照。

### 5. index.js への登録

`eslint-rules/index.js` にルールを追加:

```javascript
const requireServerOnly = require("./require-server-only/rule");
const newRule = require("./{rule-name}/rule");

module.exports = {
  rules: {
    "require-server-only": requireServerOnly,
    "{rule-name}": newRule,
  },
};
```

### 6. eslint.config.mjs への追加

ルールを適用する設定を追加:

```javascript
// Custom rule: {rule description}
{
  files: ["{対象ファイルパターン}"],
  plugins: {
    custom: customRules,
  },
  rules: {
    "custom/{rule-name}": "error",
  },
},
```

### 7. テストの実行

```bash
pnpm exec node eslint-rules/{rule-name}/test.js
pnpm lint
```

## チェックリスト

- [ ] ルールディレクトリ (`eslint-rules/{rule-name}/`) を作成
- [ ] ルールファイル (`rule.js`) を作成
- [ ] テストファイル (`test.js`) を作成
- [ ] `eslint-rules/index.js` にルールを登録
- [ ] `eslint.config.mjs` に設定を追加
- [ ] テストが全て pass することを確認
- [ ] `pnpm lint` が正常に動作することを確認

## 注意事項

- AST Explorer (https://astexplorer.net/) を使って AST 構造を確認すると便利
- context.report() でエラーを報告する
- fixable にする場合は fixer を使って修正コードを生成
- ファイルパスのチェックには context.filename を使用
- Windows パスにも対応すること (`/` と `\\` の両方をチェック)
