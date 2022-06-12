# usersのテーブル作成
CREATE TABLE users(id int not null auto_increment primary key, 
username varchar(32) not null, email varchar(64) not null, password varchar(255) not null, 
profile varchar(255), photoUrl varchar(255) not null, createdAt datetime not null);
# usersのデータ挿入
INSERT INTO users(username, email, password, profile, photoUrl, createdAt)
VALUES("Dummy", "dummy@gmail.com","abc", "初めまして!", 
"https://placehold.jp/150x150.png", "2022-06-09 12:00:00");

# articlesのテーブル作成
CREATE TABLE articles(id int not null auto_increment primary key, userId int not null,
title varchar(32) not null, letterBody text not null, photoUrl varchar(255), 
createdAt datetime not null);
# articlesのデータ挿入
INSERT INTO articles(userId, title, letterBody, photoUrl, createdAt) VALUES("1234", "Hello World!", 
"こんにちは!", "https://placehold.jp/250x250.png", "2022-06-09 12:25:00");

# users_login_historyのテーブル作成
CREATE TABLE users_login_history(id int not null auto_increment primary key, userId int not null, 
loginStatus tinyint not null, login datetime not null);
# users_login_historyのデータ挿入
INSERT INTO users_login_history(userId, loginStatus, login)
  VALUES
  (1, 0, "2022-06-01 00:00:00"),
  (1, 0, "2022-06-02 00:00:00"),
  (1, 0, "2022-06-03 00:00:00"),
  (1, 0, "2022-06-04 00:00:00"),
  (1, 0, "2022-06-05 00:00:00"),
  (1, 0, "2022-06-06 00:00:00"),
  (1, 0, "2022-06-07 00:00:00"),
  (1, 0, "2022-06-08 00:00:00"),
  (1, 0, "2022-06-09 00:00:00"),
  (1, 0, "2022-06-10 00:00:00"),
  (2, 0, "2022-06-01 00:00:00"),
  (2, 0, "2022-06-02 00:00:00"),
  (2, 0, "2022-06-03 00:00:00"),
  (2, 0, "2022-06-04 00:00:00"),
  (2, 0, "2022-06-05 00:00:00"),
  (2, 0, "2022-06-06 00:00:00"),
  (2, 0, "2022-06-07 00:00:00"),
  (2, 0, "2022-06-08 00:00:00"),
  (2, 0, "2022-06-09 00:00:00"),
  (2, 0, "2022-06-10 00:00:00");
