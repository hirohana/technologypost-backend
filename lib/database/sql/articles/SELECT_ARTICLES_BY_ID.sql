SELECT
  a.id,
  a.user_id,
  a.title,
  a.letter_body,
  a.photo_url,
  a.created_at,
  GROUP_CONCAT(c.name separator ",") AS category_name
FROM
  articles AS a
INNER JOIN
  articles_category AS ac 
ON a.id = ac.articles_id
INNER JOIN
  category AS c
ON ac.category_id = c.id
WHERE a.id = ?
GROUP BY a.id = ?

-- SELECT
--   a.id,
--   a.user_id,
--   a.title,
--   a.letter_body,
--   a.photo_url,
--   a.created_at,
--   GROUP_CONCAT(c.name separator ",") AS category_name
-- FROM
--   articles AS a
-- INNER JOIN
--   articles_category AS ac 
-- ON a.id = ac.articles_id
-- INNER JOIN
--   category AS c
-- ON ac.category_id = c.id
-- WHERE a.id = 1
-- GROUP BY a.id = 1
