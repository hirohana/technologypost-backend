# usersのテーブル作成
CREATE TABLE users(id int not null auto_increment primary key, 
user_id int not null, username varchar(32) not null, email varchar(64) not null,password varchar(32) not null, 
profile varchar(255), photo_url varchar(255) not null, createdAt
datetime not null);
# usersのデータ挿入
INSERT INTO users(user_id, username, email, password, profile, photo_url, createdAt)
VALUES(1234, "Dummy", "dummy@gmail.com","abc", "初めまして!", 
"https://placehold.jp/150x150.png", "2022-06-09 12:00:00");

# github_usersのテーブル作成
CREATE TABLE github_users(id int not null auto_increment primary key, user_id int not null, 
username varchar(32) not null, photo_url varchar(255) not null);

# articleのテーブル作成
CREATE TABLE article(id int not null auto_increment primary key, user_id int not null,
title varchar(32) not null, letter_body text not null, image_url varchar(255), 
createdAt datetime not null);
# articleのデータ挿入
INSERT INTO article(user_id, title, letter_body, image_url, createdAt) VALUES(1234, "Hello World!", 
"こんにちは!", "https://placehold.jp/250x250.png", "2022-06-09 12:25:00");