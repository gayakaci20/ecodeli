// This is a simplified mock login endpoint for development
import { generateToken } from '../../../lib/auth';
import { COOKIE_MAX_AGE } from '../../../lib/auth-constants';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get credentials from request body
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // For development testing, accept any valid email format with any password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Look for an existing user with this email or create a new one
    let user;
    
    try {
      // Try to find an existing user
      user = await prisma.user.findUnique({
        where: { email }
      });
      
      // Create a new user if not found
      if (!user) {
        // Ensure we're not recreating batman@test.fr if it exists with ID 2
        if (email.toLowerCase() === 'batman@test.fr') {
          // Check if user with ID 2 exists
          const batmanUser = await prisma.user.findUnique({
            where: { id: '2' }
          });
          
          if (batmanUser) {
            console.log('Found batman user with ID 2, but with different email. Updating email.');
            // Update the email if the user exists but with a different email
            user = await prisma.user.update({
              where: { id: '2' },
              data: { email: 'batman@test.fr' }
            });
          } else {
            // Create batman with ID 2 if it doesn't exist
            user = await prisma.user.create({
              data: {
                id: '2', // Force ID 2 for batman
                email: email,
                name: 'Batman',
                role: 'SENDER',
                password: 'hashed_password_placeholder'
              }
            });
          }
        } else {
          // Regular user creation
          user = await prisma.user.create({
            data: {
              email: email,
              name: email.split('@')[0],
              role: 'SENDER',
              password: 'hashed_password_placeholder'
            }
          });
        }
        console.log('Created new user:', JSON.stringify(user));
      } else {
        console.log('Found existing user:', JSON.stringify(user));
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Remove the fallback to mock user with custom ID format
      // Instead, return an error since we need a valid user to continue
      return res.status(500).json({ 
        message: 'Database error occurred during login. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    // Generate JWT token using the auth helper
    const token = await generateToken(user);

    // Set cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`
    );

    // Return success response with token and user
    return res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}