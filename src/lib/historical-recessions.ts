/**
 * Curated data for `/learn/recessions/[year]`.
 *
 * Each entry powers a static page describing one historical US recession,
 * with cross-links into the live indicators on RecessionPulse. The six
 * cycles below cover every post-war recession that is routinely studied
 * in modern macro writing (1973, 1980, 1990, 2001, 2008, 2020).
 */

export interface HistoricalRecession {
  slug: string;
  name: string;
  peak: string;
  trough: string;
  durationMonths: number;
  peakUnemployment: string;
  peakToTroughGdp: string;
  sp500DrawdownPct: number;
  summary: string;
  causes: string[];
  playbook: string;
  whatEndedIt: string;
  modernParallels: string;
  relatedIndicators: string[];
  relatedTerms: string[];
  keywords: string[];
}

export const HISTORICAL_RECESSIONS: Record<string, HistoricalRecession> = {
  "1973": {
    slug: "1973",
    name: "1973–1975 Oil Crisis Recession",
    peak: "November 1973",
    trough: "March 1975",
    durationMonths: 16,
    peakUnemployment: "9.0% (May 1975)",
    peakToTroughGdp: "-3.2%",
    sp500DrawdownPct: 48,
    summary:
      "The 1973–75 downturn was the first modern stagflation recession: a supply-side oil shock from the OPEC embargo collided with the end of Bretton Woods and already-elevated inflation. The S&P 500 lost roughly 48% peak-to-trough, unemployment rose from 4.6% to 9%, and inflation peaked above 12%.",
    causes: [
      "OPEC oil embargo quadrupling crude prices in six months",
      "End of the Bretton Woods system and dollar devaluation",
      "Wage and price controls unwinding into a cost-push spiral",
      "Fed pivoting from accommodative to restrictive policy too late",
    ],
    playbook:
      "The 1973–75 cycle is the playbook for any supply-shock recession. The yield curve inverted in advance, corporate profits collapsed over two quarters, and industrial production led the decline by months. Market-valuation ratios compressed sharply off 1972 peaks.",
    whatEndedIt:
      "Fed easing from 1974, fiscal stimulus via the 1975 tax rebate, and the eventual normalization of oil supplies. The recovery was sluggish — unemployment remained above 7% well into 1977.",
    modernParallels:
      "The 2022–23 energy shock following Russia's invasion of Ukraine and the associated inflation spike echo the 1973 dynamic, though monetary-policy credibility is far higher today than it was under Burns.",
    relatedIndicators: [
      "yield-curve-2s10s",
      "unemployment-rate",
      "industrial-production",
      "sp500",
      "corporate-profits",
    ],
    relatedTerms: ["stagflation", "recession", "yield-curve-inversion"],
    keywords: ["1973 recession", "oil crisis recession", "1975 recession", "OPEC embargo recession"],
  },
  "1980": {
    slug: "1980",
    name: "1980 & 1981–1982 Double-Dip Recession",
    peak: "January 1980 / July 1981",
    trough: "July 1980 / November 1982",
    durationMonths: 22,
    peakUnemployment: "10.8% (November 1982)",
    peakToTroughGdp: "-2.7%",
    sp500DrawdownPct: 27,
    summary:
      "The early-1980s downturn was really two back-to-back recessions engineered by Paul Volcker to break inflation. The Fed funds rate peaked at 20% in 1981, the yield curve inverted deeply, and unemployment reached its highest level in the post-war era (pre-2020).",
    causes: [
      "Volcker's aggressive Fed-funds hikes (up to 20%) to break entrenched inflation",
      "1979 oil shock from the Iranian Revolution",
      "Latin American debt crisis amplifying banking stress",
      "Manufacturing-heavy US economy disproportionately sensitive to rate hikes",
    ],
    playbook:
      "A textbook monetary-policy-driven recession. The 2s10s curve inverted by more than 200 bps, industrial production collapsed, and the unemployment rate crossed the Sahm Rule threshold by mid-1980. The 1981–82 leg featured the steepest housing starts decline of the post-war period (until 2008).",
    whatEndedIt:
      "Volcker's 1982 pivot to easing once inflation broke, combined with supply-side tax cuts under Reagan. The recovery launched the Great Moderation and secular disinflation that lasted 40 years.",
    modernParallels:
      "The 2022–24 Fed hiking cycle is the closest modern parallel in pace and magnitude. Volcker had no choice but to crush inflation; Powell has more policy room because inflation expectations have stayed anchored.",
    relatedIndicators: [
      "fed-funds-rate",
      "yield-curve-2s10s",
      "unemployment-rate",
      "sahm-rule",
      "housing-starts",
    ],
    relatedTerms: ["fed-funds-rate", "stagflation", "yield-curve-inversion", "sahm-rule"],
    keywords: ["1980 recession", "1981 recession", "Volcker recession", "double dip recession"],
  },
  "1990": {
    slug: "1990",
    name: "1990–1991 Gulf War Recession",
    peak: "July 1990",
    trough: "March 1991",
    durationMonths: 8,
    peakUnemployment: "7.8% (June 1992)",
    peakToTroughGdp: "-1.4%",
    sp500DrawdownPct: 20,
    summary:
      "A short, shallow recession driven by the savings-and-loan crisis, an oil-price spike from Iraq's invasion of Kuwait, and already-deteriorating confidence. Unemployment kept rising for a full year after the NBER-dated trough — the first 'jobless recovery.'",
    causes: [
      "Savings-and-loan crisis peaking with the 1989 FIRREA resolutions",
      "Oil price spike following Iraq's August 1990 invasion of Kuwait",
      "Real-estate-led credit tightening following the 1980s commercial-property boom",
      "Fed hiking from 1988 into 1989 to pre-empt inflation",
    ],
    playbook:
      "The 1990 recession was forecast by the Conference Board LEI and by a sharp drop in consumer sentiment months ahead of the NBER peak. It was the first cycle where modern financial-conditions indices like the NFCI would have led the real economy cleanly.",
    whatEndedIt:
      "Fed easing from late 1990, the quick resolution of the Gulf War, and a collapse in oil prices by early 1991. Jobless growth persisted, helping to usher out the Bush administration in 1992.",
    modernParallels:
      "The savings-and-loan dynamic has echoes in post-pandemic commercial real estate and regional-bank stress. The Cleveland Fed's recession probability model, still widely cited today, became prominent after calling 1990 correctly.",
    relatedIndicators: [
      "conference-board-lei",
      "consumer-sentiment",
      "unemployment-rate",
      "housing-starts",
      "sp500",
    ],
    relatedTerms: ["leading-economic-index", "recession", "nfci"],
    keywords: ["1990 recession", "Gulf War recession", "savings and loan crisis", "1991 recession"],
  },
  "2001": {
    slug: "2001",
    name: "2001 Dot-Com Recession",
    peak: "March 2001",
    trough: "November 2001",
    durationMonths: 8,
    peakUnemployment: "6.3% (June 2003)",
    peakToTroughGdp: "-0.3%",
    sp500DrawdownPct: 49,
    summary:
      "The dot-com bust and 9/11 shock produced a mild GDP recession but a severe equity bear market. The S&P 500 lost 49% from its March 2000 peak, the Nasdaq lost 78%, and capex collapsed in the telecom and tech sectors.",
    causes: [
      "Burst of the 1995–2000 internet bubble and massive overinvestment in telecom capacity",
      "Fed hiking from 1999 into 2000 to cool speculative excess",
      "Corporate accounting scandals (Enron, WorldCom) compounding the repricing",
      "September 11 terrorist attacks amplifying the consumer pullback",
    ],
    playbook:
      "Tech-sector-led capex collapse showed up early in ISM new orders, inventory-to-sales ratios, and corporate profits. The Buffett indicator (market cap to GDP) peaked near 140% in March 2000 — well above every prior post-war reading until the 2021 peak exceeded it.",
    whatEndedIt:
      "Aggressive Fed easing (6.5% to 1%), the 2001 and 2003 tax cuts, and the emergence of the housing boom as a new growth engine. The recovery was jobless — unemployment kept rising into 2003.",
    modernParallels:
      "2022 tech drawdown and AI-capex buildout in 2023–25 rhyme with the dot-com dynamic. The key question is whether AI capex produces productivity gains this time, where the fiber-build boom of 2000 eventually did.",
    relatedIndicators: [
      "sp500",
      "nasdaq",
      "sp500-pe",
      "buffett-indicator",
      "corporate-profits",
      "ism-manufacturing",
    ],
    relatedTerms: ["bear-market", "pe-ratio", "buffett-indicator", "recession"],
    keywords: ["2001 recession", "dot com recession", "dot com bust", "tech bubble recession"],
  },
  "2008": {
    slug: "2008",
    name: "2008–2009 Great Financial Crisis",
    peak: "December 2007",
    trough: "June 2009",
    durationMonths: 18,
    peakUnemployment: "10.0% (October 2009)",
    peakToTroughGdp: "-4.3%",
    sp500DrawdownPct: 57,
    summary:
      "The deepest US recession since the 1930s. A collapse in subprime mortgage credit triggered a banking panic, Lehman's September 2008 failure, and a global demand collapse. Unemployment doubled from 5% to 10%, the S&P 500 lost 57%, and the Fed took the policy rate to zero for the first time.",
    causes: [
      "Housing bubble and lax underwriting in subprime mortgages",
      "Shadow-banking leverage through MBS, CDOs, and CDS",
      "Concentration of counterparty risk in too-big-to-fail institutions (Lehman, Bear, AIG)",
      "Pro-cyclical mark-to-market accounting accelerating the capital crunch",
    ],
    playbook:
      "The 2s10s curve inverted in 2006, SLOOS tightening was flashing red by late 2007, and credit spreads blew out months before NBER dated the peak. It is the single clearest modern case for watching financial-conditions indices and bank lending-standards data.",
    whatEndedIt:
      "TARP bank recapitalization, QE1 from the Fed, the 2009 stimulus package under Obama, and stress testing that restored confidence in the banking sector. Real recovery took 6+ years — employment did not recover its pre-crisis peak until mid-2014.",
    modernParallels:
      "The 2023 regional-banking stress (SVB, First Republic) rhymed with the early 2008 liquidity phase. The big difference is that post-Dodd-Frank capital rules made the system materially less fragile.",
    relatedIndicators: [
      "credit-spreads",
      "nfci",
      "sloos-lending",
      "unemployment-rate",
      "sahm-rule",
      "bank-unrealized-losses",
      "building-permits",
      "housing-starts",
    ],
    relatedTerms: ["credit-spread", "sloos", "sahm-rule", "recession", "quantitative-easing"],
    keywords: ["2008 recession", "great financial crisis", "GFC recession", "2009 recession", "Lehman Brothers"],
  },
  "2020": {
    slug: "2020",
    name: "2020 Pandemic Recession",
    peak: "February 2020",
    trough: "April 2020",
    durationMonths: 2,
    peakUnemployment: "14.8% (April 2020)",
    peakToTroughGdp: "-10.1%",
    sp500DrawdownPct: 34,
    summary:
      "The shortest but deepest-ever US recession: a 2-month cycle triggered by government-mandated COVID lockdowns. GDP fell 10% in a single quarter, unemployment hit 14.8%, and the Fed expanded its balance sheet by $3 trillion inside 90 days.",
    causes: [
      "COVID-19 lockdowns halting services and travel in Q2 2020",
      "Global supply-chain shutdowns compounding the demand collapse",
      "Corporate credit market seizure in March 2020 before Fed facilities intervened",
    ],
    playbook:
      "The 2020 recession is the canonical exogenous-shock recession — no traditional indicator led it, because the trigger was not financial. The Fed's response (QE, credit facilities, zero rates) combined with $5T of fiscal stimulus produced the fastest-ever recovery.",
    whatEndedIt:
      "Massive fiscal stimulus (CARES Act, Paycheck Protection Program), Fed zero-rate policy plus open-ended QE and novel credit facilities, and rapid vaccine development. Output recovered to pre-pandemic peak by mid-2021.",
    modernParallels:
      "The pandemic policy response seeded the 2021–23 inflation problem. The scale of combined monetary and fiscal expansion was the single largest macro experiment since WWII.",
    relatedIndicators: [
      "unemployment-rate",
      "initial-claims",
      "gdp-growth",
      "gdpnow",
      "m2-money-supply",
      "fed-funds-rate",
    ],
    relatedTerms: ["quantitative-easing", "recession", "fed-funds-rate"],
    keywords: ["2020 recession", "COVID recession", "pandemic recession", "coronavirus recession"],
  },
};

export const HISTORICAL_RECESSION_SLUGS = Object.keys(HISTORICAL_RECESSIONS);
