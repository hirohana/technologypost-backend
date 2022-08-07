# Heroku-Deploy-Environment
Node.js(Express)を使用した開発環境。MySQL8.0実装。Herokuへのデプロイを想定。

## Herokuへのデプロイ手順
1. ローカル開発環境で【npm start】でローカル環境を立ち上げてエラーが出ないことを確認。front側からAPI接続も確認。
2. 【git add .】、【git commit】でローカルリポジトリにコミットする。※Herokuへデプロイする際はGithubにpushしなくても良い。
3. WindowsのPowerShellを立ち上げ、【heroku login】でログインし、【heroku create [ホスト名]】でHerokuのリポジトリを作成。
4. 共有MySQLアドオンの下記の手順に従ってプロビジョニングを行う。詳細なやり方については→https://devcenter.heroku.com/articles/cleardb#provisioning-the-shared-mysql-add-on
【heroku addons:create cleardb:ignite】、【heroku config | grep CLEARDB_DATABASE_URL】でCLEARDB_DATABASE_URLの値をターミナルで取得し、【heroku config:set DATABASE_URL='CLEARDB_DATABASE_URL'】として代入。
5. Herokuの環境変数にDB(cleardb)の接続情報を記述する。具体的にはユーザーネーム(MYSQL_USERNAME)、パスワード(MYSQL_PASSWORD)、ホスト(MYSQL_HOST)、データベース(MYSQL_DATABASE)。cleardbのDB接続情報は【heroku config | grep CLEARDB】で取得できる。
詳細はhttps://devcenter.heroku.com/articles/cleardb
6. 【git push heroku main】でHerokuにデプロイを行う。

※ それ以外のコマンドについて。
- 【heroku apps】で現在のHerokuにデプロイされているアプリのリソース名を取得
- 【heroku destroy --app <リソース名> --confirm <リソース名>】でアプリの削除。
- 【heroku logs --tail】で現在のHerokuに公開されているアプリのログを確認する。デプロイの際のエラーチェックにも使用。
- 【heroku open】で現在公開されているアプリをブラウザが立ち上がる。

## Webサイトの改善点
