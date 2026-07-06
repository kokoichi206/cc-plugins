---
name: create-pr
description: 現在の変更からブランチ作成、コミット、プッシュ、PR 作成までを一括実行する。detached HEAD の検出・base ブランチ解決・CI 完了確認まで行う。トリガー - PR 作成, プルリクエスト, pull request, ブランチ作成して PR
disable-model-invocation: true
argument-hint: "[--draft] [--base branch] [--skip-ci-wait] [--skip-codex] [--reviewer username]"
allowed-tools:
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(git push:*)
  - Bash(git checkout:*)
  - Bash(git switch:*)
  - Bash(git branch:*)
  - Bash(git symbolic-ref:*)
  - Bash(git rev-parse:*)
  - Bash(git ls-remote:*)
  - Bash(git fetch:*)
  - Bash(git log:*)
  - Bash(gh pr:*)
  - Bash(gh run:*)
  - Bash(gh repo:*)
  - Bash(which:*)
  - Bash(sleep:*)
  - Bash(infracost:*)
  - Bash(test -f:*)
  - Bash(*codex*)
  - Read
---

# 現在の状態

- ブランチ: !`git branch --show-current`
- HEAD: !`git symbolic-ref -q --short HEAD || echo "(detached HEAD)"`
- 状態: !`git status --short`
- 差分: !`git diff`

# 指示

現在の変更を確認し、以下のステップで PR を作成する。**この skill は PR を作成するところまでで、マージは行わない** (マージはユーザーの明示承認が必要)。

## 1. 事前チェック

### 1.1 リモートとの同期

- `git fetch origin` を実行する。

### 1.2 base ブランチの解決

以下の優先順で base ブランチを決める:

1. `--base <branch>` が指定されていればそれを使う。
2. リポジトリの `CLAUDE.md` / `AGENTS.md` にブランチ規約 (例: 「PR は develop に向ける」) があればそれに従う。
3. リモートに `develop` ブランチが存在すればそれを base にする:

   ```bash
   git ls-remote --heads origin develop
   ```

4. いずれも無ければ default branch を使う:

   ```bash
   gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
   ```

解決した base は以降のステップで使い、結果サマリーにも明示する。確信が持てない場合はユーザーに確認する。

### 1.3 ブランチの確定

統合ブランチ (`main` / `develop` 等) 上や detached HEAD のまま **コミットすると PR を作成できない** (push 先ブランチが無い / 保護ルールで弾かれる)。コミットの前に作業ブランチを必ず確定する。

1. detached HEAD かどうかを判定する:

   ```bash
   git symbolic-ref -q HEAD
   ```

   (終了コードが非 0 なら detached HEAD)

2. 次のいずれかに該当する場合は、**コミットする前に** 作業ブランチを新規作成する:
   - detached HEAD である
   - base ブランチ (`main` / `develop` 等) 上にいて、未コミットの変更または base より先行するローカルコミットがある

   ```bash
   git switch -c <feature-branch>
   ```

   - ブランチ名は変更概要から生成する。命名は `git log --oneline` の既存慣習 (`feature/xxx`, `fix/xxx`, `chore/xxx` など) に合わせる。
   - detached HEAD に既存のローカルコミットがある場合も `git switch -c` はそのコミットを引き継ぐため、内容を失わずにブランチ化できる。

3. 既に適切な作業ブランチにいる場合はそのまま進む。

### 1.4 スコープ純度チェック

- `git status` の新規ファイルと差分 (`git diff`、コミット済みがあれば `git diff origin/<base>...HEAD`) を確認する。
- 依頼したタスクと無関係な差分や、コミットすべきでない一時ファイル (`memo.md`, `aaa.json`, スクラッチ用 SQL / ダンプ、生成物など) が混ざっていないか確認する。
- 混ざっている場合はステージから外す、または別 PR に分けることを提案する。判断に迷うものはユーザーに確認する。

## 2. コミットと事前レビュー

### 2.1 コミット

- スコープ内の変更をステージングしてコミットする。コミットメッセージは変更内容を簡潔に説明する。

### 2.2 セルフレビューと codex レビュー (既定 on)

`--skip-codex` が指定されている場合、または `codex` CLI が無い場合はスキップする。

1. まず自分で差分をセルフレビューし、明らかな問題があれば修正する。
2. codex CLI の有無を確認する:

   ```bash
   which codex
   ```

   無ければ「codex CLI が無いためスキップ」と表示して次へ進む。

3. base との差分を codex に渡してレビューする:

   ```bash
   git diff origin/<base>...HEAD | codex exec "この差分をレビューして、バグ・セキュリティ問題・改善点を指摘してください。"
   ```

4. 重大な指摘 (バグ / セキュリティ / 型不整合) は修正して追加コミットする。対応不要と判断したものは理由を記録する。

分類・報告の詳細な流れは `/kk-dev:codex-review` を参照。

## 3. PR 作成

1. リモートにプッシュする:

   ```bash
   git push -u origin <branch>
   ```

2. PR テンプレートを検出する (3.1 参照)。
3. PR 本文を作成する (3.2 の規約に従い、3.3 の必須セクションを含める)。
4. PR を作成する。**タイトルは英語**、本文は日本語で可:

   ```bash
   gh pr create --base <base> --title "<English title>" --body "<body>"
   ```

   - `--draft` 指定時は `--draft` を付ける。
   - `--reviewer <username>` 指定時は `--reviewer` を付ける。

