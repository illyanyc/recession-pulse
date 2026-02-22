export function SMSPreview() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Your morning <span className="gradient-text">briefing</span>
            </h2>
            <p className="text-pulse-muted text-lg mb-8 leading-relaxed">
              Every morning at 8 AM ET, you get a concise SMS with the indicators that matter.
              No apps to open. No newsletters to skim. Just the pulse of the economy, in your pocket.
            </p>

            <div className="space-y-4">
              {[
                "Analyzed by AI for signal clarity",
                "Prioritized by severity — alerts first",
                "Historical context included",
                "One glance = full picture",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-pulse-green/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-pulse-green" />
                  </div>
                  <span className="text-sm text-pulse-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="w-[320px] bg-gray-900 rounded-[3rem] p-3 border-2 border-gray-700 shadow-2xl">
              <div className="bg-black rounded-[2.5rem] overflow-hidden">
                {/* Notch */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-24 h-6 bg-gray-900 rounded-full" />
                </div>

                {/* SMS Content */}
                <div className="px-4 pb-8 space-y-3">
                  <div className="text-center text-xs text-gray-500 mb-4">
                    Today 8:00 AM
                  </div>

                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-[260px]">
                    <pre className="text-xs text-gray-100 whitespace-pre-wrap font-sans leading-relaxed">
{`⚠️ RECESSION PULSE Feb 22

⚠️ ALERTS:
⚠️ Conf. Board LEI: -0.3%
  → 3Ds Rule TRIGGERED since Aug '25
⚠️ ON RRP: ~$80B
  → 97% depleted, no buffer
⚠️ DXY: ~96
  → 5-year lows, dollar weak

👀 WATCHING:
🟡 Yield Curve 2s10s: +70 bps
🟡 JPM Recession Prob: 35%

✅ 2 indicators safe

Score: 2✅ 4🟡 3🔴

📊 recessionpulse.com/dashboard`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
