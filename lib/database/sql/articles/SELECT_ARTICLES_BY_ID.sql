SELECT
  a.id AS article_id,
  a.user_id,
  a.title,
  a.letter_body,
  a.created_at,
  a.article_id_storage,
  a.file_names,
  a.images_url,
  u.username,
  u.photo_url AS user_photo_url,
  GROUP_CONCAT(c.name separator ",") AS category_name
FROM
  articles AS a
  LEFT OUTER JOIN
    articles_category AS ac 
  ON a.id = ac.articles_id
    LEFT OUTER JOIN
      category AS c
    ON ac.category_id = c.id
      LEFT OUTER JOIN
        users AS u
      ON a.user_id = u.id
WHERE a.id = ?
  AND a.public = 1
GROUP BY a.id = ?
