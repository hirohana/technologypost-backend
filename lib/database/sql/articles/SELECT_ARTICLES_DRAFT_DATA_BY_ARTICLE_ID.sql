SELECT
  draft_article.id AS article_id,
  draft_article.title,
  draft_article.letter_body,
  draft_article.created_at AS created_at,
  draft_article.user_id,
  users.username
FROM
  (
    SELECT * FROM articles WHERE id = ? 
  ) AS draft_article
LEFT OUTER JOIN
  users
ON  draft_article.user_id = users.id
