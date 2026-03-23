import { useState } from 'react';
import { Activity, Plus, Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function HealthRecord() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const records = [
    { id: 1, type: 'weight', label: '体重', value: '12.4kg', time: '08:00' },
    { id: 2, type: 'medication', label: 'フィラリア予防薬', value: '済', time: '08:30' },
    { id: 3, type: 'condition', label: '便の状態', value: '普通', time: '09:15' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between pt-4">
        <div>
          <p className="text-xs text-gold tracking-[0.2em] uppercase mb-1">Timeline</p>
          <h1 className="text-2xl font-serif text-text-main">記録の軌跡</h1>
        </div>
        <button className="p-3 bg-gold text-bg-base rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-gold/90 transition-colors">
          <Plus size={20} strokeWidth={1.5} />
        </button>
      </header>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between mb-8">
          <button className="p-2 hover:bg-hover-glass rounded-full transition-colors">
            <ChevronLeft size={20} className="text-text-muted" strokeWidth={1.5} />
          </button>
          <h2 className="text-lg font-serif text-text-main tracking-widest">
            {format(selectedDate, 'M月d日', { locale: ja })}
          </h2>
          <button className="p-2 hover:bg-hover-glass rounded-full transition-colors">
            <ChevronRight size={20} className="text-text-muted" strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border-glass"></div>
          
          <div className="space-y-6">
            {records.map((record) => (
              <div key={record.id} className="relative flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-bg-surface border border-border-glass flex items-center justify-center z-10 shadow-lg">
                  {record.type === 'medication' ? (
                    <CheckCircle2 size={20} className="text-weather-clear" strokeWidth={1.5} />
                  ) : (
                    <Activity size={20} className="text-gold" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 glass-panel rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-serif text-text-main">{record.label}</p>
                    <p className="text-xs text-text-muted font-light mt-1">{record.time}</p>
                  </div>
                  <span className="text-lg font-light text-text-main">{record.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-serif text-text-muted tracking-[0.2em] uppercase mb-6">Reminders</h3>
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between border-l-2 border-l-weather-cloudy">
          <div className="flex items-center gap-4">
            <Circle size={20} className="text-weather-cloudy" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-serif text-text-main mb-1">ノミ・マダニ駆除薬</h4>
              <p className="text-xs text-text-muted font-light">予定日: 5月10日</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
