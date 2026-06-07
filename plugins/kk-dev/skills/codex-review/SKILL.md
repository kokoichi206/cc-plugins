---
name: codex-review
description: codex CLI (OpenAI Codex) を使用して現在の Git 変更をレビューし、問題点を報告・修正する。トリガー - codex でレビュー, codex review, AI レビュー, 変更をチェック
disable-model-invocation: true
argument-hint: "[--staged | commit...commit]"
allowed-tools:
  - Bash(which:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git commit:*)
  - Bash(git add:*)
  - Bash(gh repo:*)
  - Bash(*codex*)
  - Read
  - Edit
---

# 現在の状態

- ブランチ: !`git branch --show-current`
- 状態: !`git status -sb`
- 差分概要: !`git diff --stat`

# Codex Review Agent

codex CLI (OpenAI Codex) を使用して現在の Git 変更をレビューし、指摘された問題を報告・修正する。

## 前提条件

- `codex` CLI がインストールされていること
- OpenAI API キーが設定されていること

**注意**: codex CLI がインストールされていない場合、このスキルはスキップされます。

## 引数

- `$ARGUMENTS`: (オプション) レビュー対象の指定
  - 未指定: デフォルトブランチとの差分をレビュー
  - `--staged`: ステージされた変更のみをレビュー
  - `<commit>...<commit>`: 指定したコミット範囲をレビュー

## 手順

### 0. codex CLI の確認

まず codex CLI がインストールされているか確認:

```bash
which codex
```

インストールされていない場合は、以下のメッセージを表示して終了:

> codex CLI がインストールされていないため、このレビューをスキップします。
> インストール方法: `brew install openai/openai/codex` または `npm install -g @openai/codex`

### 1. デフォルトブランチの特定

リポジトリのデフォルトブランチを取得:

```bash
gh repo view --json defaultBranchRef -q '.defaultBranchRef.name'
```

取得したブランチ名を `$DEFAULT_BRANCH` として以降の手順で使用する。

### 2. 変更内容の確認

現在の変更状態を確認:

```bash
git status -sb
git diff --stat $DEFAULT_BRANCH...HEAD  # または指定された範囲
```

### 3. codex によるレビュー実行

差分を codex に渡してレビューを依頼:

```bash
git diff $DEFAULT_BRANCH...HEAD | codex exec "この差分をレビューしてください。バグ、セキュリティ問題、改善点があれば指摘してください。"
```

引数に応じてコマンドを調整:

- `--staged`: `git diff --cached | codex exec ...`
- コミット範囲: `git diff <range> | codex exec ...`

### 4. レビュー結果の分析

codex からの指摘を以下のカテゴリに分類:

- **重大**: セキュリティ問題、データ損失リスク、型の不整合など即座に修正が必要な問題
- **警告**: パフォーマンス問題、ベストプラクティス違反など修正推奨の問題
- **確認事項**: 設計判断の確認、影響範囲の確認など追加調査が必要な項目

### 5. 問題の修正

重大な問題が指摘された場合:

1. 該当ファイルを読み込み、問題箇所を特定
2. 修正を実施
3. 修正内容をコミット

### 6. 結果報告

レビュー完了後、以下を報告:

| 重要度           | 内容     | 対応     |
| ---------------- | -------- | -------- |
| (重大/警告/確認) | 指摘内容 | 対応状況 |

修正を行った場合は、変更したファイルとコミットハッシュも報告。

## 使用例

```
# デフォルトブランチとの差分をレビュー
/codex-review

# ステージされた変更のみレビュー
/codex-review --staged

# 特定のコミット範囲をレビュー
/codex-review abc123...def456
```

## 注意事項

- codex の指摘は参考情報として扱い、妥当性を検証してから修正を行う
- 大規模な変更が必要な場合は、まず指摘内容を報告し承認を得てから実施する
