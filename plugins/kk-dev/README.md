# kk-dev

**kk** = kokoichi206 / **dev** = 開発カテゴリ

開発支援プラグイン。コマンドは `/kk-dev:<skill>` 形式で呼び出す。

> インストール方法はリポジトリルートの [README](../../README.md) を参照。

## スキル一覧

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

## スキルを追加する

1. `plugins/kk-dev/skills/<skill-name>/SKILL.md` を作成
2. このREADME の「スキル一覧」に追記
3. `claude plugin validate .` で検証
