SELECT 
  count(*) AS totalPages
FROM
  draft_articles AS da
WHERE da.user_id = ?;