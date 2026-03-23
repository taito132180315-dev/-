import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>現在地</Popup>
    </Marker>
  );
}

export default function HospitalSearch() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  // Dummy data for hospitals
  const hospitals = [
    { id: 1, name: 'ワンニャン動物病院', distance: '0.8km', rating: 4.8, open: true, lat: 35.6812, lng: 139.7671 },
    { id: 2, name: 'さくらペットクリニック', distance: '1.2km', rating: 4.5, open: false, lat: 35.6852, lng: 139.7721 },
    { id: 3, name: '緑の森どうぶつ病院', distance: '2.5km', rating: 4.9, open: true, lat: 35.6762, lng: 139.7621 },
  ];

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          // Fallback to Tokyo station
          setPosition([35.6812, 139.7671]);
          setLoading(false);
        }
      );
    } else {
      setPosition([35.6812, 139.7671]);
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="space-y-8 h-full flex flex-col pb-10">
      <header className="flex items-center justify-between pt-4 shrink-0">
        <div>
          <p className="text-xs text-gold tracking-[0.2em] uppercase mb-1">Clinic Search</p>
          <h1 className="text-2xl font-serif text-text-main">近くの動物病院</h1>
        </div>
        <div className="p-3 glass-panel rounded-full">
          <MapPin size={20} className="text-gold" strokeWidth={1.5} />
        </div>
      </header>

      <section className="glass-panel rounded-[2rem] p-4 h-64 shrink-0 relative overflow-hidden">
        {position ? (
          <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-2xl z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <LocationMarker position={position} />
            {hospitals.map(h => (
              <Marker key={h.id} position={[h.lat, h.lng]} icon={customIcon}>
                <Popup>
                  <div className="font-serif text-bg-base">{h.name}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-bg-surface rounded-2xl">
            <p className="text-text-muted text-sm font-serif">位置情報を取得中...</p>
          </div>
        )}
        <button
          onClick={getLocation}
          className="absolute bottom-6 right-6 p-3 bg-bg-surface rounded-full shadow-lg border border-border-glass hover:bg-hover-glass z-[400] transition-colors"
        >
          <Navigation size={20} className="text-gold" strokeWidth={1.5} />
        </button>
      </section>

      <section className="flex-1 overflow-y-auto pb-4 space-y-4">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="glass-panel rounded-[2rem] p-6 flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-serif text-text-main mb-2">{hospital.name}</h3>
                <div className="flex items-center gap-4 text-xs font-light">
                  <span className="flex items-center gap-1 text-gold">
                    <Star size={14} fill="currentColor" strokeWidth={1} />
                    {hospital.rating}
                  </span>
                  <span className="text-text-muted flex items-center gap-1">
                    <MapPin size={14} strokeWidth={1.5} />
                    {hospital.distance}
                  </span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase border ${hospital.open ? 'bg-weather-clear/10 text-weather-clear border-weather-clear/20' : 'bg-weather-rain/10 text-weather-rain border-weather-rain/20'}`}>
                {hospital.open ? '診療中' : '時間外'}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 bg-bg-surface border border-border-glass rounded-xl text-text-main font-serif text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-hover-glass transition-colors">
                <Phone size={16} strokeWidth={1.5} />
                電話する
              </button>
              <button className="flex-1 py-3.5 bg-gold text-bg-base rounded-xl font-serif text-xs tracking-wider font-bold flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Navigation size={16} strokeWidth={1.5} />
                経路案内
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
