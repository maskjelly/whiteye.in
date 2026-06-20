import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import CopyButton from "@/components/copy-button"

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("shiki/themes/github-dark-dimmed.mjs")],
      langs: [
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/c.mjs"),
        import("shiki/langs/cpp.mjs"),
        import("shiki/langs/rust.mjs"),
        import("shiki/langs/python.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/ini.mjs"),
      ],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    })
  }
  return highlighterPromise
}

const THEME = "github-dark-dimmed"

export async function Code({
  lang = "text",
  children,
}: {
  lang?: string
  children: string
}) {
  const highlighter = await getHighlighter()
  const raw = String(children).replace(/\n$/, "")
  const langSupported = highlighter.getLoadedLanguages().includes(lang)
  const html = langSupported
    ? highlighter.codeToHtml(raw, { lang, theme: THEME })
    : highlighter.codeToHtml(raw, { lang: "text", theme: THEME })

  return (
    <div className="code-block" data-lang={lang}>
      <span className="code-lang" aria-hidden="true">{lang}</span>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <CopyButton code={raw} />
    </div>
  )
}
