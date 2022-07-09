SELECT
  u.id AS user_id,
  u.username,
  u.photo_url AS user_photo_url,
  a.id AS article_id,
  a.title,
  a.letter_body,
  a.photo_url AS article_photo_url,
  a.created_at,
  a.public,
  a.article_id_of_storage
FROM
  articles AS a
LEFT OUTER JOIN
  users AS u
ON  a.user_id = u.id
WHERE a.user_id = ?
ORDER BY a.created_at DESC
LIMIT ? OFFSET ?
