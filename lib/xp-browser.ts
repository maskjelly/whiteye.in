export const BROWSER_HOME = "about:home"

export function normalizeWebAddress(input: string): string {
  const value = input.trim()
  if (value === BROWSER_HOME) return BROWSER_HOME
  if (!value) throw new Error("Enter a website address, like wikipedia.org.")
  // Reject executable and local-file schemes before assigning an iframe URL.
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value)
  let url: URL
  try {
    url = new URL(hasScheme ? value : `https://${value.replace(/^\/\//, "")}`)
  } catch {
    throw new Error(
      "That address doesn’t look right. Try https://wikipedia.org."
    )
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Use a website address starting with https:// or http://.")
  }
  if (url.username || url.password) {
    throw new Error("Use a website address without a username or password.")
  }
  return url.href
}

export type BrowserHistory = { entries: string[]; index: number }

export function visitAddress(
  history: BrowserHistory,
  address: string
): BrowserHistory {
  if (history.entries[history.index] === address) return history
  const entries = [...history.entries.slice(0, history.index + 1), address]
  return { entries, index: entries.length - 1 }
}
