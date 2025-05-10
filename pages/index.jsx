import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Home({ isDarkMode, toggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, loading, logout } = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>ecodeli</title>
        <meta name="description" content="Livraison facile, écolo et moins chère" />
        <link rel="icon" href="/LOGO_.png" />
      </Head>

      {/* Header */}
      <header className="relative flex justify-between items-center p-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image 
            src="/LOGO_.png"
            alt="Logo Ecodeli"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold text-black dark:text-white">ecodeli</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-gray-800 dark:text-gray-200 font-medium">
          <Link href="#" className="hover:text-sky-500 dark:hover:text-sky-400">Accueil</Link>
          <Link href="/exp" className="hover:text-sky-500 dark:hover:text-sky-400">Expédier un colis</Link>
          <Link href="/trajet" className="hover:text-sky-500 dark:hover:text-sky-400">Voir les trajets</Link>
          <Link href="#" className="hover:text-sky-500 dark:hover:text-sky-400">Nos solutions</Link>
          <Link href="#" className="hover:text-sky-500 dark:hover:text-sky-400">Tarifs</Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          
          {!loading && (
            user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-sky-400 text-white font-medium px-5 py-2 rounded-full hover:bg-sky-500 transition flex items-center justify-center w-[60px] h-[40px]"
                  aria-label="Ouvrir le menu utilisateur"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <svg 
                    className="w-6 h-6"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link 
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mon Profil
                    </Link>
                    <button
                      onClick={async () => {
                        await logout()
                        setIsDropdownOpen(false)
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-sky-400 text-white font-medium px-2 py-2 rounded-full hover:bg-sky-500 transition w-[145px] h-[40px] flex items-center justify-center"
              >
                Me connecter
              </Link>
            )
          )}
          {loading && (
             <div className="bg-sky-400 rounded-full w-[60px] h-[40px] animate-pulse"></div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg 
            className="w-6 h-6 text-gray-800 dark:text-gray-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <nav className="flex flex-col p-4">
            <Link href="#" className="py-2 text-gray-800 dark:text-white hover:text-sky-500 dark:hover:text-sky-400">Accueil</Link>
            <Link href="/exp" className="py-2 text-gray-800 dark:text-white hover:text-sky-500 dark:hover:text-sky-400">Expédier un colis</Link>
            <Link href="#" className="py-2 text-gray-800 dark:text-white hover:text-sky-500 dark:hover:text-sky-400">Voir les trajets</Link>
            <Link href="#" className="py-2 text-gray-800 dark:text-white hover:text-sky-500 dark:hover:text-sky-400">Nos solutions</Link>
            <Link href="#" className="py-2 text-gray-800 dark:text-white hover:text-sky-500 dark:hover:text-sky-400">Tarifs</Link>
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              
              {!loading && (
                 user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="bg-sky-400 text-white font-medium px-5 py-2 rounded-full hover:bg-sky-500 transition flex items-center justify-center w-[60px] h-[40px]"
                      aria-label="Ouvrir le menu utilisateur"
                      aria-haspopup="true"
                      aria-expanded={isDropdownOpen}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </button>

                    {isDropdownOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <Link 
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                          onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                        >
                          Mon Profil
                        </Link>
                        <button
                          onClick={async () => {
                            await logout()
                            setIsDropdownOpen(false)
                            setIsMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                 ) : (
                  <Link 
                    href="/login"
                    className="bg-sky-400 text-white font-medium px-2 py-2 rounded-full hover:bg-sky-500 transition w-[145px] h-[40px] flex items-center justify-center"
                  >
                    Me connecter
                  </Link>
                 )
              )}
               {loading && (
                 <div className="bg-sky-400 rounded-full w-[60px] h-[40px] animate-pulse"></div>
               )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 py-12 md:py-20">
        {/* Left Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
            Livraison facile, écolo <br />
            et moins chère.
          </h1>
          <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg">
            Envoyez vos colis partout en France en profitant de trajets déjà planifiés.
            C'est malin, économique et bon pour la planète. <br />
            Bienvenue sur ecodeli !
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/exp" className="bg-sky-400 text-white px-6 py-3 rounded-full font-medium hover:bg-sky-500 transition">
              Envoyer un colis
            </Link>
            <Link href="/trajet" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              Voir les trajets disponibles
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="md:w-1/2 mb-12 md:mb-0 flex justify-center">
          <img 
            src="/pin.png" 
            alt="Illustration" 
            className="w-72 md:w-96"
          />
        </div>
      </main>
    </div>
  )
} 