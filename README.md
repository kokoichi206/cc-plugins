# cc-plugins

kokoichi206 個人用 Claude Code プラグイン集。

スキルを **名前空間 (`<plugin>:`) で区切る** ための marketplace。
開発支援は `kk-dev`、それ以外も `kk-infra` / `kk-biz` / `kk-money` / `kk-writing` などカテゴリごとに plugin を追加していく。

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

Marketplace 追加後、「Plugins」タブから使いたいプラグインをインストール。

## 含まれるプラグイン

| プラグイン                                 | 説明                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [kk-dev](plugins/kk-dev/README.md)         | 開発支援。PR 作成・レビュー・監査・テスト生成・リファクタなど                 |
| [kk-infra](plugins/kk-infra/README.md)     | インフラ/クラウド運用。env 差分・Terraform 運用・デプロイ調査・安全な migrate |
| [kk-biz](plugins/kk-biz/README.md)         | 受託/コンサル業務。面談整理・工数見積もり・ヒアリング設計                     |
| [kk-money](plugins/kk-money/README.md)     | 会計/確定申告。立替突合・経費集計 (freee 連携)                                |
| [kk-writing](plugins/kk-writing/README.md) | ドキュメント。marp スライド・引き継ぎ README・仕様確定                        |

各プラグインのスキル一覧・使用例は、リンク先の README を参照。
レイヤーごとの意図・選定根拠は [docs/layers.md](docs/layers.md) にまとめている。

## 更新

### 自動更新 (推奨)

```
/plugin → Marketplaces → kokoichi206/cc-plugins → Enable auto-update
```

有効にすると、Claude Code 起動時に自動で最新版をチェック・更新する。

### 手動更新

```bash
# プラグインを更新 (例: kk-dev)
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

新しいカテゴリの plugin を足す場合 (例: `kk-xxx`):

1. `plugins/kk-xxx/.claude-plugin/plugin.json` を作成
2. `.claude-plugin/marketplace.json` の `plugins` 配列に追記
3. `plugins/kk-xxx/skills/<skill-name>/SKILL.md` を作成
4. `plugins/kk-xxx/README.md` を作成 (スキル一覧)
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
