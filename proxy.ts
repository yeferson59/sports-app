import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { headers } from "next/headers";

// Rutas públicas - accesibles sin autenticación
const PUBLIC_ROUTES = ["/login", "/register"];

// Rutas protegidas - requieren autenticación
const PROTECTED_ROUTES = ["/admin", "/dashboard", "/profile"];

// Función para verificar si una ruta es pública
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

// Función para verificar si una ruta es protegida
function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = !!(await auth.api.getSession({
    headers: await headers(),
  }));

  // Si el usuario no tiene sesión
  if (!session) {
    // Si intenta acceder a una ruta protegida, redirige a login
    if (isProtectedRoute(path)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Las rutas públicas son accesibles sin sesión
    return NextResponse.next();
  }

  // Si el usuario tiene sesión
  if (session) {
    // Si intenta acceder a rutas públicas, redirige a dashboard
    if (isPublicRoute(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
