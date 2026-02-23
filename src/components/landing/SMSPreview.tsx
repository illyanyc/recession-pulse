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
              Every morning at 8 AM ET, Pulse subscribers get a concise SMS with the signals that moved.
              28 indicators distilled into one glance. <span className="text-white font-medium">$6.99/mo</span> — or
              start with the free dashboard.
            </p>

            <div className="space-y-4">
              {[
                "28 indicators analyzed — only alerts surface",
                "Prioritized by severity — danger signals first",
                "AI-generated context for each shift",
                "One glance = full macro picture",
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
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-24 h-6 bg-gray-900 rounded-full" />
                </div>

                <div className="px-4 pb-8 space-y-3">
                  <div className="text-center text-xs text-gray-500 mb-2">
                    Today 8:00 AM
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5">
                      Sample
                    </span>
                  </div>

                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-[260px]">
                    <pre className="text-xs text-gray-100 whitespace-pre-wrap font-sans leading-relaxed">
{`RECESSION PULSE Feb 22

DANGER (3):
- Copper/Gold: below 2008 level
- Temp Help: 12-mo decline
- CC Delinquency: near GFC

WATCHING (8):
Sahm Rule 0.30 | Quits 2.1%
ISM 48.5 | NFIB 93.7
Permits down | Saves 4.1%
NY Fed 55% | GDPNow 2.1%

17 indicators safe

Score: 17 safe / 8 watch / 3 danger

recessionpulse.com/dashboard`}
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
