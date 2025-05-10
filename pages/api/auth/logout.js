/**
 * API endpoint pour gérer la déconnexion
 * Supprime le cookie d'authentification
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // In a real app, you might:
  // 1. Invalidate the token in a blacklist or database
  // 2. Clear any server-side session

  // Clear the auth cookie
  res.setHeader(
    'Set-Cookie',
    'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );

  return res.status(200).json({ 
    success: true,
    message: 'Logged out successfully' 
  });
}