import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setAuthCookie, removeAuthCookie } from '../lib/auth';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérifier l'authentification au chargement en appelant l'API /api/auth/me
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          
          // Validate user data before setting it
          if (data.user && data.user.id) {
            // If the ID is in the wrong format, log it and handle gracefully
            if (typeof data.user.id === 'string' && data.user.id.startsWith('user_')) {
              console.error('Invalid user ID format detected in AuthContext:', data.user.id);
              // Try to reload the user with a proper fetch to get correct ID
              try {
                const userRefresh = await fetch(`/api/users/me`, {
                  headers: { 'Content-Type': 'application/json' },
                });
                if (userRefresh.ok) {
                  const refreshedUser = await userRefresh.json();
                  setUser(refreshedUser.user);
                } else {
                  // If reload fails, still set the user but with a warning
                  console.warn('Failed to refresh user with proper ID');
                  setUser(data.user);
                }
              } catch (refreshError) {
                console.error('Error refreshing user:', refreshError);
                setUser(data.user);
              }
            } else {
              // User ID format is correct, proceed normally
              setUser(data.user);
            }
          } else {
            console.error('User data missing ID:', data);
            setUser(null);
          }
        } else {
           // Si la réponse n'est pas ok (401, 500, etc.), l'utilisateur n'est pas connecté
           // ou le token est invalide. removeAuthCookie peut être appelé ici si nécessaire
           // par l'API /me, sinon on s'assure juste que user est null.
           setUser(null); 
           // Optionnel : si l'API /me ne supprime pas le cookie invalide, on pourrait le faire ici.
           // removeAuthCookie(); 
        }
      } catch (error) {
        // Erreur réseau ou autre problème
        console.error('Failed to fetch user status:', error);
        setUser(null);
      } finally {
        // Indiquer que le chargement initial est terminé
      setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []); // Exécuter une seule fois au montage

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Stocker le token dans un cookie
      setAuthCookie(data.token);
      
      // Mettre à jour l'état utilisateur
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Appeler l'API de déconnexion
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Supprimer le cookie côté client
      removeAuthCookie();
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Rediriger vers la page d'accueil
      router.push('/');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { success: false, error: error.message };
    }
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!user;

  // Valeur du contexte
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}