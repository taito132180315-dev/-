import { useState } from 'react';
import { Stethoscope, Send, Loader2, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function SymptomChecker() {
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState<{ urgency: 'high' | 'medium' | 'low'; advice: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSymptom = async () => {
    if (!symptom.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `犬の症状「${symptom}」について、獣医師の視点で緊急度とアドバイスを判定してください。
      以下のJSONフォーマットで回答してください。
      {
        "urgency": "high" | "medium" | "low",
        "advice": "具体的なアドバイスや観察ポイント（150文字程度）"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({
        urgency: 'medium',
        advice: '判定できませんでした。心配な場合は、かかりつけの獣医師にご相談ください。',
      });
    } finally {
      setLoading(false);
    }
  };

  const commonSymptoms = [
    '下痢をしている', '吐いている', '食欲がない', '元気がない', '足を痛そうにしている'
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between pt-4">
        <div>
          <p className="text-xs text-gold tracking-[0.2em] uppercase mb-1">Consultation</p>
          <h1 className="text-2xl font-serif text-text-main">症状チェッカー</h1>
        </div>
        <div className="p-3 glass-panel rounded-full">
          <Stethoscope size={20} className="text-gold" strokeWidth={1.5} />
        </div>
      </header>

      <section className="glass-panel rounded-[2rem] p-6">
        <label className="block text-sm font-serif text-text-main mb-4">
          気になる症状を教えてください
        </label>
        <div className="relative mb-6">
          <textarea
            rows={4}
            placeholder="例：今朝から3回吐いていて、水も飲まない..."
            className="w-full p-4 bg-bg-surface rounded-2xl border border-border-glass focus:border-gold/50 focus:ring-1 focus:ring-gold/50 text-text-main placeholder:text-text-muted/50 font-serif resize-none transition-colors outline-none"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          />
        </div>

        <button
          onClick={checkSymptom}
          disabled={loading || !symptom.trim()}
          className="w-full py-4 bg-gold text-bg-base font-serif font-bold tracking-widest rounded-2xl shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>分析中...</span>
            </>
          ) : (
            <>
              <Send size={18} strokeWidth={1.5} />
              <span>チェックする</span>
            </>
          )}
        </button>
      </section>

      {result && (
        <section
          className={`rounded-[2rem] p-6 border ${
            result.urgency === 'high'
              ? 'bg-weather-rain/10 border-weather-rain/30'
              : result.urgency === 'medium'
              ? 'bg-weather-cloudy/10 border-weather-cloudy/30'
              : 'bg-weather-clear/10 border-weather-clear/30'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full shrink-0 ${
                result.urgency === 'high'
                  ? 'bg-weather-rain/20 text-weather-rain'
                  : result.urgency === 'medium'
                  ? 'bg-weather-cloudy/20 text-weather-cloudy'
                  : 'bg-weather-clear/20 text-weather-clear'
              }`}
            >
              {result.urgency === 'high' ? (
                <AlertCircle size={24} strokeWidth={1.5} />
              ) : result.urgency === 'medium' ? (
                <AlertCircle size={24} strokeWidth={1.5} />
              ) : (
                <CheckCircle2 size={24} strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h2
                className={`text-xl font-serif mb-3 ${
                  result.urgency === 'high'
                    ? 'text-weather-rain'
                    : result.urgency === 'medium'
                    ? 'text-weather-cloudy'
                    : 'text-weather-clear'
                }`}
              >
                {result.urgency === 'high'
                  ? 'すぐに動物病院へ！'
                  : result.urgency === 'medium'
                  ? '様子を見て、続くなら病院へ'
                  : '緊急性は低そうです'}
              </h2>
              <p className="text-sm text-text-main/90 font-light leading-relaxed whitespace-pre-wrap">
                {result.advice}
              </p>
              
              {result.urgency !== 'low' && (
                <button className="mt-6 px-5 py-2.5 bg-bg-surface rounded-full text-xs font-serif tracking-widest text-text-main border border-border-glass flex items-center gap-2 hover:bg-hover-glass transition-colors">
                  近くの病院を探す <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="glass-panel rounded-[2rem] p-6">
        <h3 className="text-xs font-serif text-text-muted tracking-[0.2em] uppercase mb-4">よくある症状から選ぶ</h3>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms.map((item) => (
            <button
              key={item}
              onClick={() => setSymptom(item)}
              className="px-5 py-2.5 bg-bg-surface rounded-full text-xs font-serif text-text-muted border border-border-glass hover:border-gold/50 hover:text-gold transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
