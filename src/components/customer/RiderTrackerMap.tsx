"use client";

import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { 
  MapPin, 
  Navigation, 
  Home, 
  Loader2, 
  Truck,
  AlertCircle
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface RiderTrackerMapProps {
  riderId: string;
  customerLocation: { lat: number; lng: number };
  status: string;
  orderId?: string;
}

export const RiderTrackerMap: React.FC<RiderTrackerMapProps> = ({
  riderId,
  customerLocation,
  status
}) => {
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRiderOnline, setIsRiderOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState({
    latitude: customerLocation.lat,
    longitude: customerLocation.lng,
    zoom: 14,
    padding: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  useEffect(() => {
    if (!riderId) return;

    // Listen to rider's live profile for location updates
    const unsubscribe = onSnapshot(doc(db, "users", riderId), (snapshot) => {
      const data = snapshot.data();
      if (data?.currentLocation) {
        setRiderLocation(data.currentLocation);
        setIsRiderOnline(data.isOnline ?? true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [riderId]);

  // Auto-center when rider location updates
  useEffect(() => {
    if (riderLocation) {
      // Basic bounding box logic to ensure both are visible
      const midLat = (customerLocation.lat + riderLocation.lat) / 2;
      const midLng = (customerLocation.lng + riderLocation.lng) / 2;
      
      setViewState(prev => ({
        ...prev,
        latitude: midLat,
        longitude: midLng,
        // Zoom depends on distance, simplified here
        zoom: Math.abs(customerLocation.lat - riderLocation.lat) > 0.01 ? 12 : 14
      }));
    }
  }, [riderLocation, customerLocation]);

  if (loading && !riderLocation) {
    return (
      <div className="w-full h-[400px] bg-zinc-100 rounded-[3rem] flex flex-col items-center justify-center border border-zinc-200 animate-pulse">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-zinc-500 font-bold text-xs tracking-widest uppercase italic">Initializing Live Stream...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden relative group">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState as any)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Customer Destination Marker */}
        <Marker longitude={customerLocation.lng} latitude={customerLocation.lat} anchor="bottom">
          <div className="relative flex flex-col items-center">
            <div className="bg-zinc-900 text-white p-2 rounded-xl shadow-lg border border-zinc-800 mb-1 scale-75 transform origin-bottom">
               <Home className="w-5 h-5" />
            </div>
            <MapPin className="w-8 h-8 text-zinc-900 fill-zinc-900/20" />
          </div>
        </Marker>

        {/* Rider Live Marker */}
        {riderLocation && (
          <Marker longitude={riderLocation.lng} latitude={riderLocation.lat} anchor="center">
            <div className="relative group/rider">
                {/* Visual Radar Pulse */}
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25" />
                
                <div className={`relative w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all transform hover:scale-110 ${!isRiderOnline ? 'grayscale opacity-70' : ''}`}>
                    <Truck className="w-6 h-6 text-white" />
                </div>
                
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-md border border-zinc-100 whitespace-nowrap opacity-0 group-hover/rider:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[10px] font-black uppercase text-zinc-900 leading-none">Your Rider</p>
                    {!isRiderOnline && <p className="text-[8px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Connection Lost</p>}
                </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Floating Status Overlay */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 pointer-events-none">
         <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-zinc-100 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-4">
               <div className={`p-2 rounded-xl ${status === 'en_route' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                  <Navigation className={`w-5 h-5 ${status === 'en_route' ? 'animate-bounce' : ''}`} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Live Progress</p>
                  <p className="text-sm font-black text-zinc-900 capitalize italic">
                    {status === 'accepted' && "Rider heading for pickup"}
                    {status === 'at_station' && "Preparing cylinder at station"}
                    {status === 'refilling' && "Refill in progress"}
                    {status === 'en_route' && "En route to your location"}
                    {status === 'delivered' && "Arrived at your location!"}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {!isRiderOnline && (
        <div className="absolute top-6 left-6 right-6">
           <div className="bg-amber-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 justify-center text-[10px] font-black uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" />
              Ghost Signal: Rider currently offline
           </div>
        </div>
      )}
    </div>
  );
};
