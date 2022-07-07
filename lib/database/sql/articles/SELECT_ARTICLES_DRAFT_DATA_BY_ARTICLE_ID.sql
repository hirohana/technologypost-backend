SELECT
  draft_article.id AS article_id,
  draft_article.title,
  draft_article.letter_body,
  draft_article.created_at AS created_at,
  draft_article.user_id,
  draft_article.article_id_of_storage,
  draft_article.file_names,
  draft_article.images_url,
  users.username
FROM
  (
    SELECT * FROM articles WHERE id = ? 
  ) AS draft_article
LEFT OUTER JOIN
  users
ON  draft_article.user_id = users.id
