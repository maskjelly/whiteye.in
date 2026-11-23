// The page X frames inside a post (twitter:player on the home page): just the looping social card.
export const dynamic = "force-static"

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Aaryan Singh</title>
<style>
html,body{height:100%;margin:0;overflow:hidden;background:#f7f6f5}
a{display:block;height:100%}
img{display:block;width:100%;height:100%;object-fit:contain}
</style>
</head>
<body>
<a href="https://whiteye.in/" target="_blank" rel="noopener"><img src="/og.gif" width="1200" height="630" alt="Aaryan Singh, engineer, 20"></a>
</body>
</html>`

export function GET() {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
