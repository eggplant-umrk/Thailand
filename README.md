# タイ語えほん（雛形）

タイの民話を絵本形式で読みながらタイ語を学べる学習アプリの雛形です。React + Vite で構築しています。

対象は小学校高学年くらいの子供、タイ語は初学者向け（文字は少しずつ、ローマ字/カタカナの発音表記を併記）を想定しています。

## セットアップ

```bash
npm install
npm run dev
```

## 構成

```
src/
  stories/
    story01.json      物語データ（最小限のダミー・プレースホルダー）
  components/
    StoryViewer.jsx    絵本ビューア（未実装。TODOコメント参照）
    Review.jsx          振り返り（未実装。TODOコメント参照）
  App.jsx               物語データの読み込み・コンポーネントの土台
public/
  stories/story01/       物語ごとの画像・音声ファイルの配置先（現在は空）
```

各コンポーネント・スタイルファイルは中身が最小限の雛形（骨組みのみ）で、実装すべき内容はファイル冒頭の `TODO:` コメントに書かれています。

## 物語データの追加方法

### 1. JSON ファイルを作成する

`src/stories/storyXX.json` として、以下の形式でファイルを作成します（`story01.json` はダミーデータなので、内容を実データに差し替えるか、新しい番号でコピーして使ってください）。

```json
{
  "id": "story01",
  "title": "物語のタイトル",
  "titleThai": "タイ語のタイトル（任意）",
  "source": "出典（実在するタイの民話名など）",
  "pages": [
    {
      "id": 1,
      "text": "日本語の本文",
      "thai": "対応するタイ語テキスト（任意）",
      "thaiReading": "ローマ字/カタカナ表記の読み方（任意）",
      "image": "/stories/story01/page01.png",
      "audio": "/stories/story01/page01.mp3"
    }
  ],
  "review": [
    {
      "word": "タイ語の単語",
      "reading": "ローマ字/カタカナ表記の読み方（任意）",
      "meaning": "意味（日本語）",
      "audio": "/stories/story01/review01.mp3"
    }
  ]
}
```

- `thai` / `thaiReading` / `titleThai` / `review[].reading` は任意項目です。無い場合はその部分の表示が省略されます。
- 1話あたり3〜5ページ程度を目安にしてください。
- `review` はその物語の振り返りクイズ・フラッシュカードに使う単語リストです。4語以上あるとクイズの選択肢（4択）が作りやすくなります。

### 2. 画像・音声ファイルを配置する

`public/stories/storyXX/` フォルダの下に、JSON内の `image` / `audio` に指定したパスと同じファイル名で配置してください。

```
public/stories/story01/
  page01.png
  page01.mp3
  page02.png
  page02.mp3
  ...
  review01.mp3
  ...
```

- イラスト担当者が後から画像・音声ファイルを追加する運用を想定しています。ファイル未配置時の表示（プレースホルダー表示、音声ボタンの非表示など）は `StoryViewer.jsx` 側で今後実装予定です（TODOコメント参照）。

### 3. アプリに読み込ませる

`src/App.jsx` は現状 `story01.json` を直接 import する最小限の雛形です。複数話に対応する場合の読み込み方法（一覧画面など）は今後の実装課題です（`App.jsx` 冒頭の TODO コメント参照）。

## Git運用について

コミット・プッシュ・PR作成を行う場合は、`docs/GitHub運用ルール.md`（存在する場合）を参照し、リポジトリ内にPRテンプレートが存在する場合はそれを使用してください。
