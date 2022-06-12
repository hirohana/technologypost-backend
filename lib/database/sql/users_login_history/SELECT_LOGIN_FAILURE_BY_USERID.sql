SELECT
  count(*) AS count
FROM
  users_login_history
WHERE 
  userId = ?
  AND login >= ?