### 3.1 PR テンプレートの検出

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
- **テンプレートが見つからない場合**: 従来通り変更内容から PR 本文を自動生成する (3.2 の規約に従う)。

### 3.2 PR 本文の規約

- 概要を中心にする。変更の全列挙や冗長な説明は避け、レビュアーが理解に必要な情報に絞る。
- 意図的に対応しなかった点や既知の制約がある場合のみ「やってないこと」節を設ける。
- DB 変更を含む場合は、DDL (スキーマ変更) と data (seed / バックフィル) を別々のコードブロックに分けて貼る。
- 検証ログ・スクリプトなど長くなるものは `<details>` で畳み、要点だけ展開表示する。

### 3.3 検証セクションと仕様突合 (必須)

テンプレートの有無にかかわらず、PR 本文に以下の 2 セクションを必ず含める
(テンプレートに `## Test plan` 等の相当セクションがある場合はそこに統合してよい)。

#### 検証

このセッションで実際に実施した検証を、実行コマンド・確認手順・結果 (ログ抜粋・スクショ) つきで列挙する。
「動くはず」ではなく、実行した事実だけを書く。

- リポジトリに lint・test・型チェックが定義されていて未実行なら、PR 作成前にここで実行して結果を記載する
- それでも動作検証が何もない場合は `検証: 未実施` と明記し、PR を `--draft` で作成する。
  結果サマリーでも未検証であることを警告する

#### 仕様との突合

この変更の元になった要求 (ユーザーの指示・issue・渡された仕様や資料) の各項目を列挙し、対応状態を付ける:

- `対応` — 実装した箇所 (ファイル) を添える
- `逸脱` — 要求と違う形にした点。理由を 1 行で添える
- `対象外` — 今回のスコープから外した点

要求に無いのに加えた変更もここに列挙する。
逸脱・対象外・要求外の追加が 1 つでもある場合は、PR 本文だけでなく結果サマリーでも目立つ形で報告する。

## 4. Terraform コスト見積もり (条件付き)

diff に `.tf` ファイルが含まれる場合のみ実行する。含まれない場合はこのステップをスキップ。

### 4.1 infracost の確認

```bash
which infracost
```

### 4.2 infracost がある場合

1. `.tf` ファイルが存在するディレクトリを特定する
2. コスト見積もりを実行:

   ```bash
   infracost diff --path <tf ディレクトリ>
   ```

3. 結果を PR 本文の `## Cost Estimate` セクションに含める (`gh pr edit` で追記)

### 4.3 infracost がない場合

PR 本文には何も追加しない。結果サマリーで以下を表示:

> infracost をインストールすると Terraform の変更に対するコスト見積もりを PR に含められます。

## 5. CI の実行待機

### 5.1 CI ステータスの監視 (ポーリング)

- **`gh pr checks --watch` を前景で実行しない** (ターミナルを長時間占有し、permission でも弾かれやすい)。
- 代わりにポーリングする。`gh pr checks <pr>` (`--watch` なし) は現在のステータスを返して即座に終了するので、完了するまで一定間隔で繰り返す:

  ```bash
  # 30 秒間隔で最大 20 回 (10 分)。pending の間は sleep 30 を挟んで再実行する
  gh pr checks <pr>
  ```

- どうしても `--watch` を使う場合はバックグラウンド実行にして、出力をポーリングで確認する (前景をブロックしない)。

### 5.2 CI 結果の確認

- **成功**: 完了メッセージを表示し、PR URL を出力する。
- **失敗**: 失敗した job のログを取得して原因を分析する:

  ```bash
  gh run view <run_id> --log-failed
  ```

  - 失敗が **コード起因** か **runner / 権限起因** (GitHub Actions runner の課金停止・権限不足など、コード修正では直らないもの) かを切り分けて報告する。
  - コード起因の場合は修正して再度プッシュし、CI を再確認する。

`--skip-ci-wait` 指定時はこのステップをスキップする。

## 6. PR の実在確認

完了を報告する前に、PR とブランチが実在し push 済みであることを外部実体で確認する:

```bash
gh pr view --json url,headRefName,commits
```

- `headRefName` が作成したブランチと一致し、`commits` に想定のコミットが含まれることを確認する。
- 確認できて初めて「PR を作成した」と報告する。

## 7. 結果サマリー

最終的に以下を出力:

- PR URL
- base ブランチ
- CI ステータス (成功 / 失敗 / スキップ)
- codex レビューの結果 (実施 / スキップ、指摘への対応)
- 検証状態 (実施した検証の要約 / 未実施の警告)
- 仕様との逸脱・要求外の追加の有無
- スコープ純度チェックで除外したファイル (あれば)
- 変更ファイル数とコミット数

## オプション引数

$ARGUMENTS

引数で以下を指定可能:

- `--draft`: ドラフト PR として作成
- `--base {branch}`: base ブランチを明示指定 (自動解決を上書き)
- `--skip-ci-wait`: CI の完了を待たずに終了
- `--skip-codex`: PR 前の codex レビューをスキップ
- `--reviewer {username}`: レビュアーを指定
