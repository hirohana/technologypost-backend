SELECT
  a.id AS article_id,
  a.title,
  a.letter_body,
  a.photo_url AS article_photo_url,
  a.created_at,
  u.id AS user_id,
  u.username,
  u.photo_url AS user_photo_url,
  GROUP_CONCAT(DISTINCT c.name) AS category_name,
  aco.comment,
  aco.created_at AS comment_created_at
FROM
  (SELECT * FROM articles ORDER BY created_at DESC) AS a
  LEFT OUTER JOIN
    articles_category AS ac
  ON  a.id = ac.articles_id
    LEFT OUTER JOIN
      category AS c
    ON ac.category_id = c.id
      LEFT OUTER JOIN
        users AS u 
      ON a.user_id = u.id
      LEFT OUTER JOIN
        articles_comments AS aco 
      ON a.id = aco.articles_id
GROUP BY a.id
HAVING concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?
  AND concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?
  AND concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?
  AND concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?
  AND concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?
ORDER BY a.created_at DESC
LIMIT 6 OFFSET ?
