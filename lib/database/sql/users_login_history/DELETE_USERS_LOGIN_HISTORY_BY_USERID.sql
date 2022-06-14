DELETE FROM
  users_login_history
WHERE 
  user_id = ?
  AND
  id = (
  SELECT
    id 
  FROM
    (
      SELECT
    id
  FROM
    users_login_history
  WHERE 
    user_id = ?
  ORDER BY login DESC
  LIMIT 1 OFFSET ?
    ) as alias_users_login_hisotory
);

