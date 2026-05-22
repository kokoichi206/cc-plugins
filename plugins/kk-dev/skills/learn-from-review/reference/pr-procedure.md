# PR 作成手順

```bash
# PR 作成者を取得
PR_AUTHOR=$(gh pr view {prNumber} --json author --jq '.author.login')

# ブランチ作成
git checkout -b learn-from-review/pr-{prNumber}

# 変更をコミット
git add -A
git commit -m "chore: learn from PR #{prNumber} review comments"

# PR 作成 (元 PR の作成者をレビュワーに設定)
gh pr create \
  --title "chore: PR #{prNumber} のレビュー指摘から学習した改善" \
  --body "..." \
  --label "automated" \
  --reviewer "$PR_AUTHOR"
```
