const FALLBACK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA' +
  'GklEQVRYhe3BMQEAAADCoPVP7WsIoAAAeAMBxAABCWTcUQAAAABJRU5ErkJggg==',
  'base64',
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) return new Response(FALLBACK_PNG, faviconHeaders())

  try {
    const res = await fetch(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`,
      { signal: AbortSignal.timeout(5_000) },
    )
    if (!res.ok) return new Response(FALLBACK_PNG, faviconHeaders())
    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new Response(FALLBACK_PNG, faviconHeaders())
  }
}

function faviconHeaders() {
  return {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  }
}
