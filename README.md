# ドリル練習　PDCA管理Webアプリ

## 概要

- 技量向上の為の基本練習（ドリル）のPDCAを管理する為のWebアプリ。
- ログインせずに、利用できます。データはブラウザのIndexDBに格納されます。

### スマホ画面と操作イメージ

![sp-sousa](https://github.com/IoT-Arduino/dnd-drill/assets/45728258/415e98ad-46cc-4bcd-96f9-fdd3186305ce)

### PC メイン画面

  <img src="https://github.com/IoT-Arduino/dnd-drill/assets/45728258/90976238-9c5c-4bac-a172-2502b5a426cd" width="70%">

### 利用方法

#### Plan

- 技量向上の為に必要なドリルを事前にいくつか登録します。登録済みのものは、ドリルストックのブロックに格納されます。
- 登録したドリルの中から、次回の練習メニューを選択して、今日のドリルにアイテムを移動します。

#### Do

- 練習当日に、今日のドリルを確認し、実施したものに、チェックを入れます。

#### Check

- 当日練習したもにを、本日実施ドリルとして登録します。実施済み内容は履歴画面で確認できます。
- 履歴は過去7回分参照可能です。

  <img src="https://github.com/IoT-Arduino/dnd-drill/assets/45728258/97b9b978-0c5f-4fc5-b657-9c26188e2783" width="40%">

#### Action

- 新たに必要と考えた基本練習メニューを「ドリルストック」ブロックから、追加登録します。登録済みのドリルの編集、削除も可能です。

### 技術スタック

#### 基本

- React
- TypeScript
- Vite

#### UI

- Slider：Ionic React（ion-item-sliding）
- Drag&Drop : Ionic React (ion-reorder)
- Modal:React bootstrap
- CSSは、module.scss で記述。

#### Backend 

https://github.com/IoT-Arduino/dnd-drill-api
- hono
- Cloudflare workers
- Cloudflare D1
- drizzle
- Clerk

#### Deploy

- Vercel
