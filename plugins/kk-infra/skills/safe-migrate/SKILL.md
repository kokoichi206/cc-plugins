---
name: safe-migrate
description: drizzle/prisma の migrate 実行前に接続先が local か remote(staging/prod) かを判定して明示し、prod 誤爆を防ぐ。トリガー - migrate, drizzle migrate, prisma migrate, マイグレーション, db migrate, 接続先確認, safe-migrate
disable-model-invocation: true
argument-hint: "[drizzle|prisma] [--apply]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(pnpm:*)
  - Bash(npx drizzle-kit:*)
  - Bash(npx prisma:*)
---

# 安全マイグレーション

drizzle / prisma の migrate を流す前に、**接続先が local か remote (staging/prod) か** を判定して明示する。prod 誤爆を防ぐためのガード。

## 引数

- `$ARGUMENTS`: `[drizzle|prisma] [--apply]`
  - ORM 種別: 省略時は自動検出する
  - `--apply`: migrate を実際に流す意思表示。ただし **remote 判定時は `--apply` でも必ず確認を取る**

## 手順

### 1. ORM の検出

- `$ARGUMENTS` に指定があればそれを使う
- なければ自動検出 (`rg` / Glob で裏取り):
  - drizzle: `drizzle.config.*`, `drizzle-kit` 依存
  - prisma: `prisma/schema.prisma`, `@prisma/client` 依存
- 両方ある / 判別不能なら**勝手に決めずユーザーに確認する** (知ったかぶり禁止)

### 2. 接続先の解決

- 接続文字列を特定する: `DATABASE_URL`, `DIRECT_URL`, drizzle config の `dbCredentials`, prisma の `datasource db.url` など
- env の読み込み元 (`.env`, `.env.local`, シェル環境, CI secret) を確認し、**実際に使われる値の host** を解決する
- host が解決できない場合は**実行しない**。どの env が効くか曖昧なまま流さない

### 3. local / remote の判定

解決した host で判定する:

- **local (安全)**: `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`, Supabase local の port `54322`, docker のサービス名 (`db`, `postgres` 等) など
- **remote (危険)**: 上記以外。特に staging/prod のホスト名、マネージド DB のエンドポイント

判定を**必ず明示**する:

- local の場合:
  > 接続先は **local** (`<host>`) です。安全に実行できます。
- remote の場合 (強調して警告):
  > **!!! 警告: 接続先は REMOTE (`<host>`) です !!!**
  > これは staging/prod の可能性があります。migrate は不可逆です。本当に実行しますか?

判定不能なら:

> 接続先を確定できませんでした。安全のため実行しません。

### 4. migrate 実行 (確認ゲート付き)

- **local かつ `--apply`**: そのまま実行してよい
- **local だが `--apply` なし**: dry-run / 生成のみ (`generate`) にとどめ、apply はしない
- **remote**: `--apply` の有無に関わらず**明示的な確認を必須**にする。確認が取れるまで実行しない
- **判定不能**: 実行しない

実行コマンド例 (ORM に合わせる):

```bash
# drizzle
npx drizzle-kit generate   # マイグレーション生成
npx drizzle-kit migrate    # 適用 (確認ゲート通過後)

# prisma
npx prisma migrate dev     # local 開発用
npx prisma migrate deploy  # 適用 (確認ゲート通過後)
```

### 5. 適用後の確認

- 適用後に状態を確認する:
  - drizzle: 生成された SQL / 適用済みマイグレーションを確認
  - prisma: `npx prisma migrate status` で最新状態を確認
- 適用したマイグレーション名と接続先 (local/remote) を報告する

## 注意事項

- CLAUDE.md のコーディング/対話規約に従う (応答は日本語、全角括弧禁止・半角記号優先)
- **prod への migrate は不可逆**。`--apply` でも remote 判定時は必ず確認を取る
- **判定不能なら実行しない**。曖昧なまま流さない
- 知ったかぶり禁止: ORM 種別・接続先 env が不明なら質問する、または仮定として明示する
- シークレットを含む接続文字列は host のみ表示し、認証情報はマスクする
- ファイル探索は fd/rg を使う (find/grep は使わない)
- 詰まったら o3 MCP に英語で相談する
