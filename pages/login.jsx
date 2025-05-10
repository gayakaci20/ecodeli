import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react' // Importer useState et useEffect
import { useRouter } from 'next/router' // Importer useRouter pour la redirection
import { useAuth } from '../contexts/AuthContext' // Importer le contexte d'authentification

export default function Login({ isDarkMode, toggleDarkMode }) {
  const router = useRouter(); // Initialiser useRouter
  const { user, loading, login } = useAuth(); // Utiliser le contexte d'authentification
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      // Rediriger vers la page callback ou la page profil si déjà connecté
      const callbackUrl = router.query.callbackUrl || '/profile';
      router.push(callbackUrl);
    }
  }, [user, router]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Utiliser la fonction login du contexte d'authentification
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Une erreur est survenue lors de la connexion.');
      }

      // Connexion réussie
      console.log('Connexion réussie:', result.user);
      
      // Récupérer l'URL de callback si elle existe
      const callbackUrl = router.query.callbackUrl || '/profile';
      
      // Rediriger vers la page de profil ou la page demandée
      router.push(callbackUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Connexion - ecodeli</title>
        <meta name="description" content="Connectez-vous à votre compte ecodeli" />
        <link rel="icon" href="/LOGO_.png" />
      </Head>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        {/* Logo */}
        <div className="flex justify-between items-center mb-6">
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
        </div>

        {/* Titre */}
        <h1 className="text-center text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Bienvenue chez ecodeli !
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Connectez-vous ou inscrivez-vous.
        </p>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-6" onSubmit={handleSubmit}> {/* Ajouter onSubmit */} 
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email} // Lier la valeur à l'état
              onChange={handleChange} // Gérer les changements
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password} // Lier la valeur à l'état
              onChange={handleChange} // Gérer les changements
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end">
            <Link 
              href="/forgot-password"
              className="text-sm text-sky-400 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Mot de passe oublié
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading} // Désactiver pendant le chargement
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-sky-400 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connexion en cours...' : 'Me connecter'}
          </button>

          <div className="text-center">
            <Link 
              href="/register"
              className="text-sm text-sky-400 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
            >
              S'inscrire
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}