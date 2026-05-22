# cc-plugins

kokoichi206 個人用 Claude Code プラグイン集。

スキルを **名前空間 (`<plugin>:`) で区切る** ための marketplace。
開発支援は `kk-dev`、今後 `kk-writing` などカテゴリごとに plugin を追加していく。

## インストール

### 1. Marketplace を追加

Claude Code で `/plugin` を実行し、「Marketplaces」タブに移動:

```
/plugin → Marketplaces → Add Marketplace
```

Marketplace source に以下を入力:

```
kokoichi206/cc-plugins
```

> **Note**: HTTPS URL (`https://github.com/...`) だと認証エラーになる場合があります。
> `owner/repo` 形式を使用してください (SSH で接続されます)。

### 2. プラグインをインストール

Marketplace 追加後、「Plugins」タブから `kk-dev` プラグインをインストール。

## 含まれるプラグイン

### kk-dev

**kk** = kokoichi206 / **dev** = 開発カテゴリ

開発支援プラグイン。コマンドは `/kk-dev:<skill>` 形式で呼び出す。

| スキル                          | 説明                                                               |
| ------------------------------- | ------------------------------------------------------------------ |
| `/kk-dev:audit-run`             | 5 種の監査エージェントを並列実行し GitHub Issue にレポート         |
| `/kk-dev:codex-review`          | codex CLI を使用して現在の変更をレビュー                           |
| `/kk-dev:create-eslint-rule`    | カスタム ESLint ルールを作成                                       |
| `/kk-dev:create-pr`             | ブランチ作成→コミット→プッシュ→PR作成を一括実行                    |
| `/kk-dev:create-pr-auto-merge`  | PR 作成→レビュー対応→自動マージを一貫実行                          |
| `/kk-dev:fix-sentry-issue`      | Sentry Issue を調査し修正を実施                                    |
| `/kk-dev:learn-from-review`     | PR レビュー指摘から再発防止の仕組みを自動化                        |
| `/kk-dev:refactor`              | コードのリファクタリング提案                                       |
| `/kk-dev:review-comments`       | PR のレビューボットコメント (greptile, coderabbit 等) に対応・返信 |
| `/kk-dev:review-detailed`       | PR を詳細にレビュー (5 段階評価)                                   |
| `/kk-dev:test`                  | テストケースの生成・追加                                           |
| `/kk-dev:verify-implementation` | スクリーンショットで実装の動作確認                                 |

## 使用例

```
# PR を作成
/kk-dev:create-pr

# PR 作成からレビュー対応、マージまで一括実行
/kk-dev:create-pr-auto-merge

# PR のレビューボットコメントに対応
/kk-dev:review-comments

# プロジェクト全体の監査を実行
/kk-dev:audit-run

# codex CLI で変更をレビュー
/kk-dev:codex-review

# カスタム ESLint ルールを作成
/kk-dev:create-eslint-rule no-console-log を検出するルールを作って

# Sentry Issue を調査して修正
/kk-dev:fix-sentry-issue PROJ-123

# PR のレビュー指摘から学習して仕組み化
/kk-dev:learn-from-review 42

# PR を詳細にレビュー
/kk-dev:review-detailed 66

# リファクタリング提案を依頼
/kk-dev:refactor src/main.ts を見てリファクタリング提案して

# テストを生成
/kk-dev:test src/utils.ts のテストを書いて

# 実装の動作確認
/kk-dev:verify-implementation ログインボタンの修正
```

## 更新

### 自動更新 (推奨)

```
/plugin → Marketplaces → kokoichi206/cc-plugins → Enable auto-update
```

有効にすると、Claude Code 起動時に自動で最新版をチェック・更新する。

### 手動更新

```bash
# プラグインを更新
claude plugin update kk-dev@cc-plugins
```

> **Tip**: `claude plugin list` でインストール済みプラグインの名前とマーケットプレイス名を確認できる。
> `@` の後ろに表示されるマーケットプレイス名（`cc-plugins`）を使用すること。

更新後は Claude Code の再起動が必要な場合がある。

## アンインストール

```
/plugin uninstall kokoichi206/cc-plugins
```

## プラグイン / スキルの追加方法

新しいカテゴリの plugin を足す場合 (例: `kk-writing`):

1. `plugins/kk-writing/.claude-plugin/plugin.json` を作成
2. `.claude-plugin/marketplace.json` の `plugins` 配列に追記
3. `plugins/kk-writing/skills/<skill-name>/SKILL.md` を作成
4. `claude plugin validate .` で検証

既存 plugin にスキルを足す場合:

1. `plugins/kk-dev/skills/<skill-name>/SKILL.md` を作成
2. `claude plugin validate .` で検証

## プラグインで定義できるもの

| コンポーネント | 場所                     |
| -------------- | ------------------------ |
| agents         | `agents/*.md`            |
| skills         | `skills/<name>/SKILL.md` |
| hooks          | `hooks/hooks.json`       |
| MCP servers    | `.mcp.json`              |
| LSP servers    | `.lsp.json`              |
