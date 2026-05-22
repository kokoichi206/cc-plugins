# 出力フォーマット

## 分析結果レポート

```markdown
## Learn from Review - PR #{prNumber} 分析結果

### 分析したコメント

- レビューコメント: {count} 件
- レビュー: {count} 件
- Issue コメント: {count} 件

### 分類結果

| カテゴリ | 件数 | 主な指摘 |
| -------- | ---- | -------- |
| ...      | ...  | ...      |

### 実施した改善

1. **{改善タイプ}**: {説明}
   - ファイル: {path}
   - 内容: {概要}

### 作成した PR

- #{pr_number}: {title}
```

## 改善点がない場合

```markdown
## Learn from Review - PR #{prNumber} 分析結果

### 分析したコメント

- レビューコメント: {count} 件
- レビュー: {count} 件
- Issue コメント: {count} 件

### 結論

仕組み化すべき汎用的な改善点はありませんでした。
```
