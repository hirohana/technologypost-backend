SELECT
  u.id,
  u.username,
  u.photo_url AS user_photo_url,
  a.title,
  a.letter_body,
  a.photo_url AS article_photo_url,
  a.created_at AS article_created_at
FROM
  articles AS a
LEFT OUTER JOIN
  users AS u
ON  a.user_id = u.id
WHERE user_id = ?
ORDER BY article_created_at DESC
LIMIT ? OFFSET ?