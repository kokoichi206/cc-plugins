---
name: deploy-triage
description: Cloud Build/Vercel/GitHub Actions のデプロイ失敗ログから根本原因を特定する (調査主体, 修正は提案)。トリガー - デプロイ失敗, deploy 失敗, CI 失敗, ビルド失敗, build エラー調査, deploy-triage
disable-model-invocation: true
argument-hint: "<PR URL | run ID | サービス名>"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(gh run:*)
  - Bash(gh pr:*)
  - Bash(gcloud builds list:*)
  - Bash(gcloud builds log:*)
  - Bash(gcloud run services describe:*)
---

# デプロイ失敗トリアージ

Cloud Build / Vercel / GitHub Actions のデプロイ失敗ログから**根本原因を特定**する。調査が主目的で、修正は提案にとどめる (適用はユーザー承認後)。

特に注目するのは「**ローカルでは再現しないが CI でだけ失敗する**」差分: env 不一致 / キャッシュ / platform・arch / 認証。

## 引数

- `$ARGUMENTS`: `<PR URL | run ID | サービス名>` のいずれか
  - PR URL: その PR の最新 CI を起点に調査
  - run ID: 特定の GitHub Actions run を調査
  - サービス名: そのサービスの直近デプロイ (Cloud Build 等) を調査
  - どの基盤 (GHA / Cloud Build / Vercel) か不明なら**推測で進めず確認する** (知ったかぶり禁止)

## 手順

### 1. 失敗対象の特定

引数の種類に応じて失敗した実行を特定する:

```bash
# GitHub Actions
gh run list --limit 10
gh pr checks <PR番号 or URL>

# Cloud Build
gcloud builds list --limit 10 --filter="status=FAILURE"
```

- Vercel の場合はデプロイ URL / ダッシュボードのログ提示を求める (CLI/権限がなければ無理に進めない)

### 2. 失敗ログの取得

```bash
# GitHub Actions: 失敗ステップのログのみ
gh run view <run-id> --log-failed

# Cloud Build: ビルドログ
gcloud builds log <build-id>
```

- ログは末尾のエラーだけでなく、失敗の起点まで遡って読む

### 3. 失敗ステージの分類

どの段階で落ちたかを分類する:

- **build**: 依存解決 / コンパイル / lint / 型エラー
- **push**: イメージ push / レジストリ認証
- **deploy**: Cloud Run / Vercel への反映、env/secret 不足
- **migrate**: DB マイグレーション失敗
- **health-check**: 起動後のヘルスチェック / readiness 失敗

### 4. 根本原因の切り分け

ステージに応じて以下の観点で原因を絞る。**ローカルと CI の差**を特に疑う:

- **env 不一致**: CI 側に env/secret が無い・値が違う (必要なら `gcloud run services describe` で実環境を確認)
- **権限**: サービスアカウント / OIDC / レジストリ権限不足
- **イメージ / lockfile**: lockfile 不整合、`--frozen-lockfile` 失敗、依存バージョン差
- **platform / arch**: ローカル arm64 と CI amd64 の差、`--platform` 指定漏れ
- **タイムアウト**: build/deploy/health-check のタイムアウト
- **キャッシュ**: 古いレイヤキャッシュ / キャッシュ汚染による再現性の崩れ

必要に応じて、失敗を混入させた **PR / コミットを特定** する (`gh pr view`, `git log` 相当の調査)。

難所 (原因が読み切れない / 再現条件が不明) は **o3 MCP に英語で相談** する。

### 5. 修正案の提示

特定した根本原因と修正案を提示する。修正の適用はユーザー承認後:

- 原因 (どのステージ / どの差分か)
- 根拠 (ログの該当箇所)
- 修正案 (設定変更 / コード修正 / 再実行手順)
- 再発防止の提案 (あれば)

## 注意事項

- CLAUDE.md のコーディング/対話規約に従う (応答は日本語、全角括弧禁止・半角記号優先)
- 「ローカルでは再現しないが CI でだけ失敗する」差 (env, キャッシュ, platform, 認証) に注目する
- 調査が主目的。修正は提案にとどめ、適用はユーザー承認後にする
- 知ったかぶり禁止: 基盤種別・対象が不明なら推測せず質問する。原因が不確かなら断定しない
- シークレット値はマスクして扱う
- ファイル探索は fd/rg を使う (find/grep は使わない)
- 難所は o3 MCP に英語で相談する
