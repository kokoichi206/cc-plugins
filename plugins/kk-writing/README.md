# kk-writing

**kk** = kokoichi206 / **writing** = ドキュメント・ライティングカテゴリ

ドキュメント・ライティング支援プラグイン。元ネタから共有用スライドや引き継ぎ README、仕様確定ドキュメントを生成する。コマンドは `/kk-writing:<skill>` 形式で呼び出す。

> インストール方法はリポジトリルートの [README](../../README.md) を参照。

## スキル一覧

| スキル                        | 説明                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `/kk-writing:marp-deck`       | 元ネタから共有用の marp スライドを生成し、内部用語を聴衆向けに翻訳する |
| `/kk-writing:handoff-readme`  | 引き継ぎ・他社提供用の README / 手順書を章立てして生成する             |
| `/kk-writing:hearing-to-spec` | ヒアリングメモを決定/未決に整理し、候補とおすすめ付きで仕様化する      |

## 使用例

```
# 共有用の marp スライドを作成 (聴衆を顧客向けに)
/kk-writing:marp-deck docs/design.md --audience 顧客

# 他社提供用の README を作成
/kk-writing:handoff-readme . --audience external

# ヒアリングメモから仕様確定ドキュメントを作成
/kk-writing:hearing-to-spec notes/hearing-0522.md docs/todos/
```

## スキルを追加する

1. `plugins/kk-writing/skills/<skill-name>/SKILL.md` を作成
2. front-matter に `name` / `description` / `model` / `disable-model-invocation` などを記述
3. リポジトリルートの README のスキル一覧に追記
