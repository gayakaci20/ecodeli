import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Liste des routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/settings',
];

// Liste des routes publiques d'authentification
const authRoutes = [
  '/login',
  '/register',
];

export async function middleware(request) {
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;
  
  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Vérifier si la route actuelle est une route d'authentification
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si c'est une route protégée et qu'il n'y a pas de token valide, rediriger vers la connexion
  if (isProtectedRoute) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // Vérifier la validité du token
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Si l'utilisateur est déjà connecté et essaie d'accéder à une page d'authentification,
  // le rediriger vers la page de profil
  if (isAuthRoute && token) {
    const decodedToken = await verifyToken(token);
    if (decodedToken) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};