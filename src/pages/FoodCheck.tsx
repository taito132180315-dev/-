import { useState } from 'react';
import { Apple, Search, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function FoodCheck() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ status: 'safe' | 'danger' | 'caution'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkFood = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `犬が「${query}」を食べても大丈夫ですか？
      以下のJSONフォーマットで回答してください。
      {
        "status": "safe" | "danger" | "caution",
        "message": "理由や注意点を簡潔に（100文字程度）"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
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
        status: 'caution',
        message: '判定できませんでした。専門の獣医師にご相談ください。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between pt-4">
        <div>
          <p className="text-xs text-gold tracking-[0.2em] uppercase mb-1">Food Safety</p>
          <h1 className="text-2xl font-serif text-text-main">食事の安全確認</h1>
        </div>
        <div className="p-3 glass-panel rounded-full">
          <Apple size={20} className="text-gold" strokeWidth={1.5} />
        </div>
      </header>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="例：ぶどう、玉ねぎ、りんご"
            className="w-full pl-12 pr-4 py-4 bg-bg-surface rounded-2xl border border-border-glass focus:border-gold/50 focus:ring-1 focus:ring-gold/50 text-text-main placeholder:text-text-muted/50 font-serif transition-colors outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkFood()}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} strokeWidth={1.5} />
        </div>

        <button
          onClick={checkFood}
          disabled={loading || !query.trim()}
          className="w-full py-4 bg-gold text-bg-base font-serif font-bold tracking-widest rounded-2xl shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>判定中...</span>
            </>
          ) : (
            <span>チェックする</span>
          )}
        </button>
      </section>

      {result && (
        <section
          className={`rounded-[2rem] p-6 border ${
            result.status === 'danger'
              ? 'bg-weather-rain/10 border-weather-rain/30'
              : result.status === 'safe'
              ? 'bg-weather-clear/10 border-weather-clear/30'
              : 'bg-weather-cloudy/10 border-weather-cloudy/30'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full ${
                result.status === 'danger'
                  ? 'bg-weather-rain/20 text-weather-rain'
                  : result.status === 'safe'
                  ? 'bg-weather-clear/20 text-weather-clear'
                  : 'bg-weather-cloudy/20 text-weather-cloudy'
              }`}
            >
              {result.status === 'danger' ? (
                <AlertTriangle size={24} strokeWidth={1.5} />
              ) : result.status === 'safe' ? (
                <CheckCircle size={24} strokeWidth={1.5} />
              ) : (
                <Info size={24} strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h2
                className={`text-lg font-serif mb-2 ${
                  result.status === 'danger'
                    ? 'text-weather-rain'
                    : result.status === 'safe'
                    ? 'text-weather-clear'
                    : 'text-weather-cloudy'
                }`}
              >
                {result.status === 'danger'
                  ? '危険！絶対に与えないで'
                  : result.status === 'safe'
                  ? '安全です'
                  : '注意が必要です'}
              </h2>
              <p className="text-sm text-text-main/90 font-light leading-relaxed">{result.message}</p>
            </div>
          </div>
        </section>
      )}

      <section className="glass-panel rounded-[2rem] p-6">
        <h3 className="text-xs font-serif text-text-muted tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
          <Info size={14} strokeWidth={1.5} />
          <span>よく検索される危険な食べ物</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {['チョコレート', '玉ねぎ', 'ぶどう', 'キシリトール', 'アボカド'].map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
              }}
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
