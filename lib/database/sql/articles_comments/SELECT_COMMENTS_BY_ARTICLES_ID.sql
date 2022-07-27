SELECT 
  u.username,
  u.photo_url AS user_photo_url,
  ac.comment AS user_comment,
  ac.created_at AS comment_created_at,
  ac.id AS comment_id
FROM
  articles_comments AS ac
  INNER JOIN
    users AS u
  ON ac.user_id = u.id
WHERE ac.article_id = ?
ORDER BY ac.created_at ASC

