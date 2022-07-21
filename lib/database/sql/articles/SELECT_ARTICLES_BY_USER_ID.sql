SELECT
a.id AS article_id,
  a.title,
  a.user_id,
  a.letter_body,
  a.created_at,
  a.public,
  a.article_id_storage,
  a.file_names,
  a.images_url,
  u.username,
  u.photo_url AS user_photo_url
FROM
  articles AS a
LEFT OUTER JOIN
  users AS u
ON  a.user_id = u.id
WHERE a.user_id = ?
ORDER BY a.created_at DESC
LIMIT ? OFFSET ?
