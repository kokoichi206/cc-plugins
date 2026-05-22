---
name: env-parity
description: GCP Cloud Run などの staging↔production の env 変数/起動フラグ/IAM(未認証アクセス可否)/接続先(Supabase 等)の差分を抽出し、是正コマンド案を提示する (read-only 調査)。トリガー - env 差分, environment parity, Cloud Run 差分, staging production 比較, 401 未認証, IAM 確認, env-parity
model: opus
disable-model-invocation: true
argument-hint: "<service名> [--env staging,production]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(gcloud run services describe:*)
  - Bash(gcloud run services list:*)
  - Bash(gcloud run revisions:*)
  - Bash(gcloud iam:*)
  - Bash(gcloud projects get-iam-policy:*)
---

# Cloud Run env パリティ調査

Cloud Run サービスの staging と production の差分 (env 変数 / 起動フラグ / IAM の未認証アクセス可否 / 接続先) を抽出し、是正コマンド案を提示する。**調査専用** で、変更は確認後にユーザーが実行する。

このスキルは read-only。`gcloud run services update` / `gcloud run deploy` / `gcloud run services add-iam-policy-binding` のような変更系コマンドは打たない (allowed-tools にも含めない)。

## 引数

- `$ARGUMENTS`: `<service名> [--env staging,production]`
  - `<service名>`: 比較対象の Cloud Run サービス名
  - `--env`: 比較する環境 (デフォルト `staging,production`)。プロジェクト/リージョンの対応が不明なら**勝手に推測せず質問する** (知ったかぶり禁止)

## 想定する課題

- 「本番は動くが staging だけ 401 / 未認証拒否」 → env 不一致 or IAM 不一致が原因のことが多い
- 「JWT 検証に失敗して 401、staging の環境変数が production の Supabase を指している」 → 接続先 (env) の取り違え

これらは **env 不一致由来を最優先で疑う**。

## 手順

### 1. 対象サービス/環境の特定

- `$ARGUMENTS` から service 名と環境リストを取得する
- 各環境の GCP プロジェクト ID / リージョンを確定する
  - リポジトリ内の設定 (`cloudbuild.*.yaml`, `Makefile`, `.github/workflows/*`, `terraform/`) を `rg` / Glob で探して対応を裏取りする
  - 確定できない場合は**仮定として明示するか、ユーザーに質問する**。当て推量で進めない

### 2. 各環境の現状を取得 (read-only)

環境ごとに以下を取得する (project/region は環境に合わせて差し替え):

```bash
# サービス定義 (env / フラグ / 公開設定)
gcloud run services describe <service> \
  --project <project> --region <region> --format yaml

# IAM (未認証アクセス = allUsers に roles/run.invoker が付いているか)
gcloud run services get-iam-policy <service> \
  --project <project> --region <region> --format yaml
```

確認する主な項目:

- env 変数 (`spec.template.spec.containers[].env`) と Secret 参照 (`valueFrom.secretKeyRef`)
- 起動フラグ系: `--cpu`, `--memory`, `--concurrency`, `--min-instances`, `--max-instances`, `--timeout`, `--ingress`, `--vpc-connector`, `--port`, コンテナイメージ tag
- IAM: `allUsers` に `roles/run.invoker` があるか (= 未認証アクセス可否)
- 接続先: `DATABASE_URL` / `SUPABASE_URL` / 各種エンドポイントの向き先

### 3. リポジトリ設定との突合

- `cloudbuild.staging.yaml` / `cloudbuild.production.yaml` などのデプロイ定義を Read し、宣言された env/フラグと実環境の差を確認する
- `.env`, `.env.staging`, `.env.production`, `*.tfvars` 等があれば該当値を確認する (探索は `rg` / Glob を使う。find/grep は使わない)
- 宣言と実環境がずれている場合は「設定ファイルでは X だが実環境は Y」という形で明示する

### 4. 差分を表で提示

カテゴリごとに差分表を出す:

| 項目             | 種別 | staging | production | 差分/所見                         |
| ---------------- | ---- | ------- | ---------- | --------------------------------- |
| SUPABASE_URL     | env  | xxx     | yyy        | 接続先が異なる                    |
| allUsers invoker | IAM  | なし    | あり       | staging が未認証拒否 → 401 の疑い |
| memory           | flag | 256Mi   | 512Mi      | リソース差                        |

- **シークレット値は必ずマスク** する (`****` や末尾数文字のみ表示)。生の secret 値を出力しない
- 401 / 未認証拒否の症状がある場合は、IAM (allUsers invoker) と認証関連 env を最優先で照合する

### 5. 是正案の提示 (適用は確認後)

差分ごとに是正案を提示する。実行はせず提案にとどめ、ユーザーの承認後に別途実行してもらう:

- env 修正例 (例):
  ```bash
  gcloud run services update <service> \
    --project <project> --region <region> \
    --update-env-vars SUPABASE_URL=<正しい値>
  ```
- 未認証アクセスを揃える例 (例):
  ```bash
  gcloud run services add-iam-policy-binding <service> \
    --project <project> --region <region> \
    --member=allUsers --role=roles/run.invoker
  ```
- yaml 管理の場合は cloudbuild/terraform 側の修正箇所を示す

> いずれも提案。**このスキルからは実行しない**。適用可否はユーザーが判断する。

## 注意事項

- CLAUDE.md のコーディング/対話規約に従う (応答は日本語、全角括弧禁止・半角記号優先)
- 知ったかぶり禁止: project/region/環境対応が不明なら埋めずに質問する、または仮定として明示する
- シークレット値はマスク表示。生値をログ/出力に残さない
- 「本番は動くが staging だけ 401 / 未認証拒否」のような env・IAM 不一致由来を最優先で疑う
- このスキルは read-only。変更系 gcloud コマンドは実行しない (提案のみ)
- ファイル探索は fd/rg を使う (find/grep は使わない)
- 詰まったら o3 MCP に英語で相談する
