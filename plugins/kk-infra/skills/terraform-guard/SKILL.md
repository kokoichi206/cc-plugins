---
name: terraform-guard
description: Terraform 変更を「ローカルで apply しない・GitHub Actions 経由で apply する」運用規約に沿って安全に進める。plan/validate/fmt はローカル、apply は GHA を発火する。トリガー - terraform, terraform apply, tf 変更, インフラ変更, GHA で apply, terraform-guard
disable-model-invocation: true
argument-hint: "[変更内容の説明]"
allowed-tools:
  - Read
  - Edit
  - Grep
  - Glob
  - Bash(terraform plan:*)
  - Bash(terraform validate:*)
  - Bash(terraform fmt:*)
  - Bash(gh workflow:*)
  - Bash(gh run:*)
---

# Terraform 安全ガード

Terraform 変更を運用規約に沿って安全に進める。ローカルでは `fmt` / `validate` / `plan` まで。**apply はローカルで打たず GitHub Actions を発火** させる。

## 厳守する規約 (禁則)

これは過去に強くこだわられた規約。**例外なく厳守する**:

- **手元から `terraform apply` を打たない**。apply は GitHub Actions を発火させて実行する
- **OIDC / IAM ロールは Terraform で作らない** (別管理 = cli 等)。tf に IAM ロール作成リソースを足さない
- **`terraform import` は厳禁**。使わない

> allowed-tools にも `terraform apply` / `terraform import` は含めていない。実行できないことを前提に進める。

## 引数

- `$ARGUMENTS`: (任意) 変更内容の説明。未指定なら現状の差分や要望をユーザーに確認する

## 手順

### 1. 規約の確認とスコープ確定

- 冒頭の禁則 (apply ローカル禁止 / IAM・OIDC は tf 外 / import 禁止) を前提として明示する
- `$ARGUMENTS` から変更スコープを把握する。聞かれていない範囲には手を出さない (作業スコープ厳守)
- 対象の tf ディレクトリ / module を特定する (探索は `rg` / Glob を使う)

### 2. 変更の編集

- 要求された変更を Edit で適用する
- IAM ロール / OIDC provider を作るリソースが必要そうな場合は **tf に足さず**、cli での別管理を案内する (理由とともに提示)
- 命名は util/common/result 等の無意味語を避ける

### 3. ローカル検証 (fmt / validate / plan)

対象ディレクトリで以下を順に実行する:

```bash
terraform fmt -recursive
terraform validate
terraform plan
```

- `plan` の結果を確認し、意図しない差分 (特に IAM/OIDC リソースの作成・削除、想定外の destroy) がないか点検する
- 破壊的変更 (replace/destroy) があれば内容を明示してユーザーに確認する

### 4. apply は GitHub Actions を発火

ローカルでは apply しない。代わりに該当ワークフローを発火させる:

```bash
# apply 用ワークフローを探す
gh workflow list

# 発火 (ワークフロー名/ファイル名と必要な input は実リポジトリに合わせる)
gh workflow run <apply-workflow> --ref <branch> [-f <key>=<value>]

# 実行状況を確認
gh run list --workflow <apply-workflow> --limit 5
gh run watch <run-id>
```

- ワークフロー名や必要な input が不明なら**勝手に推測せず確認する** (知ったかぶり禁止)
- 実行ログで apply の成否を確認し、失敗時は原因を報告する

### 5. 結果報告

- 編集したファイル一覧
- `fmt` / `validate` / `plan` の結果サマリー
- 発火したワークフローと run の URL / 結果
- IAM/OIDC を tf 外にした場合はその案内

## 注意事項

- CLAUDE.md のコーディング/対話規約に従う (応答は日本語、全角括弧禁止・半角記号優先)
- 規約厳守: 手元から `terraform apply` を打たない / OIDC・IAM ロールは tf で作らない / `terraform import` 厳禁
- 破壊的な plan 差分はユーザー確認を必須にする
- 知ったかぶり禁止: ワークフロー名・input・対象 module が不明なら質問する
- 作業スコープ厳守。先回りで追加変更しない
- ファイル探索は fd/rg を使う (find/grep は使わない)。ファイル削除が要る場合は trash を使い rm は使わない
- 詰まったら o3 MCP に英語で相談する
