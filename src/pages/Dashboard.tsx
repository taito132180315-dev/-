import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Apple, MapPin, Stethoscope, Map, ChevronRight, Bell, CloudRain, Sun, Cloud, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [locationName, setLocationName] = useState<string | null>(null);
  const [walkTime, setWalkTime] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour >= 18);
  }, []);

  const registerLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.suburb || data.address.province || '現在地';
            setLocationName(city);

            const hour = new Date().getHours();
            if (hour < 10) setWalkTime('16:00 - 17:30 (夕方の涼しい時間帯)');
            else if (hour < 16) setWalkTime('17:30 - 19:00 (日没後の快適な時間帯)');
            else setWalkTime('明日の 06:30 - 08:00 (朝の清々しい時間帯)');
          } catch (e) {
            setLocationName('現在地');
            setWalkTime('17:00 - 18:30 (夕方の涼しい時間帯)');
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          setIsLocating(false);
          setLocationName('現在地(取得エラー)');
          setWalkTime('17:00 - 18:30 (夕方の涼しい時間帯)');
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const quickActions = [
    { to: '/health', icon: Activity, label: '記録', desc: '日々の変化' },
    { to: '/food', icon: Apple, label: '食事', desc: '安全確認' },
    { to: '/hospital', icon: MapPin, label: '病院', desc: '近くの施設' },
    { to: '/symptom', icon: Stethoscope, label: '相談', desc: '症状チェック' },
    { to: '/walk', icon: Map, label: '散歩', desc: 'リアルタイム' },
  ];

  return (
    <div className="space-y-10 pb-10">
      
      <header className="flex items-center justify-between pt-4">
        <div>
          <p className="text-xs text-white/70 tracking-[0.2em] uppercase mb-1">Today's Weather</p>
          <h1 className="text-2xl font-serif text-white drop-shadow-md">ポチの空模様</h1>
        </div>
        <button className="relative p-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-full hover:bg-black/30 transition-colors">
          <Bell size={18} className="text-white" strokeWidth={1.5} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-gold rounded-full"></span>
        </button>
      </header>

      {/* Main Weather Card */}
      <section>
        <div className="relative overflow-hidden rounded-[2rem] p-8 border border-white/20 bg-black/20 backdrop-blur-md shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-30">
            <Sun size={120} strokeWidth={1} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-md">
                <Sun size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-serif tracking-widest text-white drop-shadow-md">快晴</span>
            </div>
            
            <h2 className="text-3xl font-serif leading-tight mb-4 text-white drop-shadow-md">
              今日はとても<br/>機嫌が良いようです。
            </h2>
            <p className="text-sm text-white/80 font-light leading-relaxed mb-8 drop-shadow-sm">
              食欲も旺盛で、お散歩を心待ちにしています。少し長めのコースを選んでみてはいかがでしょうか。
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Relationship</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-light text-white">98</span>
                  <span className="text-xs text-white/60 mb-1">/ 100</span>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Vitality</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-light text-white">High</span>
                </div>
              </div>
            </div>

            {/* Location & Walk Time */}
            <div className="mt-6 pt-6 border-t border-white/20">
              {!locationName ? (
                <button 
                  onClick={registerLocation} 
                  disabled={isLocating} 
                  className="flex items-center gap-2 text-xs font-serif text-white hover:text-white/80 transition-colors drop-shadow-md"
                >
                  {isLocating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {isLocating ? '現在地を取得中...' : '現在地を登録して最適なお散歩時間を表示'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-serif text-white/80 drop-shadow-sm">
                    <MapPin size={14} className="text-white" />
                    <span>{locationName}周辺の空模様</span>
                  </div>
                  <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border-l-2 border-l-white">
                    <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Recommended Walk Time</p>
                    <p className="text-sm font-serif text-white drop-shadow-md">{walkTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-serif text-white/70 tracking-[0.2em] uppercase drop-shadow-sm">Concierge</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col items-start p-5 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-black/30 transition-all duration-300 shadow-lg"
            >
              <action.icon size={20} strokeWidth={1.5} className="text-white mb-4 group-hover:scale-110 transition-transform drop-shadow-md" />
              <span className="text-sm font-serif text-white mb-1 drop-shadow-md">{action.label}</span>
              <span className="text-[10px] text-white/70 drop-shadow-sm">{action.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Timeline / Reminders */}
      <section>
        <h2 className="text-xs font-serif text-white/70 tracking-[0.2em] uppercase mb-6 drop-shadow-sm">Upcoming</h2>
        <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center justify-between border-l-2 border-l-white shadow-lg">
          <div>
            <h3 className="text-sm font-serif text-white mb-1 drop-shadow-md">フィラリア予防薬</h3>
            <p className="text-xs text-white/70 font-light drop-shadow-sm">明日・5月1日</p>
          </div>
          <button className="px-5 py-2 bg-white/20 text-white text-xs font-medium rounded-full border border-white/30 hover:bg-white/30 transition-colors backdrop-blur-md">
            確認
          </button>
        </div>
      </section>
    </div>
  );
}
