/**
 * API endpoint pour récupérer les informations de l'utilisateur connecté
 * Utilise le token JWT pour authentifier l'utilisateur
 */
import { prisma } from '../../../src/lib/prisma';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract the JWT token from cookies
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ 
      authenticated: false,
      message: 'Not authenticated' 
    });
  }

  try {
    // Verify token using the auth helper
    const userData = await verifyToken(token);
    
    if (!userData) {
      // Token invalide ou expiré
      res.setHeader(
        'Set-Cookie',
        'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      );
      return res.status(401).json({ 
        authenticated: false,
        message: 'Invalid token' 
      });
    }
    
    // Validate the user ID format from the token data
    if (userData.id && typeof userData.id === 'string' && userData.id.startsWith('user_')) {
      console.error('Invalid user ID format in token:', userData.id);
      
      // Try to find the user in the database by email to get the correct ID
      try {
        const validUser = await prisma.user.findUnique({
          where: { email: userData.email },
          select: { id: true, email: true, name: true, role: true }
        });
        
        if (validUser) {
          console.log('Found user with correct ID format:', validUser.id);
          // Return the user with correct ID
          return res.status(200).json({
            authenticated: true,
            user: validUser
          });
        }
      } catch (dbError) {
        console.error('Error looking up user in database:', dbError);
      }
      
      // If we couldn't find the user, clear the invalid token
      res.setHeader(
        'Set-Cookie',
        'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      );
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Return user data from token
    return res.status(200).json({
      authenticated: true,
      user: userData
    });
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Clear invalid cookie
    res.setHeader(
      'Set-Cookie',
      'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
    
    return res.status(401).json({ 
      authenticated: false,
      message: 'Invalid token' 
    });
  }
}