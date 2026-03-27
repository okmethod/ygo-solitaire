# specs - フロー情報

機能開発ごとの仕様・計画・タスクを管理するディレクトリ。

---

## spec-kit ワークフロー

大規模な機能開発では以下のワークフローを使用:

1. `/speckit.specify` - 仕様作成
2. `/speckit.plan` - 実装計画作成
3. `/speckit.tasks` - タスク生成
4. `/speckit.implement` - タスク実行 + タスク進捗の記録（ tasks.md の更新）

### サブエージェント活用

- **Explore**: 既存設計調査、大規模な既存資源調査
- **Plan**: 技術的依存関係分析
- **サブエージェント隔離推奨**: テスト・Lint実行、詳細な型調査、外部ライブラリ調査、規約適合性チェック、等
  - メインスレッドは、修正の完了報告と次の判断に集中する

### コミット前チェックリスト（spec実装時）

1. `npm run test:run`
2. `npm run lint && npm run format`
3. tasks.md 更新: 完了タスクを `[x]` にマーク
4. コミット・push・PR作成

### タスクID管理

- **spec 実装中**: タスクID（T0xx）をコメント・コミットメッセージに記載
- **seec 実装完了後**: ソースコード・docs/ からタスクIDを削除

---

## ディレクトリ構成

```
specs/
├── README.md           # このファイル
└── 0xx-feature-name/   # 機能ごとのディレクトリ
    ├── spec.md         # 仕様
    ├── plan.md         # 実装計画
    └── tasks.md        # タスク進捗
```

**完了したspecは削除してOK**（git履歴にだけ残す）
