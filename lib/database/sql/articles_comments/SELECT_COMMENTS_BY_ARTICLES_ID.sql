SELECT 
  u.username,
  u.photo_url,
  ac.comment,
  ac.created_at
FROM
  articles_comments AS ac
  INNER JOIN
    users AS u
  ON ac.user_id = u.id
WHERE ac.articles_id = ?
ORDER BY ac.created_at ASC

