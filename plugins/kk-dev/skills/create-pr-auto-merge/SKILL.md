---
name: create-pr-auto-merge
description: PR 作成→レビューエージェント対応→自動マージを一貫実行する。/kk-dev:create-pr と /kk-dev:review-comments を組み合わせて使用。トリガー - PR 作成してマージ, auto merge, 自動マージ, PR 作成からマージまで
model: haiku
disable-model-invocation: true
argument-hint: "[--draft] [--skip-review-wait] [--merge-method squash|merge|rebase]"
allowed-tools:
  - Skill
  - Bash(gh pr:*)
  - Bash(gh repo:*)
  - Bash(gh api:*)
  - Bash(gh run:*)
  - Bash(sleep:*)
---

# PR 作成 → レビュー対応 → 自動マージ

`/kk-dev:create-pr` と `/kk-dev:review-comments` を組み合わせ、PR の作成からマージまでを一貫して実行する。

## 実行フロー

```
/kk-dev:create-pr → レビュー待機 → /kk-dev:review-comments → CI 再待機 → マージ
```

## Step 1: PR 作成

Skill tool で `/kk-dev:create-pr` を実行する。

引数がある場合はそのまま渡す (`--draft`, `--reviewer` 等)。

`/kk-dev:create-pr` の完了後、作成された PR の番号と URL を控えておく。

## Step 2: レビューエージェントの待機

CI 通過後、レビューエージェントのコメントを待機する。

### 2.1 待機ロジック

以下のループを実行 (30 秒間隔、最大 20 回 = 10 分):

```bash
# review comments (コード行へのコメント) を取得
gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments

# issue comments (PR 全体へのコメント) を取得
gh pr view {pr_number} --json comments
```

### 2.2 対象レビュアー

以下のユーザー名を **含む** コメントが対象 (部分一致):

- `greptile`
- `coderabbit`
- `claude`

### 2.3 待機完了条件

以下の **いずれか** を満たしたらレビュー待機を終了:

- 対象レビュアーから 1 件以上のコメントが付いた → Step 3 へ
- 最大待機回数 (20 回) に到達した → レビューなしとみなして Step 4 へ

## Step 3: レビュー指摘への対応

Skill tool で `/kk-dev:review-comments` を実行する。

`/kk-dev:review-comments` がコメントの分析・対応・返信・コミット・プッシュまでを行う。

コード修正が発生した場合は CI を再度待機する:

```bash
gh pr checks --watch --interval 30
```

## Step 4: マージ

### 4.1 マージ前チェック

- CI がすべて通過していることを確認
- マージ可能な状態 (conflict なし) であることを確認

```bash
gh pr view {pr_number} --json mergeable,mergeStateStatus
```

### 4.2 マージ実行

```bash
gh pr merge {pr_number} --squash --delete-branch
```

- squash merge をデフォルトとする
- マージ後にリモートブランチを削除

### 4.3 マージ失敗時

- ブランチ保護ルール等でマージできない場合はエラーメッセージを表示して終了
- conflict がある場合はベースブランチを取り込んで解決を試みる

## Step 5: 結果サマリー

最終的に以下を出力:

- PR URL
- マージ結果 (成功/失敗)
- レビューコメント対応の有無
- CI 実行回数

## オプション引数

$ARGUMENTS

引数で以下を指定可能:

- `--draft`: ドラフト PR として作成 (マージは行わない)
- `--merge-method {squash|merge|rebase}`: マージ方法を指定 (デフォルト: squash)
- `--no-delete-branch`: マージ後にブランチを削除しない
- `--skip-review-wait`: レビュー待機をスキップして CI 通過後すぐマージ
- `--reviewer {username}`: レビュアーを指定

## 注意事項

- GitHub CLI (`gh`) が認証済みであること
- ブランチ保護ルールによりマージできない場合がある
- レビューエージェントが設定されていない場合は待機後にそのままマージへ進む
