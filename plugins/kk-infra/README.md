# kk-infra

**kk** = kokoichi206 / **infra** = インフラ・クラウド運用カテゴリ

インフラ/クラウド運用支援プラグイン。GCP Cloud Run, Terraform, デプロイ調査, DB マイグレーションなど、誤爆しやすい運用作業を安全に進めるためのスキルを提供する。コマンドは `/kk-infra:<skill>` 形式で呼び出す。

> インストール方法はリポジトリルートの [README](../../README.md) を参照。

## スキル一覧

| スキル                      | 説明                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/kk-infra:env-parity`      | Cloud Run の staging↔production の env/起動フラグ/IAM/接続先の差分を抽出し是正案を提示 (read-only 調査) |
| `/kk-infra:terraform-guard` | Terraform 変更を plan/validate/fmt までローカルで確認し、apply はローカル禁止で GitHub Actions を発火   |
| `/kk-infra:deploy-triage`   | Cloud Build/Vercel/GitHub Actions のデプロイ失敗ログから根本原因を特定 (調査主体, 修正は提案)           |
| `/kk-infra:safe-migrate`    | drizzle/prisma の migrate 前に接続先が local か remote かを判定し prod 誤爆を防止                       |

## 使用例

```
# Cloud Run の staging と production の差分を確かめる
/kk-infra:env-parity my-api --env staging,production

# Terraform 変更を安全に進める (apply はローカルで打たず GHA を発火)
/kk-infra:terraform-guard Cloud Run のメモリを 512Mi に変更

# デプロイ失敗の根本原因を調べる
/kk-infra:deploy-triage https://github.com/owner/repo/pull/123

# migrate がどこを向くか判定してから安全に流す
/kk-infra:safe-migrate drizzle
```

## スキルを追加する

1. `plugins/kk-infra/skills/<skill-name>/SKILL.md` を作成
2. このREADME の「スキル一覧」に追記
3. `claude plugin validate .` で検証
