-- ファイル名はDELETEだが、内容はPUT
UPDATE
  articles_comments
SET
  comment = ?
WHERE
  id = ?
  

