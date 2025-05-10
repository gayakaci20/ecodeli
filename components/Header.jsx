import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Header({ isDarkMode, toggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Use the existing auth context
  const { user, isAuthenticated, logout, loading } = useAuth()

  return (
    <header className="relative flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      {/* Logo */}
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

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out z-20 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
           <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
               <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             ) : (
               <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
             )}
           </button>
           
           {!loading && (
            user ? (
              <div className="flex flex-col space-y-2 w-full">
                <Link 
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon Profil
                </Link>
                <button
                  onClick={async () => {
                    await logout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Déconnexion
                </button>
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
      </div>
    </header>
  )
} 