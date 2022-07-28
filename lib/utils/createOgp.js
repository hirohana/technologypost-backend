function createOgp(userName, title, imageUrl, siteUrl) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta property="og:title" content="${title}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:description" content="${userName}">
    <meta property="og:url" content="${siteUrl}">
    <meta property="og:type" content="article">
    <meta name="twitter:site" content="${siteUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:description" content="${userName}">
  </head>
  <body>
    <script type="text/javascript">window.location="${siteUrl}";</script>
  </body>
</html>
`;
}

module.exports = {
  createOgp,
};
