# Prefixer - Auto prefix adding tool

[![Image from Gyazo](https://i.gyazo.com/f43f1b13222ebd2501cb420d18dae0bd.png)](https://gyazo.com/f43f1b13222ebd2501cb420d18dae0bd)

[See English README](./README_en.md)

## 概要
Prefixerは自動的にファイル名にプレフィックス（接頭辞）をつけるツールです。たくさんのファイルを一度に番号付けしたいときや、ファイルを1つずつ作成しながら裏で自動的に番号付けをしたいようなときに便利です。

このツールはNode.jsを用いて動作しており、pkgを使ってパッケージングされました。

## インストール
自分のOSにあったツールのzipファイルをダウンロードしてください。
### Latest
|プラットフォーム|ダウンロードリンク|  
|---|---|
|Windows|[Prefixer-v0.2.0win.zip](https://github.com/Bistalink/Prefixer/releases/download/v0.2.0/Prefixer-v0.2.0win.zip)|
|macOS|[Prefixer-v0.2.0macos.zip](https://github.com/Bistalink/Prefixer/releases/download/v0.2.0/Prefixer-v0.2.0macos.zip)|

もしくは、Releaseタブより適当なバージョンの自分の環境にあったものをダウンロードしてください。現在、Windows及びmacOSをサポートしています。

## 基本的な使い方
1. ツール本体を番号付けしたいファイルが入っているフォルダーの中に配置します
2. ダブルクリックでツールを起動します
3. コンソール画面が表示されるので、上部に表示される作業ディレクトリ（Working Directory）が自分の意図したものになっているかを確認します（間違ったフォルダで処理を続行するとそのフォルダにあるファイルがすべて番号付けされてしまいます）
4. 作業ディレクトリが正しければ`yes`と打って続行し、やり直す場合には`no`と打ってプログラムを終了します
5. ツールが自動的に対象のフォルダ内に生成される・既に作成されたファイルを監視し、必要に応じて番号付けします。番号付けが重複することはありません。

## ビルド
バイナリの安全性を心配する場合などでは、このレポジトリをローカル環境にクローンすることでソースコードを閲覧することができ、自分でソースコードをビルドしてバイナリを作成することもできます。

レポジトリをローカルフォルダにダウンロードした後、`npm install -D`を実行してツールの実行・開発・テストに必要なパッケージをインストールします。

その後、`npm run build`をプロジェクトのルートディレクトリから実行してビルドします。

## テスト
自分でビルドを実行するなどしてローカルにこのプロジェクトの開発環境を整えている場合、簡単に動作のテストが行えます。プロジェクトのルートディレクトリに`test`フォルダを作成して、`npm test`コマンドを実行することで`test`フォルダ内にあるファイルに対してツールをテストできます。


## 免責事項とライセンス
このツールはMITライセンスの元でライセンスされているため、このツールは自由に使用、改変、再配布することができます。ただし、このツールを使用したことでいかなる影響が及ぼされたとしても、開発者は責任を負いません。