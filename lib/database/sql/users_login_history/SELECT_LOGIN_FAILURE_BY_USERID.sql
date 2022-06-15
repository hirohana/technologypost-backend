SELECT
  count(*) AS count
FROM
  users_login_history
WHERE 
  user_id = ?
  AND login >= ?
  AND login_status = ?
