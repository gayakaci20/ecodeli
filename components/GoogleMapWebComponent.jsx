import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script'; // Pour charger le script Google Maps

export default function GoogleMapWebComponent({ selectedRoute, routeCoordinates }) {
  const mapRef = useRef(null);
  const placePickerRef = useRef(null); // Garder pour la recherche
  const isApiLoaded = useRef(false); // Pour savoir si l'API est chargée
  const isInitialized = useRef(false); // Pour savoir si la carte et les écouteurs sont prêts
  const directionsRendererRef = useRef(null); // Pour stocker le DirectionsRenderer
  const mapInitRetries = useRef(0); // Pour compter les tentatives d'initialisation
  
  // State for script status
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);

  // Refs pour garder la trace des objets map ajoutés dynamiquement
  const routeElementsRef = useRef({ pickupMarker: null, deliveryMarker: null, routePolyline: null });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // Fonction pour nettoyer les marqueurs/polyline précédents
  const clearRouteElements = () => {
    if (routeElementsRef.current.pickupMarker) {
      routeElementsRef.current.pickupMarker.setMap(null);
      routeElementsRef.current.pickupMarker = null;
    }
    if (routeElementsRef.current.deliveryMarker) {
      routeElementsRef.current.deliveryMarker.setMap(null);
      routeElementsRef.current.deliveryMarker = null;
    }
    if (routeElementsRef.current.routePolyline) {
      routeElementsRef.current.routePolyline.setMap(null);
      routeElementsRef.current.routePolyline = null;
    }
    // Clear directions renderer if it exists
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
  };

  // Initialize map after script is loaded
  useEffect(() => {
    if (!scriptLoaded || scriptError || !window.google?.maps) {
      return;
    }
    
    console.log("Google Maps API loaded. Initializing map...");
    
    // Wait for DOM elements to be fully rendered
    setTimeout(() => {
      try {
        // Create map instance directly
        const mapDiv = document.getElementById('map-container');
        if (!mapDiv) {
          console.error("Map container not found");
          return;
        }
        
        // Create the map instance
        const map = new google.maps.Map(mapDiv, {
          center: { lat: 46.603354, lng: 1.888334 }, // Center on France
          zoom: 6,
          mapTypeControl: false,
        });
        
        // Store map instance
        mapRef.current = { innerMap: map };
        
        // Initialize place autocomplete
        const inputElement = document.getElementById('place-search-input');
        if (inputElement) {
          const autocomplete = new google.maps.places.Autocomplete(inputElement);
          autocomplete.bindTo('bounds', map);
          
          // Add place_changed listener
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              console.warn("No details available for place:", place.name);
              return;
            }
            
            // If the place has a geometry, present it on the map
            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
            } else {
              map.setCenter(place.geometry.location);
              map.setZoom(17);
            }
            
            // Create a marker for the place
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
            });
            
            // Show place info
            const infowindow = new google.maps.InfoWindow({
              content: `<strong>${place.name}</strong><br>${place.formatted_address || ''}`
            });
            infowindow.open(map, marker);
          });
          
          placePickerRef.current = { autocomplete };
        }
        
        isInitialized.current = true;
        console.log("Map initialized successfully");
        
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, 500);
  }, [scriptLoaded, scriptError]);

  // --- Effet pour afficher le trajet sélectionné --- 
  useEffect(() => {
    if (!isInitialized.current || !selectedRoute || !mapRef.current?.innerMap) {
      // Si pas initialisé ou pas de route sélectionnée, nettoyer et sortir
      if (!routeCoordinates) clearRouteElements(); // Only clear if no routeCoordinates to display
      // recentrer la carte si on désélectionne un trajet et qu'il n'y a pas de routeCoordinates
      if (!selectedRoute && !routeCoordinates && mapRef.current?.innerMap) {
        mapRef.current.innerMap.setCenter({ lat: 46.603354, lng: 1.888334 });
        mapRef.current.innerMap.setZoom(6);
      }
      return;
    }

    // Skip if routeCoordinates is active
    if (routeCoordinates) {
      return;
    }

    // Assurer que google.maps et le geocoder sont disponibles
    if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.Geocoder) {
        console.error("Google Maps API or Geocoder not ready.");
        return;
    }

    const geocoder = new google.maps.Geocoder();
    const mapInstance = mapRef.current.innerMap;

    Promise.all([
      new Promise((resolve, reject) => geocoder.geocode({ address: selectedRoute.pickup }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          reject(`Geocode error for pickup (${selectedRoute.pickup}): ${status}`);
        }
      })),
      new Promise((resolve, reject) => geocoder.geocode({ address: selectedRoute.delivery }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          reject(`Geocode error for delivery (${selectedRoute.delivery}): ${status}`);
        }
      }))
    ]).then(([pickupLocation, deliveryLocation]) => {
      clearRouteElements(); // Nettoyer les anciens éléments

      // Vérifie encore une fois que la carte est toujours disponible
      if (!mapRef.current || !mapRef.current.innerMap) {
        console.error("Map no longer available after geocoding");
        return;
      }

      // Créer les nouveaux marqueurs
      routeElementsRef.current.pickupMarker = new google.maps.Marker({
        position: pickupLocation,
        map: mapInstance,
        title: `Départ: ${selectedRoute.pickup}`,
      });

      routeElementsRef.current.deliveryMarker = new google.maps.Marker({
        position: deliveryLocation,
        map: mapInstance,
        title: `Arrivée: ${selectedRoute.delivery}`,
      });

      routeElementsRef.current.routePolyline = new google.maps.Polyline({
        path: [pickupLocation, deliveryLocation],
        geodesic: true,
        strokeColor: '#FF0000', // Rouge
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: mapInstance
      });

      // --- Adjust bounds --- 
      if (pickupLocation && deliveryLocation) {
          try {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(pickupLocation);
              bounds.extend(deliveryLocation);
              
              mapInstance.fitBounds(bounds);
              
              // Adjust zoom if too close
              google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
                  if (mapInstance.getZoom() > 16) {
                      mapInstance.setZoom(16);
                  }
              });
          } catch (error) {
              console.error("Error adjusting bounds:", error);
          }
      }
    }).catch(error => {
      console.error("Error displaying route:", error);
      window.alert(`Impossible d'afficher le trajet : ${error}`);
      clearRouteElements();
    });

  }, [selectedRoute, routeCoordinates]);

  // --- New effect for handling route with waypoints ---
  useEffect(() => {
    // Skip if not initialized or no routeCoordinates provided
    if (!isInitialized.current || !routeCoordinates || !routeCoordinates.origin || !routeCoordinates.destination || !mapRef.current?.innerMap) {
      return;
    }

    // Clear previous route elements
    clearRouteElements();

    // Skip if Google Maps API is not available
    if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.DirectionsService) {
      console.error("Google Maps API or DirectionsService not ready.");
      return;
    }

    const mapInstance = mapRef.current.innerMap;
    const directionsService = new google.maps.DirectionsService();
    
    // Create directions renderer if it doesn't exist
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4', // Google blue
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
    }
    
    // Set the map for the renderer
    directionsRendererRef.current.setMap(mapInstance);

    // Prepare waypoints if any
    const waypoints = routeCoordinates.waypoints || [];
    
    // Create the directions request
    const request = {
      origin: routeCoordinates.origin,
      destination: routeCoordinates.destination,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    };

    // Request directions
    directionsService.route(request, (response, status) => {
      if (status === 'OK') {
        // Display the route
        directionsRendererRef.current.setDirections(response);
        
        // Fit the map to the route bounds
        const bounds = new google.maps.LatLngBounds();
        const route = response.routes[0];
        
        // Add route points to bounds
        if (route && route.legs) {
          route.legs.forEach(leg => {
            if (leg.start_location) bounds.extend(leg.start_location);
            if (leg.end_location) bounds.extend(leg.end_location);
            
            // Include any waypoints in the bounds
            if (leg.via_waypoints) {
              leg.via_waypoints.forEach(waypoint => {
                bounds.extend(waypoint);
              });
            }
          });
          
          // Adjust the map view
          mapInstance.fitBounds(bounds);
          
          // Optional: Adjust zoom if too close
          google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
            if (mapInstance.getZoom() > 16) {
              mapInstance.setZoom(16);
            }
          });
        }
      } else {
        console.error('Directions request failed due to', status);
        window.alert(`Impossible de calculer l'itinéraire : ${status}`);
      }
    });

    // Cleanup function
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
    
  }, [routeCoordinates]);

  if (!apiKey) {
    console.error("Google Maps API key is missing.");
    return <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-700">Clé API Google Maps manquante.</div>;
  }

  const handleScriptLoad = () => {
    console.log("Google Maps Script loaded successfully");
    setScriptLoaded(true);
  };

  const handleScriptError = () => {
    console.error("Google Maps script failed to load");
    setScriptError("Failed to load Google Maps API");
  };

  return (
    <div className="w-full h-full relative">
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&v=weekly`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />

      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1, background: 'white', padding: '5px', width: '300px' }}>
        <input
          id="place-search-input"
          type="text"
          placeholder="Rechercher un lieu"
          className="w-full p-2 border border-gray-300 rounded"
          aria-label="Recherche d'adresses"
        />
      </div>

      <div 
        id="map-container"
        style={{ 
          display: 'block', 
          height: '100%', 
          width: '100%', 
          backgroundColor: '#f0f0f0' 
        }}
      >
        {!scriptLoaded && !scriptError && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Chargement de Google Maps...</p>
            </div>
          </div>
        )}
        
        {scriptError && (
          <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-700">
            <p>Erreur de chargement de Google Maps: {scriptError}</p>
          </div>
        )}
      </div>
    </div>
  );
} 