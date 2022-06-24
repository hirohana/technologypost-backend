SELECT 
  count(*) AS totalPages
FROM
  articles AS a
WHERE a.user_id = ?;