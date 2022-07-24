SELECT
  c.id,
  c.name
FROM
  (SELECT * FROM articles_category WHERE articles_id = ?
  ) AS ar
LEFT OUTER JOIN
  category AS c
ON ar.category_id = c.id
ORDER BY
  c.id ASC
