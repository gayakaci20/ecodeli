import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import GoogleMapWebComponent from '../components/GoogleMapWebComponent'
import Header from '../components/Header'

// --- Icônes SVG --- (Utilisez vos propres icônes ou une librairie)
const LocationPinIcon = () => (
  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const PlusCircleIcon = () => (
  <svg className="w-5 h-5 mr-1 text-sky-500 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SwapVerticalIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 12l-4-4m4 4l4-4m6 0v12m0-12l-4 4m4-4l4 4" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

export default function Trajet({ isDarkMode, toggleDarkMode }) {
  // Search settings
  const [searchType, setSearchType] = useState('my-trip')
  const [departureCity, setDepartureCity] = useState('')
  const [arrivalCity, setArrivalCity] = useState('')
  const [intermediateStops, setIntermediateStops] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Route tracking
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState(null)
  
  // Data states
  const [allPackages, setAllPackages] = useState([])
  const [filteredPackages, setFilteredPackages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        console.log('Data from /api/packages in trajet.jsx:', JSON.stringify(data, null, 2));
        
        let packagesData = [];
        if (Array.isArray(data)) {
          packagesData = data;
          console.log('Packages set in trajet.jsx (from array):', JSON.stringify(data, null, 2));
        } else if (data.packages && Array.isArray(data.packages)) {
          packagesData = data.packages;
          console.log('Packages set in trajet.jsx (from data.packages):', JSON.stringify(data.packages, null, 2));
        } else {
          // Create a mock package for testing if no data is available
          packagesData = [{
            id: 'sample1',
            title: 'Échantillon de colis',
            pickupAddress: 'Paris, France',
            deliveryAddress: 'Lyon, France',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            weight: 5
          }];
        }
        
        setAllPackages(packagesData);
        setFilteredPackages(packagesData); // Initially show all packages
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Function to swap departure and arrival cities
  const swapCities = () => {
    setDepartureCity(arrivalCity);
    setArrivalCity(departureCity);
  };

  // Function to add an intermediate stop
  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, '']);
  };

  // Function to update an intermediate stop
  const updateIntermediateStop = (index, value) => {
    const updatedStops = [...intermediateStops];
    updatedStops[index] = value;
    setIntermediateStops(updatedStops);
  };

  // Function to remove an intermediate stop
  const removeIntermediateStop = (index) => {
    const updatedStops = intermediateStops.filter((_, i) => i !== index);
    setIntermediateStops(updatedStops);
  };

  // Filter packages based on search criteria
  const filterPackages = useCallback(() => {
    if (!departureCity && !arrivalCity && searchType === 'around') {
      // If using 'around' mode but no city specified, show all packages
      setFilteredPackages(allPackages);
      return;
    }

    // Helper function to check if a location matches search terms
    const locationMatches = (address, searchTerm) => {
      if (!searchTerm) return true; // If no search term, consider it a match
      return address.toLowerCase().includes(searchTerm.toLowerCase());
    };

    // Filter based on search type
    let filtered = [];
    if (searchType === 'around') {
      // For 'around' mode, match packages with pickup or delivery near the specified city
      const searchCity = departureCity || arrivalCity;
      filtered = allPackages.filter(pkg => 
        locationMatches(pkg.pickupAddress, searchCity) || 
        locationMatches(pkg.deliveryAddress, searchCity)
      );
    } else {
      // For 'my-trip' mode, match packages along the route
      // A package is considered "along the route" if:
      // - Its pickup location matches departure or an intermediate stop
      // - Its delivery location matches arrival or an intermediate stop
      filtered = allPackages.filter(pkg => {
        // All locations to check (departure, intermediate stops, arrival)
        const routeLocations = [
          departureCity, 
          ...intermediateStops, 
          arrivalCity
        ].filter(Boolean); // Remove empty values
        
        if (routeLocations.length === 0) return true; // If no locations specified, show all
        
        // Check if pickup or delivery matches any location in the route
        const pickupMatchesRoute = routeLocations.some(loc => 
          locationMatches(pkg.pickupAddress, loc)
        );
        
        const deliveryMatchesRoute = routeLocations.some(loc => 
          locationMatches(pkg.deliveryAddress, loc)
        );
        
        return pickupMatchesRoute || deliveryMatchesRoute;
      });
    }

    setFilteredPackages(filtered);
  }, [allPackages, searchType, departureCity, arrivalCity, intermediateStops]);

  // Update filtered packages when search criteria change
  useEffect(() => {
    filterPackages();
  }, [filterPackages]);

  // Update route coordinates when route changes
  useEffect(() => {
    if (departureCity && arrivalCity) {
      setRouteCoordinates({
        origin: departureCity,
        destination: arrivalCity,
        waypoints: intermediateStops.filter(Boolean).map(stop => ({ location: stop }))
      });
    } else {
      setRouteCoordinates(null);
    }
  }, [departureCity, arrivalCity, intermediateStops]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Head>
        <title>Trouver un trajet - ecodeli</title>
        <meta name="description" content="Transportez des colis sur votre trajet ou autour de vous" />
        <link rel="icon" href="/LOGO_.png" />
      </Head>

      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main Layout (Sidebar + Map) */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Gauche */}
        <aside className="w-full md:w-1/3 lg:w-1/4 h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Sticky Header Part of Sidebar */}
          <div className="p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h1 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Transportez des colis sur votre trajet
            </h1>
            {/* Radio buttons and inputs */}
            <div className="flex items-center space-x-4 mb-4">
               <label className="flex items-center cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                 <input 
                   type="radio" 
                   name="searchType" 
                   value="around" 
                   checked={searchType === 'around'} 
                   onChange={() => setSearchType('around')} 
                   className="mr-2 focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-sky-500"
                 />
                 Autour de
               </label>
               <label className="flex items-center cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                 <input 
                   type="radio" 
                   name="searchType" 
                   value="my-trip" 
                   checked={searchType === 'my-trip'} 
                   onChange={() => setSearchType('my-trip')} 
                   className="mr-2 focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-sky-500"
                 />
                 Sur mon trajet
               </label>
            </div>
            
            {/* Departure city input */}
            <div className="relative mb-2">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <LocationPinIcon />
               </div>
               <input 
                 type="text" 
                 placeholder="Ville de départ" 
                 value={departureCity}
                 onChange={(e) => setDepartureCity(e.target.value)}
                 className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
               />
            </div>
            
            {/* Intermediate stops */}
            {intermediateStops.map((stop, index) => (
              <div key={`stop-${index}`} className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LocationPinIcon />
                </div>
                <input 
                  type="text" 
                  placeholder={`Étape ${index + 1}`}
                  value={stop}
                  onChange={(e) => updateIntermediateStop(index, e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    onClick={() => removeIntermediateStop(index)}
                    className="focus:outline-none"
                    aria-label="Supprimer cette étape"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Arrival city input */}
            <div className="relative mb-3">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <LocationPinIcon />
               </div>
               <input 
                 type="text" 
                 placeholder="Ville d'arrivée"
                 value={arrivalCity}
                 onChange={(e) => setArrivalCity(e.target.value)}
                 className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
               />
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                 <button 
                   onClick={swapCities}
                   className="focus:outline-none"
                   aria-label="Inverser les villes de départ et d'arrivée"
                 >
                   <SwapVerticalIcon />
                 </button>
               </div>
            </div>
            
            {/* Add stop button */}
            <button 
              onClick={addIntermediateStop}
              className="flex items-center text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 focus:outline-none"
            >
               <PlusCircleIcon /> Ajouter une étape
            </button>
          </div>

          {/* Scrollable Trip List */}
          <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {isLoading && <p className="text-center text-gray-500 dark:text-gray-400">Chargement des colis...</p>}
            {error && <p className="text-center text-red-500 dark:text-red-400">Erreur: {error}</p>}
            {!isLoading && !error && filteredPackages.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">Aucun colis trouvé pour cette recherche.</p>
            )}
            {!isLoading && !error && filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition"
                onClick={() => setSelectedRoute({
                  pickup: pkg.pickupAddress,
                  delivery: pkg.deliveryAddress,
                  id: pkg.id
                })}
              >
                <div className="w-1/4 flex-shrink-0 relative aspect-square">
                  {pkg.imageUrl ? (
                    <Image 
                      src={pkg.imageUrl} 
                      alt={`Image pour ${pkg.title}`} 
                      layout="fill"
                      objectFit="cover"
                      className="bg-gray-200 dark:bg-gray-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col justify-between flex-grow">
                  <div>
                     <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100 line-clamp-2">{pkg.title}</h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5">
                       <LocationPinIcon /> <span className="ml-1 truncate">{pkg.pickupAddress}</span>
                     </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                       <LocationPinIcon /> <span className="ml-1 truncate">{pkg.deliveryAddress}</span>
                     </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                       Créé le: {new Date(pkg.createdAt).toLocaleDateString()}
                     </p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                     <span className="font-semibold text-sky-600 dark:text-sky-400 text-sm">
                       {pkg.weight ? `${pkg.weight} kg` : (pkg.dimensions || 'N/A')}
                     </span>
                     <span className="text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">{pkg.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Filters Button */}
          <div className="p-4 mt-auto sticky bottom-0 bg-white dark:bg-gray-900 z-10 border-t border-gray-200 dark:border-gray-700 flex justify-center flex-shrink-0">
            <button 
              onClick={filterPackages}
              className="bg-sky-400 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center transition"
            >
              <FilterIcon /> Filtres
            </button>
          </div>
        </aside>

        {/* Map Droite - REMPLACÉ */}
        <main className="flex-grow h-full bg-gray-100 dark:bg-gray-800 relative">
          {/* Le composant prend toute la place */}
          <GoogleMapWebComponent 
            selectedRoute={selectedRoute} 
            routeCoordinates={routeCoordinates}
          />
        </main>
      </div>
    </div>
  )
}
