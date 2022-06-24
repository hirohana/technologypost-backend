SELECT
  u.id AS user_id,
  u.username,
  u.photo_url AS user_photo_url,
  da.id AS article_id,
  da.title,
  da.letter_body,
  da.photo_url AS article_photo_url,
  da.created_at
FROM
  draft_articles AS da
LEFT OUTER JOIN
  users AS u
ON  da.user_id = u.id
WHERE da.user_id = ?
ORDER BY da.created_at DESC
LIMIT ? OFFSET ?;
