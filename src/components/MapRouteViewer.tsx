"use client";

import React, { useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface MapRouteViewerProps {
  customerLocation?: Location;
  riderLocation?: Location;
  className?: string;
  zoom?: number;
}

export const MapRouteViewer: React.FC<MapRouteViewerProps> = ({ 
  customerLocation, 
  riderLocation, 
  className = "",
  zoom = 13
}) => {
  // Center roughly between the two points, or just center on customer if rider missing
  const centerLat = customerLocation?.lat || riderLocation?.lat || 6.6058;
  const centerLng = customerLocation?.lng || riderLocation?.lng || 0.4713;

  const [viewState, setViewState] = useState({
    latitude: centerLat,
    longitude: centerLng,
    zoom: zoom
  });

  const geojson: any = {
    type: 'FeatureCollection',
    features: []
  };

  if (customerLocation && riderLocation) {
    geojson.features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [riderLocation.lng, riderLocation.lat],
          [customerLocation.lng, customerLocation.lat]
        ]
      }
    });
  }

  const lineLayer: any = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#18181A', // zinc-900
      'line-width': 4,
      'line-dasharray': [2, 2]
    }
  };

  return (
    <div className={`w-full overflow-hidden relative border border-zinc-200 bg-zinc-100 ${className}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
      >
        {customerLocation && (
          <Marker longitude={customerLocation.lng} latitude={customerLocation.lat} anchor="bottom">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
               <MapPin className="w-6 h-6 text-primary" />
            </div>
          </Marker>
        )}

        {riderLocation && (
          <Marker longitude={riderLocation.lng} latitude={riderLocation.lat} anchor="center">
            <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
               <Navigation className="w-4 h-4 text-white" />
            </div>
          </Marker>
        )}

        {customerLocation && riderLocation && (
          <Source id="my-data" type="geojson" data={geojson}>
            <Layer {...lineLayer} />
          </Source>
        )}
      </Map>
    </div>
  );
};
