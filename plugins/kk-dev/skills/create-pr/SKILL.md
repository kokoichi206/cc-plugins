---
name: create-pr
description: 現在の変更からブランチ作成、コミット、プッシュ、PR 作成を一括実行する。CI の完了も監視する。トリガー - PR 作成, プルリクエスト, pull request, ブランチ作成して PR
model: haiku
disable-model-invocation: true
argument-hint: "[--draft] [--skip-ci-wait] [--reviewer username]"
allowed-tools:
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(git push:*)
  - Bash(git checkout:*)
  - Bash(git branch:*)
  - Bash(git fetch:*)
  - Bash(git log:*)
  - Bash(gh pr:*)
  - Bash(gh run:*)
  - Bash(gh repo:*)
  - Bash(which:*)
  - Bash(infracost:*)
  - Bash(test -f:*)
  - Read
---

# 現在の状態

- ブランチ: !`git branch --show-current`
- 状態: !`git status --short`
- 差分: !`git diff`

# 指示

現在の変更を確認し、以下のステップで PR を作成してください:

## 1. 事前チェック

### 1.1 ブランチ確認

- 現在のブランチ名を取得 (`git branch --show-current`)
- `main` または `develop` ブランチにいる場合はエラー終了
- 未コミットの変更がある場合は警告を表示し、続行するか確認

### 1.2 リモートとの同期確認

- `git fetch origin` を実行
- 未プッシュのコミットがある場合は `git push -u origin {branch}` を実行

## 2. PR 作成

1. リモートの default branch を取得する:
   ```bash
   gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
   ```
2. 変更内容を確認して適切なブランチ名を生成 (feature/xxx, fix/xxx など)
3. 新しいブランチを作成してチェックアウト
4. 変更をステージングしてコミット (コミットメッセージは変更内容を簡潔に説明)
5. リモートにプッシュ
6. PR テンプレートの検出と本文作成 (詳細は 2.1 を参照)
7. `gh pr create --base {default_branch} --body "{body}"` で PR を作成

### 2.1 PR テンプレートの検出

以下の順序で PR テンプレートを探す:

```bash
# 優先順位の高い順にチェック
for tmpl in \
  .github/pull_request_template.md \
  .github/PULL_REQUEST_TEMPLATE.md \
  pull_request_template.md \
  PULL_REQUEST_TEMPLATE.md \
  docs/pull_request_template.md; do
  if [ -f "$tmpl" ]; then
    echo "$tmpl"
    break
  fi
done
```

- **テンプレートが見つかった場合**: テンプレートの内容を読み込み、各セクション (例: `## Summary`, `## Changes`, `## Test plan` など) を diff の内容に基づいて埋める。テンプレートの構造はそのまま維持し、セクションの中身だけを適切に記述する。テンプレート内にチェックボックス (`- [ ]`) がある場合はそのまま残す。
- **テンプレートが見つからない場合**: 従来通り変更内容から PR 本文を自動生成する。

## 3. Terraform コスト見積もり (条件付き)

diff に `.tf` ファイルが含まれる場合のみ実行する。含まれない場合はこのステップをスキップ。

### 3.1 infracost の確認

```bash
which infracost
```

### 3.2 infracost がある場合

1. `.tf` ファイルが存在するディレクトリを特定する
2. コスト見積もりを実行:
   ```bash
   infracost diff --path <tf ディレクトリ>
   ```
3. 結果を PR 本文の `## Cost Estimate` セクションに含める (`gh pr edit` で追記)

### 3.3 infracost がない場合

PR 本文には何も追加しない。Step 5 の結果サマリーで以下を表示:

> infracost をインストールすると Terraform の変更に対するコスト見積もりを PR に含められます。

## 4. CI の実行待機

### 4.1 CI ステータスの監視

PR 作成後、GitHub Actions の CI が完了するまで監視:

```bash
# 30秒間隔で最大20回 (10分) ポーリング
gh pr checks --watch --interval 30
```

### 4.2 CI 結果の確認

- **成功**: 完了メッセージを表示し、PR URL を出力
- **失敗**: 失敗した job を特定し、ログを取得して問題を分析

  ```bash
  gh run view {run_id} --log-failed
  ```

  - 可能であれば修正を提案または実施
  - 修正後は再度プッシュして CI を再実行

## 5. 結果サマリー

最終的に以下を出力:

- PR URL
- CI ステータス (成功/失敗)
- 変更ファイル数とコミット数

## オプション引数

$ARGUMENTS

引数で以下を指定可能:

- `--draft`: ドラフト PR として作成
- `--skip-ci-wait`: CI の完了を待たずに終了
- `--reviewer {username}`: レビュアーを指定
