# 麻雀学習 Web アプリ

麻雀の牌の読み方や組み合わせから、待ち・何切るまで練習できる Web アプリです。クイズ、神経衰弱、麻雀辞典を使って、基本を一つずつ学べます。

## できること

- **牌を覚える**：牌の種類と数字を見分け、牌と読みを結び付けます。
- **形を覚える**：順子・刻子などの組み合わせや、あと1枚で組を完成させる問題に取り組みます。
- **待ち・何切る**：テンパイ時の待ちを考え、テンパイや一向聴に進む打牌を選びます。
- **神経衰弱**：同じ牌をそろえながら牌の絵柄を覚えます。12枚・24枚・52枚から選べます（画面幅が狭い場合は24枚まで）。
- **牌一覧・麻雀辞典**：牌の種類、麻雀用語、一般的な役を調べられます。辞典は名前・読み・説明から検索できます。
- **成績・設定**：学習記録を確認し、表示設定を変更できます。

## データの保存

アカウント登録は不要です。学習記録と表示設定は利用中のブラウザに保存され、設定画面から学習記録を消去できます。別のブラウザや端末には自動で引き継がれません。成績をサーバーへ送信する機能はありません。

画面表示には Google Fonts の Noto Sans JP を使用しており、表示時に Google Fonts へ通信します。

## 開発環境で動かす

Node.js 24.22.1 以降を用意してください。`.nvmrc` も利用できます。

```sh
npm ci
npm run dev
```

ブラウザで `http://localhost:5173/` を開きます。同じ Wi-Fi 上のスマートフォンから確認する場合は `npm run dev:lan` で起動し、PC の IPv4 アドレスを使って `http://<PCのIPv4アドレス>:5173/` を開きます。

内容とビルドの検証には、次のコマンドを使えます。

```sh
npm run check:domain
npm run check:content
npm run check:drills
npm run check:render
npm run build
```

## 牌の画像

牌の SVG は [FluffyStuff/riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles) に由来します。素材の説明と CC0 のライセンス文は [SOURCE_README.md](assets/tiles/SOURCE_README.md) と [LICENSE.md](assets/tiles/LICENSE.md) を参照してください。
