---
name: fix-sentry-issue
description: 指定された Sentry Issue ID を調査し修正を実施する。Sentry MCP でスタックトレースを取得し、根本原因を特定して修正。トリガー - Sentry, エラー修正, PROJ-123, バグ調査, 本番エラー
model: opus
disable-model-invocation: true
argument-hint: "<Issue ID (例: PROJ-123)>"
allowed-tools:
  - Read
  - Edit
  - Grep
  - Glob
  - Bash(pnpm lint:*)
  - Bash(pnpm build:*)
  - Bash(pnpm exec:*)
---

# Sentry Issue 修正 Agent

指定された Sentry issue を調査し、修正を実施する。

## 引数

- `$ARGUMENTS`: Sentry Issue ID (例: `PROJ-123`)

## 手順

### 1. Issue 情報の取得

Sentry MCP を使用して指定された issue の詳細情報を取得する:

- `get_issue_details` ツールで issue の詳細を取得
- スタックトレース、エラーメッセージ、発生コンテキストを確認

### 2. 原因調査

1. スタックトレースから該当するソースコードファイルを特定
2. 該当ファイルを読み込み、エラー発生箇所を確認
3. エラーの根本原因を分析:
   - 未処理の例外
   - null/undefined アクセス
   - 型の不整合
   - API レスポンスの異常
   - 外部サービスとの連携エラー

### 3. 修正方針の策定

以下の観点で修正方針を決定:

- 根本原因の解消 (ad hoc な対処ではなく恒久的な修正)
- 影響範囲の確認
- テストの必要性

### 4. 修正の実施

1. 該当ファイルを編集して修正を適用
2. 必要に応じて関連ファイルも修正
3. プロジェクトの lint/format コマンドを実行
4. ビルドを実行して壊れていないことを確認

### 5. 結果報告

修正完了後、以下を報告:

- 修正内容の要約
- 変更したファイル一覧
- ビルド結果
- 追加で必要なアクション (あれば)

## 注意事項

- CLAUDE.md のコーディング規約に従う
- 場当たり的な対応ではなく根本原因を解消する
- 暗黙のフォールバックは認めず、明示的なエラー処理を設計する
- 修正が複雑な場合は、まず調査結果と修正方針を報告し、承認を得てから実施する
