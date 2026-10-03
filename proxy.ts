import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_COOKIE, ACCESS_PATH, hasAccess } from "@/lib/juegos/access"

/** PIN de los juegos (`lib/juegos/access.ts`): sin cookie válida, las páginas van a la pantalla del PIN y la API responde 401. */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === ACCESS_PATH || pathname === "/api/juegos/acceso")
    return NextResponse.next()
  if (await hasAccess(request.cookies.get(ACCESS_COOKIE)?.value))
    return NextResponse.next()

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Falta el PIN de acceso." } },
      { status: 401 }
    )
  }
  const url = new URL(ACCESS_PATH, request.url)
  url.searchParams.set("next", pathname + search)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/juegos", "/juegos/:path*", "/api/juegos/:path*"],
}
