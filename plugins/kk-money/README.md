# kk-money

**kk** = kokoichi206 / **money** = 会計・確定申告カテゴリ

会計・確定申告支援プラグイン。明細と領収書の突合や、経費の年次集計を行う。コマンドは `/kk-money:<skill>` 形式で呼び出す。

> インストール方法はリポジトリルートの [README](../../README.md) を参照。

## スキル一覧

| スキル                        | 説明                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| `/kk-money:expense-reconcile` | 明細 CSV と領収書を突合し、立替/経費の対応関係と精算漏れ・取り違えを検出  |
| `/kk-money:tax-aggregate`     | 経費を勘定科目で分類し、家事按分・減価償却を適用して年次集計 (freee 取込) |

## 使用例

```
# 明細 CSV と領収書ディレクトリを突合
/kk-money:expense-reconcile statements/card.csv receipts/

# 立替分を抽出し、対応するクレジット支払いを確認
/kk-money:expense-reconcile 俺が立て替えたものを出して。対応する日付にクレジット支払いがあるか確認して

# 確定申告用に経費を年次集計 (年指定)
/kk-money:tax-aggregate shinkoku/ --year 2025

# freee へ取込できる形で集計
/kk-money:tax-aggregate shinkoku/ --year 2025
```

## スキルを追加する

1. `plugins/kk-money/skills/<skill-name>/SKILL.md` を作成
2. frontmatter に `name` / `description` / `model` / `allowed-tools` を最小限で記述
3. リポジトリルートの README の手順に従って検証する
