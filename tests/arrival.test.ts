import { test, expect } from 'bun:test'
import { NextRequest } from 'next/server'

// Isolated configuration and fake transport; these tests never report real website traffic.
process.env.NEXT_PUBLIC_ARRIVAL_URL = 'https://arrival.test'
process.env.NEXT_PUBLIC_ARRIVAL_SITE_ID = 'site_fixture'
process.env.ARRIVAL_INGEST_KEY = 'isolated-test-key'
const { middleware } = await import('../middleware')

test('Arrival observes page arrivals in the background and excludes secrets and untrusted IPs', async () => {
  const originalFetch = globalThis.fetch
  const originalVercel = process.env.VERCEL
  delete process.env.VERCEL
  const reports: any[] = []
  globalThis.fetch = (async (_url: any, options: any) => {
    if(String(_url).endsWith('/api/entry/start')) return Response.json({mode:'observe'})
    reports.push(JSON.parse(options.body))
    return new Response('{}', {status:200})
  }) as typeof fetch
  const pending: Promise<any>[] = []
  try {
    const response = await middleware(new NextRequest('https://whiteye.in/blog?private=discard', {
      headers: {'user-agent':'Controlled test agent','x-forwarded-for':'8.8.8.8',authorization:'SECRET',cookie:'private=SECRET'}
    }), {waitUntil:(promise:Promise<any>)=>pending.push(promise)} as any)
    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('Link')).toContain('Agent introduction')
    expect(response.cookies.get('arrival_host_session')?.value).toBeTruthy()
    await Promise.all(pending)
    expect(reports).toHaveLength(1)
    expect(reports[0].path).toBe('/blog')
    expect(reports[0].ip).toBeUndefined()
    expect(reports[0].status).toBeUndefined()
    expect(JSON.stringify(reports)).not.toContain('SECRET')
    expect(JSON.stringify(reports)).not.toContain('discard')
  } finally {globalThis.fetch=originalFetch;if(originalVercel!==undefined)process.env.VERCEL=originalVercel}
})

test('Arrival skips prefetches and a reporting outage leaves content available', async () => {
  const originalFetch=globalThis.fetch
  globalThis.fetch=(async()=>{throw new Error('Controlled outage')}) as typeof fetch
  const pending:Promise<any>[]=[]
  try {
    const event={waitUntil:(promise:Promise<any>)=>pending.push(promise)} as any
    await middleware(new NextRequest('https://whiteye.in/blog',{headers:{'next-router-prefetch':'1'}}),event)
    expect(pending).toHaveLength(0)
    const response=await middleware(new NextRequest('https://whiteye.in/resume'),event)
    expect(response.headers.get('x-middleware-next')).toBe('1')
    await expect(pending[0]).resolves.toBeUndefined()
  }finally{globalThis.fetch=originalFetch}
})

test('fetch-only Claude clients read both pages without an introduction while requests are reported', async () => {
  const originalFetch=globalThis.fetch
  const reports: {url:string,body:any}[]=[]
  globalThis.fetch=(async(url:any,options:any)=>{
    reports.push({url:String(url),body:JSON.parse(options.body)})
    return Response.json({})
  }) as typeof fetch
  const pending:Promise<any>[]=[]
  try {
    for(const path of ['/resume','/plain-corners']) {
      const response=await middleware(new NextRequest('https://whiteye.in'+path,{
        headers:{'user-agent':'Mozilla/5.0 (compatible; Claude-User/1.0; +claude-user@anthropic.com)'}
      }),{waitUntil:(promise:Promise<any>)=>pending.push(promise)} as any)
      expect(response.headers.get('x-middleware-next')).toBe('1')
    }
    await Promise.all(pending)
    expect(reports).toHaveLength(2)
    expect(reports.every(r=>r.url.endsWith('/api/ingest')&&r.body.entryDisposition==='fetch_only')).toBe(true)
    expect(reports.map(r=>r.body.path)).toEqual(['/resume','/plain-corners'])
  }finally{globalThis.fetch=originalFetch}
})
