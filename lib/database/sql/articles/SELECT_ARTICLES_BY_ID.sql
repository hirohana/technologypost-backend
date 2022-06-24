SELECT
  a.id AS article_id,
  a.user_id,
  u.username,
  u.photo_url AS user_photo_url,
  a.title,
  a.letter_body,
  a.photo_url AS article_photo_url,
  a.created_at,
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
GROUP BY a.id = ?
