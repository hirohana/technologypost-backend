# # database myportfolio作成 //local開発環境用のデータベース
# CREATE DATABASE myportfolio;

# usersのテーブル作成
CREATE TABLE users(id int not null auto_increment primary key, 
username varchar(32) not null, email varchar(64) not null, password varchar(255) not null, 
profile varchar(255), photo_url text not null, created_at datetime not null, lock_status datetime);
# usersのデータ挿入
INSERT INTO users(username, email, password, profile, photo_url, created_at)
VALUES("Dummy", "dummy@gmail.com","$2b$10$Etc2SKDOWqaGiT61eB6f7OWzqN1ll3iLKzerfozF1dbPjIdT09eSq", "初めまして!", 
"https://placehold.jp/150x150.png", "2022-06-09 12:00:00");

# articlesのテーブル作成
CREATE TABLE articles(id int not null auto_increment primary key, user_id int not null,
title varchar(32) not null, letter_body text not null, created_at datetime not null, 
public tinyint not null, article_id_storage varchar(255), file_names text, images_url text);
# articlesのデータ挿入
INSERT INTO articles(user_id, title, letter_body, created_at, public, article_id_storage, file_names, images_url)
  VALUES(1, "テスト", "テスト", "2022-07-22 00:00:00", 1, "", "", "");

# users_login_historyのテーブル作成
CREATE TABLE users_login_history(id int not null auto_increment primary key, user_id int not null, 
login_status tinyint not null, login datetime not null);
# # users_login_historyのデータ挿入
# INSERT INTO users_login_history(user_id, login_status, login)
#   VALUES
#   (1, 0, "2022-06-01 00:00:00"),
#   (1, 0, "2022-06-02 00:00:00"),
#   (1, 0, "2022-06-03 00:00:00"),
#   (1, 0, "2022-06-04 00:00:00"),
#   (1, 0, "2022-06-05 00:00:00"),
#   (1, 0, "2022-06-06 00:00:00"),
#   (1, 0, "2022-06-07 00:00:00"),
#   (1, 0, "2022-06-08 00:00:00"),
#   (1, 0, "2022-06-09 00:00:00"),
#   (1, 0, "2022-06-10 00:00:00"),
#   (2, 0, "2022-06-01 00:00:00"),
#   (2, 0, "2022-06-02 00:00:00"),
#   (2, 0, "2022-06-03 00:00:00"),
#   (2, 0, "2022-06-04 00:00:00"),
#   (2, 0, "2022-06-05 00:00:00"),
#   (2, 0, "2022-06-06 00:00:00"),
#   (2, 0, "2022-06-07 00:00:00"),
#   (2, 0, "2022-06-08 00:00:00"),
#   (2, 0, "2022-06-09 00:00:00"),
#   (2, 0, "2022-06-10 00:00:00");

# categoryのテーブル作成
CREATE TABLE category(id int not null auto_increment primary key, 
name varchar(32) not null);
# categoryのデータ挿入
INSERT INTO category(name) 
  VALUES
  ("Windows"),
  ("Mac"),
  ("Linux"),
  ("VisualStudioCode"),
  ("HTML"),
  ("CSS"),
  ("SCSS"),
  ("JavaScript"),
  ("TypeScript"),
  ("React"),
  ("Redux"),
  ("Next.js"),
  ("Node.js"),
  ("Express"),
  ("Go"),
  ("Java"),
  ("SQL"),
  ("MySQL"),
  ("Mongo"),
  ("Git"),
  ("GitHub"),
  ("Docker"),
  ("Babel"),
  ("Webpack"),
  ("ESlint"),
  ("Prettier"),
  ("Firebase"),
  ("Heroku"),
  ("AWS"),
  ("Netlify");

# articles_categoryテーブルの作成
CREATE TABLE articles_category(id int not null auto_increment primary key, 
articles_id int not null, category_id int not null);

# articles_commentsテーブルの作成
CREATE TABLE articles_comments(id int not null auto_increment primary key, article_id int not null, 
user_id int not null, comment text not null, created_at datetime not null);
# articles_commentsテーブルにデータ挿入
INSERT INTO articles_comments(article_id, user_id, comment, created_at)
  VALUES
  (1, 1, "コメントありがとう!", "2022-06-14 21:00:00"),
  (1, 1, "2回目コメントありがとう!", "2022-06-14 22:00:00");

# # draftArticlesのテーブル作成
# CREATE TABLE draft_articles(id int not null auto_increment primary key, user_id int not null,
# title varchar(32) not null, letter_body text, photo_url varchar(255), 
# created_at datetime not null);
# # draftArticlesのデータ挿入
# INSERT INTO draft_articles(user_id, title, letter_body, photo_url, created_at) VALUES("1", "下書きです!", 
# "下書きです!。こんにちは!", "https://placehold.jp/250x250.png", "2022-06-23 00:00:00");
