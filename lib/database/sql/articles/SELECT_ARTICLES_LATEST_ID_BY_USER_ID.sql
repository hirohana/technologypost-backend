SELECT 
  id
FROM
  articles
WHERE
  user_id = ?
ORDER BY 
  id DESC
LIMIT 1