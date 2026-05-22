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

| プラグイン                         | 説明                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| [kk-dev](plugins/kk-dev/README.md) | 開発支援。PR 作成・レビュー・監査・テスト生成・リファクタなど |

各プラグインのスキル一覧・使用例は、リンク先の README を参照。

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

## 新しいプラグインを追加する

新しいカテゴリの plugin を足す場合 (例: `kk-writing`):

1. `plugins/kk-writing/.claude-plugin/plugin.json` を作成
2. `.claude-plugin/marketplace.json` の `plugins` 配列に追記
3. `plugins/kk-writing/skills/<skill-name>/SKILL.md` を作成
4. `plugins/kk-writing/README.md` を作成 (スキル一覧)
5. `claude plugin validate .` で検証

既存 plugin へのスキル追加手順は、各プラグインの README を参照。

## プラグインで定義できるもの

| コンポーネント | 場所                     |
| -------------- | ------------------------ |
| agents         | `agents/*.md`            |
| skills         | `skills/<name>/SKILL.md` |
| hooks          | `hooks/hooks.json`       |
| MCP servers    | `.mcp.json`              |
| LSP servers    | `.lsp.json`              |
