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
              42 indicators distilled into one glance. <span className="text-white font-medium">$6.99/mo</span> — or
              start with the free dashboard.
            </p>

            <div className="space-y-4">
              {[
                "42 indicators analyzed — only alerts surface",
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

          {/* iPhone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[300px]">
              {/* Outer frame */}
              <div className="bg-[#1a1a1a] rounded-[50px] p-[10px] shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]">
                {/* Screen */}
                <div className="bg-black rounded-[42px] overflow-hidden relative">
                  {/* Dynamic Island */}
                  <div className="flex justify-center pt-3 pb-1 relative z-10">
                    <div className="w-[100px] h-[28px] bg-black rounded-full border border-[#1a1a1a]" style={{ boxShadow: "0 0 0 2px #000" }} />
                  </div>

                  {/* Status bar */}
                  <div className="flex items-center justify-between px-8 py-1">
                    <span className="text-[11px] font-semibold text-white">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <svg width="16" height="11" viewBox="0 0 16 11" fill="white"><rect x="0" y="4" width="3" height="7" rx="0.5" opacity="0.3"/><rect x="4.5" y="2.5" width="3" height="8.5" rx="0.5" opacity="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5" opacity="0.7"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5"/></svg>
                      <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M7.5 2.5C9.5 2.5 11.2 3.3 12.4 4.5L13.8 3.1C12.2 1.5 10 0.5 7.5 0.5C5 0.5 2.8 1.5 1.2 3.1L2.6 4.5C3.8 3.3 5.5 2.5 7.5 2.5Z" fill="white" opacity="0.3"/><path d="M7.5 5.5C8.8 5.5 10 6 10.9 6.9L12.3 5.5C11 4.2 9.3 3.5 7.5 3.5C5.7 3.5 4 4.2 2.7 5.5L4.1 6.9C5 6 6.2 5.5 7.5 5.5Z" fill="white" opacity="0.6"/><path d="M7.5 8.5C8.2 8.5 8.8 8.8 9.2 9.2L7.5 11L5.8 9.2C6.2 8.8 6.8 8.5 7.5 8.5Z" fill="white"/></svg>
                      <div className="flex items-center">
                        <div className="w-[22px] h-[10px] border border-white/40 rounded-[3px] relative">
                          <div className="absolute inset-[1.5px] right-[3px] bg-white rounded-[1px]" />
                        </div>
                        <div className="w-[1.5px] h-[4px] bg-white/40 rounded-r-full ml-[0.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* Messages header */}
                  <div className="text-center py-2 border-b border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-500 to-gray-600 mx-auto mb-1 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">RP</span>
                    </div>
                    <p className="text-[11px] text-gray-400">RecessionPulse</p>
                  </div>

                  {/* Message content */}
                  <div className="px-4 py-4 space-y-2 min-h-[380px]">
                    <div className="text-center text-[10px] text-gray-500 mb-3">
                      Today 8:00 AM
                    </div>

                    {/* SMS bubble */}
                    <div className="bg-[#262628] rounded-2xl rounded-tl-[4px] p-3.5 max-w-[240px]">
                      <pre className="text-[11px] text-gray-100 whitespace-pre-wrap font-sans leading-[1.45]">
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

                    {/* Delivery status */}
                    <p className="text-[9px] text-gray-600 pl-1">Delivered</p>
                  </div>

                  {/* iMessage input bar */}
                  <div className="px-3 pb-3 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#262628] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      </div>
                      <div className="flex-1 h-8 rounded-full border border-[#3a3a3c] bg-transparent px-3 flex items-center">
                        <span className="text-[12px] text-[#8e8e93]">iMessage</span>
                      </div>
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div className="flex justify-center pb-2">
                    <div className="w-[120px] h-[4px] bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Side buttons */}
              <div className="absolute left-[-2px] top-[120px] w-[3px] h-[28px] bg-[#2a2a2a] rounded-l-full" />
              <div className="absolute left-[-2px] top-[160px] w-[3px] h-[50px] bg-[#2a2a2a] rounded-l-full" />
              <div className="absolute left-[-2px] top-[220px] w-[3px] h-[50px] bg-[#2a2a2a] rounded-l-full" />
              <div className="absolute right-[-2px] top-[170px] w-[3px] h-[70px] bg-[#2a2a2a] rounded-r-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
