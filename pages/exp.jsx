import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext' // Import useAuth hook

// Helper function to skip file upload during testing
const isDev = process.env.NODE_ENV === 'development';
const SKIP_REAL_UPLOAD = false; // Désactivé pour permettre le téléchargement réel des fichiers

// Icônes (vous pouvez utiliser des icônes SVG ou une librairie)
const CameraIcon = () => (
  <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.75h.008v.008h-.008V10.75z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="h-5 w-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function Exp({ isDarkMode, toggleDarkMode }) {
  const router = useRouter()
  const { user, loading } = useAuth() // Get authentication state
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Form State
  const [photos, setPhotos] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [objectName, setObjectName] = useState('')
  const [knowDimensions, setKnowDimensions] = useState(false)
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [format, setFormat] = useState('')
  const [weight, setWeight] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // --- Add State for Addresses --- 
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page with a callback URL to return here after login
      router.push(`/login?callbackUrl=${encodeURIComponent('/exp')}`);
    }
  }, [user, loading, router]);

  // If still loading auth state or redirecting, show loading state
  if (loading || (!loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      setPhotos(e.target.files); // Store the FileList
      console.log("Selected files:", e.target.files);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!objectName || !pickupAddress || !deliveryAddress) {
      setError('Veuillez remplir tous les champs obligatoires (Objet, Adresses).');
      setIsLoading(false);
      return;
    }

    let imageUrl = null;
    
    // Upload photo if selected - Using try/catch for each API call separately
    if (photos && photos.length > 0) {
      try {
        console.log('Preparing photo upload...');
        
        // Skip actual upload in development for testing
        if (SKIP_REAL_UPLOAD) {
          console.log('Skipping real upload in development mode');
          imageUrl = `/uploads/mock-dev-image-${Date.now()}.jpg`;
        } else {
          const formData = new FormData();
          formData.append('photo', photos[0]);
          
          const uploadRes = await fetch('/api/upload', { 
            method: 'POST', 
            body: formData 
          });
          
          // Gestion améliorée de la réponse
          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json();
            imageUrl = uploadResult.url;
            console.log('Upload réussi, URL de l\'image:', imageUrl);
          } else {
            // Récupérer les détails de l'erreur si disponibles
            let errorDetails = '';
            try {
              const errorData = await uploadRes.json();
              errorDetails = errorData.message || errorData.error || '';
            } catch (e) {
              // Si on ne peut pas analyser la réponse JSON
              console.error('Impossible d\'analyser la réponse d\'erreur:', e);
            }
            console.error(`Échec de l'upload avec statut: ${uploadRes.status}`, errorDetails);
            throw new Error(`Échec de l'upload: ${errorDetails || 'Erreur serveur'}`);
          }
        }
      } catch (uploadErr) {
        console.error("Upload Error:", uploadErr);
        setError(`Erreur d'upload: ${uploadErr.message || 'Erreur inconnue'}`);
        setIsLoading(false);
        return;
      }
    }

    // Prepare data for package creation
    console.log('Preparing package data...');
    const dimensions = knowDimensions && length && width && height ? `${length}x${width}x${height}` : null;

    // Create package record
    try {
      console.log('User data from auth context:', user); // Debug user object
      console.log('Submitting package data...');
      
      // Check for a valid user session before proceeding
      const checkUser = async () => {
        try {
          const userResponse = await fetch('/api/auth/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user && userData.user.id && !userData.user.id.startsWith('user_')) {
              console.log('Valid user ID confirmed:', userData.user.id);
              return userData.user.id;
            } else {
              console.warn('Auth API returned invalid user ID format:', userData.user?.id);
            }
          } else {
            console.error('Failed to validate user session, status:', userResponse.status);
          }
          return null;
        } catch (err) {
          console.error('Error checking user session:', err);
          return null;
        }
      };
      
      // Get a fresh user ID - prioritize API call over context
      let userId = await checkUser();
      
      // Fall back to context only if it's a valid format
      if (!userId && user?.id && typeof user.id === 'string' && !user.id.startsWith('user_')) {
        userId = user.id;
        console.log('Using user ID from context:', userId);
      }
      
      if (!userId) {
        console.error('No valid user ID found!');
        setError('Erreur d\'authentification. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }
      
      const packageData = {
        userId,
        title: objectName,
        description: additionalInfo || null,
        quantity: parseInt(quantity, 10) || 1,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        pickupAddress,
        deliveryAddress,
        imageUrl,
      };
      
      console.log('Sending package data to API:', JSON.stringify(packageData, null, 2));
      const pkgRes = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });
      
      console.log('API response status:', pkgRes.status);
      
      // Check if the response is JSON
      const contentType = pkgRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await pkgRes.json();
        
        if (pkgRes.ok) {
          console.log('Package created successfully:', responseData);
          router.push('/trajet');
        } else {
          // Handle structured error from API
          console.error('API returned error:', responseData);
          const errorMessage = responseData.details || responseData.error || 'Échec de création du colis';
          setError(errorMessage);
        }
      } else {
        // Handle non-JSON response (likely HTML error page)
        console.error('Received non-JSON response from API');
        const text = await pkgRes.text();
        console.error('Response text:', text.substring(0, 500) + '...'); // Log the start of the response
        setError(`Erreur serveur: Le serveur a retourné une réponse non valide (${pkgRes.status})`);
      }
    } catch (createErr) {
      console.error("Create Package Error:", createErr);
      setError(`Erreur création colis: ${createErr.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Head>
        <title>Expédier un objet - ecodeli</title>
        <meta name="description" content="Décrivez l'objet que vous souhaitez expédier" />
        <link rel="icon" href="/LOGO_.png" />
      </Head>

      {/* Replace the old header with the shared Header component */}
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main Content - Form */}
      <main className="p-4 md:p-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Quels objets envoyez-vous ?
            </h1>
            <Link href="#" className="text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 whitespace-nowrap">
              Voir le guide photo
            </Link>
          </div>

          <div className="mb-6 relative">
            <label htmlFor="photos" className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <CameraIcon />
              <span className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">
                {photos ? `${photos.length} photo(s) sélectionnée(s)` : 'Ajouter des photos'}
              </span>
              <input 
                id="photos"
                name="photos"
                type="file"
                multiple 
                onChange={handlePhotoChange} 
                className="sr-only"
                accept="image/png, image/jpeg, image/gif"
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Jusqu'à 7 photos, format JPG, PNG et GIF jusqu'à 7MB.
            </p>
            <div className="absolute -right-5 -bottom-5 md:right-0 md:-bottom-2 hidden sm:block">
              <Image src="/pin.png" alt="Mascot Pin" width={80} height={80} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantité
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="objectName" className="block text-sm font-medium mb-1">
                Objet
              </label>
              <input
                type="text"
                id="objectName"
                name="objectName"
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                placeholder="Ex : Canapé, fauteuil, scooter ..."
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium mb-1">Adresse de départ</label>
              <input 
                type="text" 
                id="pickupAddress" 
                value={pickupAddress} 
                onChange={(e) => setPickupAddress(e.target.value)} 
                required 
                placeholder="1 rue de l'exemple, 75001 Paris"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-medium mb-1">Adresse d'arrivée</label>
              <input 
                type="text" 
                id="deliveryAddress" 
                value={deliveryAddress} 
                onChange={(e) => setDeliveryAddress(e.target.value)} 
                required 
                placeholder="10 avenue des exemples, 69001 Lyon"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <button
              type="button"
              onClick={() => setKnowDimensions(!knowDimensions)}
              className={`${knowDimensions ? 'bg-sky-400' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900 mr-3`}
              aria-pressed={knowDimensions}
            >
              <span className={`${knowDimensions ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
            </button>
            <span className="text-sm font-medium cursor-pointer" onClick={() => setKnowDimensions(!knowDimensions)}>
              Je connais les dimensions exactes (L x l x h)
            </span>
          </div>

          {knowDimensions && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <label htmlFor="length" className="block text-xs font-medium mb-1">Longueur (cm)</label>
                <input type="number" id="length" value={length} onChange={e => setLength(e.target.value)} required className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div>
                 <label htmlFor="width" className="block text-xs font-medium mb-1">Largeur (cm)</label>
                <input type="number" id="width" value={width} onChange={e => setWidth(e.target.value)} required className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              </div>
               <div>
                 <label htmlFor="height" className="block text-xs font-medium mb-1">Hauteur (cm)</label>
                <input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} required className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-1">
                Poids total estimé (kg)
              </label>
               <input 
                 type="number" 
                 id="weight" 
                 name="weight"
                 value={weight} 
                 onChange={(e) => setWeight(e.target.value)}
                 step="0.1" 
                 min="0"
                 placeholder="Ex: 15.5"
                 className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500"
               />
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">
              Informations complémentaires (optionnel)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows="4"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Ex : Le carton le plus long fait 2m15, le plus lourd est un canapé. Objets fragiles ? Besoin d'aide au chargement ?"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500"
            ></textarea>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Ces informations sont publiques. Ne partagez pas de données personnelles ici.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-700">
              Erreur: {error}
            </div>
          )}

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-sky-400 hover:bg-sky-500 disabled:bg-sky-400 text-white font-medium px-8 py-3 rounded-full flex items-center transition"
            >
              {isLoading ? 'Enregistrement...' : 'Suivant'}
              {!isLoading && <ArrowRightIcon />}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
