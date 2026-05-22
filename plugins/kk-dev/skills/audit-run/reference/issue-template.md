# GitHub Issue テンプレート

## Issue 本文

```markdown
# 定期監査レポート - {date}

**対象ブランチ**: {branch}
**コミット**: {commit-hash}
**実施日時**: {datetime}

---

## 総合スコア

| 監査カテゴリ       | スコア   | 重要項目             |
| ------------------ | -------- | -------------------- |
| セキュリティ       | X/10     | 高: X, 中: X, 低: X  |
| アーキテクチャ     | X/10     | 重大: X, 軽微: X     |
| ベストプラクティス | X/10     | 重要: X, 推奨: X     |
| UI/UX              | X/10     | 重大: X, 推奨: X     |
| 依存関係           | X/10     | Critical: X, High: X |
| **総合**           | **X/10** |                      |

---

## 緊急対応が必要な項目

(高リスク/重大/Critical な項目をリストアップ)

---

## 推奨アクションリスト

### 即座に対応 (今週中)

- [ ] 具体的なアクション項目

### 次回スプリント

- [ ] 具体的なアクション項目
```

## コメント追加 (5 件)

Issue 作成後、各監査カテゴリの詳細情報をコメントとして追加する:

```bash
gh issue create --title "[Audit] {date} 定期監査レポート" \
  --label "audit,automated" \
  --body "..."

# 各監査の詳細をコメントとして追加
gh issue comment {issue_number} --body "## セキュリティ監査詳細 ..."
gh issue comment {issue_number} --body "## アーキテクチャ監査詳細 ..."
gh issue comment {issue_number} --body "## ベストプラクティス監査詳細 ..."
gh issue comment {issue_number} --body "## UI/UX 監査詳細 ..."
gh issue comment {issue_number} --body "## 依存関係監査詳細 ..."
```

## 注意事項

- GitHub Issue は自己完結させること。外部ファイルへのリンクは使用せず、Issue 本文とコメントに全ての情報を含める
- 各コメントが GitHub コメントの文字数制限 (65536 文字) を超えないよう注意
