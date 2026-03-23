import { useState, useEffect, useRef } from 'react';
import { Map, Users, Navigation, Play, Square, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

// Custom icons
const myIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const otherIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
}

interface Walker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  breed: string;
}

export default function WalkMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  const [walkers, setWalkers] = useState<Record<string, Walker>>({});
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const myId = useRef(`user-${Math.random().toString(36).substr(2, 9)}`);

  // Check if Supabase is configured
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.error(err);
          setPosition([35.6812, 139.7671]); // Default to Tokyo
        }
      );
    } else {
      setPosition([35.6812, 139.7671]);
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setError('Supabaseの環境変数が設定されていません。デモモードで動作します。');
      // Demo mode: simulate other walkers
      if (isWalking && position) {
        const demoWalkers = {
          'demo-1': { id: 'demo-1', lat: position[0] + 0.002, lng: position[1] + 0.002, name: 'マロン', breed: 'トイプードル' },
          'demo-2': { id: 'demo-2', lat: position[0] - 0.003, lng: position[1] + 0.001, name: 'コロ', breed: '柴犬' },
        };
        setWalkers(demoWalkers);
        
        const interval = setInterval(() => {
          setWalkers(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
              next[key].lat += (Math.random() - 0.5) * 0.0005;
              next[key].lng += (Math.random() - 0.5) * 0.0005;
            });
            return next;
          });
        }, 3000);
        return () => clearInterval(interval);
      } else {
        setWalkers({});
      }
      return;
    }

    if (isWalking && position) {
      // Initialize Supabase Realtime Presence
      const channel = supabase.channel('walk-room', {
        config: {
          presence: {
            key: myId.current,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const newWalkers: Record<string, Walker> = {};
          
          for (const key in state) {
            if (key !== myId.current) {
              const presence = state[key][0] as any;
              if (presence) {
                newWalkers[key] = {
                  id: key,
                  lat: presence.lat,
                  lng: presence.lng,
                  name: presence.name || 'ワンコ',
                  breed: presence.breed || '犬',
                };
              }
            }
          }
          setWalkers(newWalkers);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              lat: position[0],
              lng: position[1],
              name: 'ポチ',
              breed: '柴犬',
            });
          }
        });

      channelRef.current = channel;

      // Watch position and update presence
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          if (channelRef.current) {
            await channelRef.current.track({
              lat: newPos[0],
              lng: newPos[1],
              name: 'ポチ',
              breed: '柴犬',
            });
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    } else {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setWalkers({});
    }
  }, [isWalking, isConfigured]);

  const toggleWalk = () => {
    setIsWalking(!isWalking);
  };

  return (
    <div className="space-y-8 h-full flex flex-col pb-10">
      <header className="flex items-center justify-between pt-4 shrink-0">
        <div>
          <p className="text-xs text-gold tracking-[0.2em] uppercase mb-1">Live Walk</p>
          <h1 className="text-2xl font-serif text-text-main">お散歩マップ</h1>
        </div>
        <div className="p-3 glass-panel rounded-full">
          <Map size={20} className="text-gold" strokeWidth={1.5} />
        </div>
      </header>

      {error && (
        <div className="bg-weather-cloudy/10 border border-weather-cloudy/30 rounded-2xl p-4 flex items-start gap-3 shrink-0">
          <AlertCircle className="text-weather-cloudy shrink-0 mt-0.5" size={20} strokeWidth={1.5} />
          <p className="text-xs text-text-main/80 leading-relaxed font-light">{error}</p>
        </div>
      )}

      <section className="glass-panel rounded-[2rem] p-2 flex-1 relative overflow-hidden min-h-[400px]">
        {position ? (
          <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full rounded-2xl z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <LocationUpdater position={position} />
            
            {/* My Position */}
            <Marker position={position} icon={myIcon}>
              <Popup>
                <div className="text-center font-serif text-bg-base">
                  <p className="font-bold">ポチ (あなた)</p>
                  <p className="text-xs opacity-80">柴犬</p>
                </div>
              </Popup>
            </Marker>

            {/* Other Walkers */}
            {(Object.values(walkers) as Walker[]).map(walker => (
              <Marker key={walker.id} position={[walker.lat, walker.lng]} icon={otherIcon}>
                <Popup>
                  <div className="text-center font-serif text-bg-base">
                    <p className="font-bold">{walker.name}</p>
                    <p className="text-xs opacity-80">{walker.breed}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-bg-surface rounded-2xl">
            <p className="text-text-muted text-sm font-serif">位置情報を取得中...</p>
          </div>
        )}

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[400] px-6">
          <button
            onClick={toggleWalk}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-serif font-bold tracking-widest shadow-2xl transition-all ${
              isWalking 
                ? 'bg-weather-rain text-white hover:bg-weather-rain/90 shadow-[0_0_20px_rgba(231,76,60,0.3)]' 
                : 'bg-gold text-bg-base hover:bg-gold/90 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
            }`}
          >
            {isWalking ? (
              <>
                <Square size={18} fill="currentColor" />
                <span>お散歩終了</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>お散歩スタート</span>
              </>
            )}
          </button>
        </div>

        {/* Active Walkers Count */}
        {isWalking && (
          <div className="absolute top-6 right-6 glass-panel px-4 py-2 rounded-full z-[400] flex items-center gap-2">
            <Users size={14} className="text-weather-clear" strokeWidth={1.5} />
            <span className="text-[10px] font-serif tracking-widest text-text-main">
              {Object.keys(walkers).length}匹がお散歩中
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
