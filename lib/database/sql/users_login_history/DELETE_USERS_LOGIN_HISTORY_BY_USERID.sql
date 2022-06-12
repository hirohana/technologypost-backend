DELETE FROM
  users_login_history
WHERE id in (
  SELECT
    id 
  FROM
    (
      SELECT
    id
  FROM
    users_login_history
  WHERE 
    loginSuccess = 0
  AND userId = ?
  ORDER BY loginAt ASC
  LIMIT 1 OFFSET 0
    ) as alias_users_login_hisotory
);

