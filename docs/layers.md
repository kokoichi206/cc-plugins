# レイヤー設計と作成物まとめ

cc-plugins に追加した plugin レイヤーとスキルの一覧・意図・選定根拠をまとめる。
「何を・どこに・どういう意図で作ったか」のインデックス。

## 背景 / 作り方

過去の Claude Code セッション履歴 (メインセッション 161 件 / 2026-03-30〜05-22) を集計し、
「実際に繰り返し依頼しているタスク種別」を抽出してレイヤー候補を割り出した。

- 各セッションの全ユーザー発言 (1711 件) をキーワードで多ラベル分類し、頻度を計測
- テーマ別に分析し、頻出かつ既存スキルで未カバーのものだけをスキル化
- `dev` 以外のシーン (インフラ運用・受託/コンサル業務・会計・ドキュメント) もレイヤーとして切り出した

### 選定方針

- **証拠のあるものだけ作る**: 頻度が低い / 既存スキルで足りるものは作らない
- **既存スキルと重複させない**: sentry 修正・汎用 review・汎用 test・dify・画像生成などは既存資産に任せる
- **最小権限**: 各 SKILL の `allowed-tools` は必要最小限。調査系は破壊的コマンドを含めない
- **規約反映**: 応答は日本語・半角記号優先、知ったかぶり禁止 (不明は確認/仮定明示)、fd/rg 使用、テストは仕様、詰まったら o3 MCP 相談

## レイヤー / スキル一覧

| レイヤー       | スキル              | 意図                                                                  | 使うシーン                                      |
| -------------- | ------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| **kk-dev**     | (既存 12 スキル)    | 開発支援 (PR・レビュー・監査・テスト・リファクタ等)                   | 日常の実装・レビュー作業                        |
| **kk-infra**   | `env-parity`        | staging↔production の env/IAM/Cloud Run 設定差分を抽出し是正案を提示  | 「本番は動くが staging だけ 401」等の環境差調査 |
| **kk-infra**   | `terraform-guard`   | Terraform を GHA 経由 apply 限定で進め、local apply/import を禁則化   | TF 変更・OIDC/IAM 構築時                        |
| **kk-infra**   | `deploy-triage`     | Cloud Build/Vercel/GHA のデプロイ失敗ログから根本原因を特定           | 「デプロイが落ちた、なんで？」の調査            |
| **kk-infra**   | `safe-migrate`      | drizzle/prisma migrate の接続先 (local/remote) を実行前検証し誤爆防止 | 本番誤爆が怖い migration 実行時                 |
| **kk-biz**     | `interview-digest`  | 面談メモを人別に整理し、印象/評価/稼働開始日の経営層向け叩き台を生成  | 採用/SES の複数面談後、上長へ共有・判断を仰ぐ時 |
| **kk-biz**     | `estimate`          | 工数・費用を振れ幅付きで、デモ版/本実装に分けて見積もり md 出力       | 受託案件の見積もり・提案時                      |
| **kk-biz**     | `hearing-prep`      | 見積もり精度を上げるヒアリング質問を「何が決まるか」付きで網羅生成    | 客先打ち合わせ前の準備                          |
| **kk-money**   | `expense-reconcile` | カード/銀行/Amazon 明細と領収書を突合し立替/精算漏れ・取り違えを検出  | 月次・確定申告前の立替精算                      |
| **kk-money**   | `tax-aggregate`     | 経費を勘定科目分類・按分・減価償却し集計、freee MCP で取込            | 確定申告の経費確定                              |
| **kk-writing** | `marp-deck`         | 元ネタから共有用 marp スライドを生成 (内部用語→聴衆向けに翻訳)        | 進捗/構成を顧客・社内へ共有する時               |
| **kk-writing** | `handoff-readme`    | 他社提供/引き継ぎ用の README・手順書を生成 (社内固有情報は除外)       | リポジトリ提供・引き継ぎ時                      |
| **kk-writing** | `hearing-to-spec`   | ヒアリングメモを決定/未決に整理し、候補+おすすめ付きで仕様確定 doc 化 | 顧客 MTG 前後の論点整理                         |

## 配置 (どこに作ったか)

```
.claude-plugin/marketplace.json     # 5 plugin を登録
plugins/
├── kk-dev/      (既存。README を plugin 配下に移設)
├── kk-infra/    .claude-plugin/plugin.json, README.md, skills/{env-parity,terraform-guard,deploy-triage,safe-migrate}/SKILL.md
├── kk-biz/      .claude-plugin/plugin.json, README.md, skills/{interview-digest,estimate,hearing-prep}/SKILL.md
├── kk-money/    .claude-plugin/plugin.json, README.md, skills/{expense-reconcile,tax-aggregate}/SKILL.md
└── kk-writing/  .claude-plugin/plugin.json, README.md, skills/{marp-deck,handoff-readme,hearing-to-spec}/SKILL.md
docs/layers.md                      # このファイル
```

各 plugin の `README.md` にスキル一覧と使用例を記載。ルート README は plugin 一覧のみ持つ。

## 見送った候補 (作らなかったもの)

- **kk-llm** (プロンプト/RAG/mastra): 実需が薄く、既存の `dify-workflow` / `claude-api` で充足
- **kk-data** (スクレイピング): 対象期間に新規 scaffolding の実需が観測できず。方法論は global CLAUDE.md に温存
- **汎用 summarize / refactor / test / security / sentry**: 既存スキルと重複するため見送り

## 既存 README リファクタとの関係

ルート README からスキル表を各 plugin README へ移す変更 (別 PR) を本 PR にも内包している。
そのため本 PR 単体でルート README は plugin 一覧構成になり、5 plugin がすべて plugin-level README を持つ。
