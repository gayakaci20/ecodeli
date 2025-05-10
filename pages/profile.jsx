import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function Profile({ isDarkMode, toggleDarkMode }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Rediriger vers la page de connexion si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Mon Profil - ecodeli</title>
        <meta name="description" content="Gérez votre profil ecodeli" />
        <link rel="icon" href="/LOGO_.png" />
      </Head>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/LOGO_.png"
                alt="Logo Ecodeli"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold text-black dark:text-white">ecodeli</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* En-tête du profil */}
          <div className="bg-sky-500 px-6 py-16 relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Informations du profil */}
          <div className="px-6 pt-16 pb-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-1">
              {user.role === 'SENDER' ? 'Expéditeur' : user.role === 'CARRIER' ? 'Transporteur' : 'Administrateur'}
            </p>
          </div>
          
          {/* Détails du profil */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{user.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{user.phoneNumber || 'Non renseigné'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{user.address || 'Non renseignée'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Membre depuis</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link 
                href="/settings"
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md transition-colors"
              >
                Modifier mon profil
              </Link>
              
              <Link 
                href="/exp"
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Expédier un colis
              </Link>
              
              {user.role === 'CARRIER' && (
                <Link 
                  href="/trajet/create"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Proposer un trajet
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Section des colis ou trajets récents */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Colis récents */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mes colis récents</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Vous n'avez pas encore de colis.
              </p>
              {/* Ici, vous pourriez afficher une liste de colis si l'utilisateur en a */}
            </div>
          </div>
          
          {/* Trajets récents (pour les transporteurs) */}
          {user.role === 'CARRIER' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mes trajets récents</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Vous n'avez pas encore proposé de trajet.
                </p>
                {/* Ici, vous pourriez afficher une liste de trajets si l'utilisateur en a */}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}