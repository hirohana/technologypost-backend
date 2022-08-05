# Heroku-Deploy-Environment

Node.js(Express)を使用した開発環境。MySQL8.0 実装。Heroku へのデプロイを想定。

## Heroku へのデプロイ手順

1. ローカル開発環境で【npm start】でローカル環境を立ち上げてエラーが出ないことを確認。front 側から API 接続も確認。
2. 【git add .】、【git commit】でローカルリポジトリにコミットする。※Heroku へデプロイする際は Github に push しなくても良い。
3. Windows の PowerShell を立ち上げ、【heroku login】でログインし、【heroku create】で Heroku のリポジトリを作成。
4. 共有 MySQL アドオンの下記の手順に従ってプロビジョニングを行う。詳細なやり方については →https://devcenter.heroku.com/articles/cleardb#provisioning-the-shared-mysql-add-on
   【heroku addons:create cleardb:ignite】、【heroku config | grep CLEARDB_DATABASE_URL】で CLEARDB_DATABASE_URL の値をターミナルで取得し、【heroku config:set DATABASE_URL='CLEARDB_DATABASE_URL'】として代入。
5. Heroku の環境変数に DB(cleardb)の接続情報を記述する。具体的にはユーザーネーム(MYSQL_USERNAME)、パスワード(MYSQL_PASSWORD)、ホスト(MYSQL_HOST)、データベース(MYSQL_DATABASE)。cleardb の DB 接続情報は【heroku config | grep CLEARDB】で取得できる。
   詳細はhttps://devcenter.heroku.com/articles/cleardb
6. 【git push heroku main】で Heroku にデプロイを行う。

※ それ以外のコマンドについて。

- 【heroku apps】で現在の Heroku にデプロイされているアプリのリソース名を取得
- 【heroku destroy --app <リソース名> --confirm <リソース名>】でアプリの削除。
- 【heroku logs --tail】で現在の Heroku に公開されているアプリのログを確認する。デプロイの際のエラーチェックにも使用。
- 【heroku open】で現在公開されているアプリをブラウザが立ち上がる。

## Web サイトの改善点
