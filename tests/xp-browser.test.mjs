import { test } from "bun:test"
import assert from "node:assert/strict"
import {
  BROWSER_HOME,
  normalizeWebAddress,
  visitAddress,
} from "../lib/xp-browser.ts"

test("website addresses accept domains, paths, queries, and HTTP(S)", () => {
  assert.equal(
    normalizeWebAddress(
      "  en.wikipedia.org/wiki/Rust_(programming_language)  "
    ),
    "https://en.wikipedia.org/wiki/Rust_(programming_language)"
  )
  assert.equal(
    normalizeWebAddress("//example.org/?q=hello world#section"),
    "https://example.org/?q=hello%20world#section"
  )
  assert.equal(normalizeWebAddress("http://example.org"), "http://example.org/")
  assert.equal(normalizeWebAddress(BROWSER_HOME), BROWSER_HOME)
})

test("executable schemes, local files, credentials, and malformed addresses are rejected", () => {
  for (const input of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "vbscript:msgbox(1)",
    "ftp://example.org",
    "https://user:password@example.org",
    "https://",
    "",
    "not a website",
  ]) {
    assert.throws(() => normalizeWebAddress(input), undefined, input)
  }
})

test("visiting after going back discards forward history without mutating the old history", () => {
  const first = { entries: [BROWSER_HOME], index: 0 }
  const second = visitAddress(first, "https://example.org/")
  const third = visitAddress(second, "https://en.wikipedia.org/")
  const branched = visitAddress(
    { ...third, index: 1 },
    "https://doc.rust-lang.org/book/"
  )
  assert.deepEqual(first, { entries: [BROWSER_HOME], index: 0 })
  assert.deepEqual(branched, {
    entries: [
      BROWSER_HOME,
      "https://example.org/",
      "https://doc.rust-lang.org/book/",
    ],
    index: 2,
  })
  assert.equal(visitAddress(branched, branched.entries[2]), branched)
})
