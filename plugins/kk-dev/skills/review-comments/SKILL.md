---
name: review-comments
description: 現在のブランチの PR に付いたレビューコメント (ボット・ユーザー両方) を確認し、修正対応・返信する。トリガー - レビュー対応, コメント対応, review comments, 指摘に対応, ボットの指摘
disable-model-invocation: true
allowed-tools:
  - Bash(gh pr:*)
  - Bash(gh api:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(git push:*)
  - Read
  - Edit
  - Grep
  - Glob
---

# 現在の PR

- PR: !`gh pr view --json number,url --jq '"\(.url)"' 2>/dev/null || echo "PR なし"`

現在のブランチに関連する PR のコメントを確認し、レビューボットおよびユーザーからのコメントに対応・返信する。

## 対象となるレビュアー

### レビューボット

以下のユーザー名を **含む** コメントはボットからのコメントとして扱います (部分一致):

- greptile → 返信時は `@greptileai` をメンション
- coderabbit → 返信時は `@coderabbitai` をメンション
- claude → 返信時は `@claude` をメンション

### ユーザー

上記ボット以外のユーザーからのコメントも対象とします:

- **PR 作成者本人 (ユーザー) のコメント・追記要望も対象に含める**。「作成者本人のコメントだから」という理由でスキップしない
- 返信時はコメント投稿者のユーザー名をそのままメンション (例: `@kokoichi206`)

## 実行手順

1. **PR の特定**
   - `gh pr view --json number,url` で現在のブランチに紐づく PR を取得
   - PR が存在しない場合はエラーメッセージを表示して終了

2. **コメントの収集**
   - インラインのレビューコメントは GraphQL の `reviewThreads` で取得し、`isResolved` を判定する

     ```bash
     gh api graphql -f query='
       query($owner:String!, $repo:String!, $pr:Int!) {
         repository(owner:$owner, name:$repo) {
           pullRequest(number:$pr) {
             reviewThreads(first:100) {
               nodes {
                 isResolved
                 comments(first:50) {
                   nodes { databaseId body path author { login } }
                 }
               }
             }
           }
         }
       }' -F owner={owner} -F repo={repo} -F pr={pr_number}
     ```

     - **`isResolved: true` のスレッドは対象外として除外する** (resolved = 対応済みの明示シグナルのため再処理・重複返信しない)
     - 返信に必要な review comment の ID は各コメントの `databaseId` (REST のコメント ID と一致) を使う

   - `gh pr view --json comments` で issue comments も取得 (issue コメントに resolved の概念は無いため全件が対象)
   - 除外するのは自動化 bot 自身の投稿 (github-actions[bot] や claude[bot] など) のみ。**PR 作成者本人 (ユーザー) のコメントは除外せず対象に含める** (レビュー指摘への補足や追加要望であることが多く、スキップすると対応漏れになる)

3. **各コメントの処理**
   各コメントに対して以下を実施:

   a. コメント内容を分析
   - 指摘の種類を判定 (style, logic, syntax, security 等)
   - PR 作成者本人のコメントは追加の作業依頼・仕様の補足として読み、必要な修正を洗い出す
   - 対応が必要かどうかを判断
   - 対応不要な場合 (情報提供のみ、既に対応済み等) は理由を記録

   b. 対応が必要な場合
   - 該当ファイルを読み込んで現状を確認
   - 適切な修正を実施
   - 修正内容を記録

   c. 対応不要と判断した場合
   - その理由を明確に記録

4. **変更のコミットとプッシュ**
   - 修正があった場合のみ実施
   - 変更内容を適切なメッセージでコミット
   - リモートにプッシュ

5. **コメントへの返信**
   各コメントに対して GitHub 上で返信:
   - 対応した場合: 具体的にどう修正したかを説明
   - 対応不要と判断した場合: その理由を丁寧に説明
   - 返信は `gh api` を使用して POST
   - **重要**: コメント主に応じて正しいメンションを使用すること
     - **ボットの場合**: 専用メンションを使用
       - greptile → `@greptileai`
       - coderabbit → `@coderabbitai`
       - claude → `@claude`
     - **ユーザーの場合**: コメント投稿者のユーザー名をそのままメンション
       - 例: `@kokoichi206`, `@john-doe` など

   返信フォーマット例:

   ```
   @{適切なメンション} ご指摘ありがとうございます。

   [対応した場合]
   修正しました: {具体的な修正内容}

   [対応不要の場合]
   以下の理由により、現状のままとさせていただきます:
   - {理由}
   ```

6. **結果サマリーの出力**
   - 処理したコメント数
   - 対応したコメント数
   - 対応不要としたコメント数
   - 各コメントの対応状況一覧。PR 作成者本人のコメントも含めた全コメントについて、次のいずれかを明示する:
     - `対応した` — 修正内容とコミット
     - `対応不要` — そう判断した理由
     - `未対応` — 未対応のまま残る理由と、ユーザーに判断を仰ぐ点
   - 一覧に載っていないコメントが 1 件でもあれば、それは収集漏れとして扱い手順 2 からやり直す

## 注意事項

- resolved 済みのレビュースレッドは常に除外する (再オープンされた指摘のみが対象)
- セキュリティ関連の指摘は優先度高く対応すること
- 型安全性に関する指摘は慎重に検討すること
- TODO コメントで「将来対応」と明記されている項目への指摘は、その旨を返信で説明すること
- 大規模なアーキテクチャ変更を求める指摘は、対応不要として理由を説明すること

## 追加引数

$ARGUMENTS
