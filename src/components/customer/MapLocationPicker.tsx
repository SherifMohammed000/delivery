"use client";

import React, { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

interface MapLocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ 
  onLocationChange, 
  onAddressChange,
  className = "" 
}) => {
  const [viewState, setViewState] = useState({
    latitude: 6.6058, // Default to Ho, Volta Region
    longitude: 0.4713,
    zoom: 14
  });
  
  const [marker, setMarker] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressChange) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        // We take the first feature which is usually the most specific address/POI
        const address = data.features[0].place_name;
        onAddressChange(address);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState(prev => ({ ...prev, latitude, longitude }));
        setMarker({ lat: latitude, lng: longitude });
        onLocationChange({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Please allow location access to continue order placement.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const onMapClick = (e: any) => {
    if (e.lngLat) {
      const { lat, lng } = e.lngLat;
      setMarker({ lat, lng });
      onLocationChange({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  if (loading) {
    return (
      <div className={`w-full h-[300px] bg-zinc-100 rounded-[2.5rem] flex flex-col items-center justify-center border border-zinc-200 ${className}`}>
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-zinc-500 font-bold text-sm tracking-widest uppercase">Detecting Location...</p>
      </div>
    );
  }

  if (error && !marker) {
    return (
      <div className={`w-full p-8 bg-red-50 rounded-[2.5rem] flex flex-col items-center justify-center border border-red-100 text-center ${className}`}>
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h4 className="text-red-900 font-black uppercase tracking-widest text-sm mb-2">Location Required</h4>
        <p className="text-red-600 font-medium text-xs max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full h-[300px] rounded-[2.5rem] border border-zinc-200 overflow-hidden relative shadow-inner ${className}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={onMapClick}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <div className="text-primary animate-bounce">
               <MapPin className="w-10 h-10 fill-primary/20" />
            </div>
          </Marker>
        )}
      </Map>
      <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-zinc-100 text-center pointer-events-none">
         <p className="text-[10px] font-black uppercase text-zinc-900 tracking-widest">Tap map to refine drop-off point</p>
      </div>
    </div>
  );
};
