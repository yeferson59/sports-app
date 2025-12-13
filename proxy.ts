import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { isClient, isInstructor, isAdmin } from "@/lib/user";

// Rutas públicas - accesibles sin autenticación
const PUBLIC_ROUTES = ["/login", "/register"];

// Función para verificar si una ruta es pública
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si el usuario no tiene sesión
  if (!session) {
    // Solo permite rutas públicas (/login, /register)
    // Cualquier otra ruta lo redirige a /login
    if (!isPublicRoute(path)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Si el usuario tiene sesión
  if (session) {
    if (!path.startsWith("/customer") && (await isClient(session.user.id))) {
      return NextResponse.redirect(new URL("/customer", request.url));
    }

    if (
      !path.startsWith("/instructor") &&
      (await isInstructor(session.user.id))
    ) {
      return NextResponse.redirect(new URL("/instructor", request.url));
    }

    if (!path.startsWith("/admin") && (await isAdmin(session.user.id))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};
