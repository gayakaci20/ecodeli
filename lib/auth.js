import * as jose from 'jose';
import Cookies from 'js-cookie';
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_MAX_AGE } from './auth-constants';

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur (sans le mot de passe)
 * @returns {String} Le token JWT généré
 */
export const generateToken = async (user) => {
  // Ne jamais inclure le mot de passe dans le token
  const { password, ...userWithoutPassword } = user;
  
  // Utiliser jose pour générer le token
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    
    const jwt = await new jose.SignJWT(userWithoutPassword)
      .setProtectedHeader({ alg: 'HS256' }) // Algorithme de signature
      .setIssuedAt() // Date d'émission
      .setExpirationTime(JWT_EXPIRES_IN) // Date d'expiration
      .sign(secretKey); // Signer avec la clé secrète

    return jwt;
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    throw new Error('Could not generate token'); // Propager l'erreur
  }
};

/**
 * Vérifie un token JWT
 * @param {String} token - Le token JWT à vérifier
 * @returns {Object|null} Les données utilisateur décodées ou null si invalide
 */
export const verifyToken = async (token) => {
  if (!token) return null;
  
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
};

/**
 * Stocke le token JWT dans un cookie
 * @param {String} token - Le token JWT à stocker
 */
export const setAuthCookie = (token) => {
  // Stocker dans un cookie httpOnly en production
  Cookies.set('auth_token', token, { 
    expires: COOKIE_MAX_AGE / (60 * 60 * 24), // Convertir en jours
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

/**
 * Récupère le token JWT depuis les cookies
 * @returns {String|null} Le token JWT ou null
 */
export const getAuthCookie = () => {
  return Cookies.get('auth_token') || null;
};

/**
 * Supprime le cookie d'authentification
 */
export const removeAuthCookie = () => {
  Cookies.remove('auth_token', { path: '/' });
};

/**
 * Récupère les données utilisateur depuis le token JWT stocké dans les cookies
 * @returns {Object|null} Les données utilisateur ou null
 */
export const getUserFromCookie = () => {
  const token = getAuthCookie();
  if (!token) return null;
  
  return verifyToken(token);
};