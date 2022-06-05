# Heroku-Deploy-Environment
Node.js(Express)を使用ししたDocker開発環境。MySQL8.0実装。Herokuへのデプロイを想定。

## Herokuへのデプロイ手順
※HerokuへのDockerを使用したデプロイには2種類のやり方があり、下記の手順は↓URLのやり方をアレンジしたものhttps://devcenter.heroku.com/ja/articles/build-docker-images-heroku-yml
- Dockerを使用したローカル開発環境で【docker-compose up --build】、【docker-compose exec app bash】、【yarn install】、【npm start】でローカル環境を立ち上げてエラーが出ないことを確認。
- 【git add .】、【git commit -m "コミットのコメント"】でローカルリポジトリにコミットする。※Herokuへデプロイする際はGithubのリモート環境にpushしなくても良い。
- WindowsのPowerShellを立ち上げ、【heroku login】【heroku container:login】を入力してHerokuにCLIを使ってログインし、【heroku create】でHerokuのリポジトリを作成。
- 共有MySQLアドオンの下記の手順に従ってプロビジョニングを行う。詳細なやり方については→https://devcenter.heroku.com/articles/cleardb#provisioning-the-shared-mysql-add-on
【heroku addons:create cleardb:ignite】、【heroku config | grep CLEARDB_DATABASE_URL】でCLEARDB_DATABASE_URLの値をターミナルで取得し、【heroku config:set DATABASE_URL='CLEARDB_DATABASE_URL'】として代入。
- 【git push heroku ブランチ名:master】でHerokuにデプロイを行う。

※ それ以外のコマンドについて。
1. 【heroku apps】で現在のHerokuにデプロイされているアプリのリソース名を取得
2. 【heroku destroy --app <リソース名> --confirm <リソース名>】でアプリの削除。
3. 【heroku logs --tail】で現在のHerokuに公開されているアプリのログを確認する。デプロイの際のエラーチェックにも使用。
4. 【heroku open】で現在公開されているアプリをブラウザが立ち上がる。

