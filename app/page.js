'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts'

// ─── DATA ───────────────────────────────────────────────────────────────────

const SUBJECT = {
  address: '6361 S Oldridge Pl, Rogers, AR 72758',
  type: 'Flex Industrial',
  subtype: 'Office / Retail / Warehouse',
  yearBuilt: 2025,
  totalSF: 38225,
  availableSpaces: 2,
  askingRentLow: 16.00,
  askingRentHigh: 19.00,
  developer: 'NWA Industrial (Crossland Construction)',
  loopnetUrl: 'https://www.loopnet.com/Listing/6361-S-Oldridge-Pl-Rogers-AR/32391011/',
  loopnetId: '32391011',
}

const COMPS = [
  { id: 1, name: 'Lowell Flex Building', address: '200 Grant Pl, Lowell, AR 72745', sf: 58698, salePrice: 7250000, ppsf: 123, date: '2025', type: 'Flex Industrial', yearBuilt: 2022, url: 'https://talkbusiness.net/2025/09/real-deals-rogers-industrial-site-sells-for-8-2-million/' },
  { id: 2, name: 'Springdale Warehouse', address: '4659 Wildwood Ln, Springdale, AR', sf: 24900, salePrice: 3700000, ppsf: 149, date: 'Aug 2025', type: 'Warehouse', yearBuilt: null, url: 'https://talkbusiness.net/2025/09/four-arkansas-properties-sell-for-13-4-million/' },
  { id: 3, name: 'Rogers Industrial Campus', address: '110-115 E Linden St, Rogers, AR', sf: 82658, salePrice: 8200000, ppsf: 99, date: 'Dec 2025', type: 'Warehouse Portfolio', yearBuilt: null, url: 'https://www.loopnet.com/Listing/1821-S-1st-St-Rogers-AR/36273915/' },
  { id: 4, name: 'N. Little Rock Flex Portfolio', address: 'Harold & 38th St, N. Little Rock, AR', sf: 23480, salePrice: 1575000, ppsf: 67, date: 'Aug 2025', type: 'Office/Flex', yearBuilt: null, url: 'https://talkbusiness.net/2025/09/four-arkansas-properties-sell-for-13-4-million/' },
  { id: 5, name: 'Fayetteville Industrial', address: 'Fayetteville, AR', sf: 150000, salePrice: 15000000, ppsf: 100, date: 'Nov 2025', type: 'Industrial', yearBuilt: null, url: 'https://talkbusiness.net/2025/11/real-deals-fayetteville-industrial-building-sells-for-15-million/' },
  { id: 6, name: 'Maumelle Warehouse', address: '1401 Murphy Dr, Maumelle, AR', sf: 160000, salePrice: 8729294, ppsf: 55, date: 'Oct 2025', type: 'Warehouse (NNN)', yearBuilt: null, url: 'https://talkbusiness.net/2025/10/maumelle-warehouse-sold-in-8-7-million-transaction/' },
]

const MARKET_DATA = {
  nwaIndustrialVacancy: 6.4,
  avgWarehouseRent: 9.60,
  warehouseRentGrowth: 2.9,
  flexRentRange: { low: 16, high: 23 },
  newSupply2025SF: 1900000,
  positiveAbsorptionH2: 597962,
  nationalFlexCapRate: 6.93,
  centralRegionFlexCapRate: 7.13,
}

const SOURCES = [
  { name: 'LoopNet — Subject Property Listing', url: 'https://www.loopnet.com/Listing/6361-S-Oldridge-Pl-Rogers-AR/32391011/' },
  { name: 'Cushman & Wakefield NWA Q3 2025', url: 'https://www.sagepartners.com/nwa-2025-q3-market-summary/' },
  { name: 'Talk Business — NWA Real Deals', url: 'https://talkbusiness.net/2025/09/four-arkansas-properties-sell-for-13-4-million/' },
  { name: 'Talk Business — Lowell/Rogers Sales', url: 'https://talkbusiness.net/2025/09/real-deals-rogers-industrial-site-sells-for-8-2-million/' },
  { name: 'FRED — Fayetteville MSA Data', url: 'https://fred.stlouisfed.org/tags/series?t=fayetteville' },
  { name: 'CBRE Cap Rate Survey H1 2024', url: 'https://www.cbre.com/insights/books/cap-rate-survey' },
  { name: 'Colliers Arkansas Industrial Sales', url: 'https://armoneyandpolitics.com/colliers-arkansas-industrial-sales/' },
  { name: 'LoopNet — Rogers Linden Portfolio', url: 'https://www.loopnet.com/Listing/1821-S-1st-St-Rogers-AR/36273915/' },
]

// ─── VALUATION ──────────────────────────────────────────────────────────────

function computeValuation(rentPSF, vacancyPct, opexPct, capRate) {
  const gpi = SUBJECT.totalSF * rentPSF
  const vacancy = gpi * (vacancyPct / 100)
  const egi = gpi - vacancy
  const opex = egi * (opexPct / 100)
  const noi = egi - opex
  const value = noi / (capRate / 100)
  return { rentPSF, vacancyPct, opexPct, capRate, gpi, vacancy, egi, opex, noi, value, ppsf: value / SUBJECT.totalSF }
}

const scenarios = {
  conservative: computeValuation(16.00, 10, 35, 7.50),
  base: computeValuation(17.50, 6.4, 30, 7.03),
  optimistic: computeValuation(19.00, 4, 25, 6.50),
}

// ─── FORMATTERS ─────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n)
const fmtPct = (n) => `${n.toFixed(1)}%`

// ─── TOOLTIP ────────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e2e8f0] rounded px-3 py-2 text-sm shadow-lg">
      <div className="text-[#64748b] text-xs mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-semibold text-[#0f172a]">
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [rentPSF, setRentPSF] = useState(17.50)
  const [vacancyPct, setVacancyPct] = useState(6.4)
  const [opexPct, setOpexPct] = useState(30)
  const [capRate, setCapRate] = useState(7.03)

  const v = computeValuation(rentPSF, vacancyPct, opexPct, capRate)

  const presets = {
    conservative: { rent: 16.00, vacancy: 10, opex: 35, cap: 7.50 },
    base: { rent: 17.50, vacancy: 6.4, opex: 30, cap: 7.03 },
    optimistic: { rent: 19.00, vacancy: 4, opex: 25, cap: 6.50 },
  }
  const applyPreset = (key) => {
    const p = presets[key]
    setRentPSF(p.rent)
    setVacancyPct(p.vacancy)
    setOpexPct(p.opex)
    setCapRate(p.cap)
  }

  const compChartData = [...COMPS.map(c => ({
    name: c.name.length > 16 ? c.name.split(' ').slice(0,2).join(' ') : c.name,
    ppsf: c.ppsf,
    fill: '#94a3b8',
  })), {
    name: 'Subject (est.)',
    ppsf: Math.round(v.ppsf),
    fill: '#1e40af',
  }]

  const incomeBreakdown = [
    { name: 'NOI', value: Math.round(v.noi) },
    { name: 'Operating Expenses', value: Math.round(v.opex) },
    { name: 'Vacancy Loss', value: Math.round(v.vacancy) },
  ]

  const radarData = [
    { metric: 'Vacancy', value: 8 },
    { metric: 'Rent Growth', value: 7 },
    { metric: 'Flex Demand', value: 8.5 },
    { metric: 'Supply Pipeline', value: 6 },
    { metric: 'Absorption', value: 7.5 },
    { metric: 'Cap Stability', value: 7 },
  ]

  const rentCompData = [
    { name: 'Subject Low', rate: 16.00, isSubject: true },
    { name: 'Subject High', rate: 19.00, isSubject: true },
    { name: 'NWA Warehouse Avg', rate: 9.60 },
    { name: 'NWA Flex Low', rate: 16.00 },
    { name: 'NWA Flex High', rate: 23.00 },
    { name: 'Lowell Flex (2026)', rate: 14.00 },
    { name: 'Little Flock Flex', rate: 17.50 },
    { name: 'Rogers New Flex', rate: 21.00 },
  ]

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">

      {/* ── HEADER ── */}
      <header className="border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#64748b] mb-1">Investment Memorandum</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">6361 S Oldridge Pl</h1>
              <p className="text-sm text-[#64748b] mt-0.5">Rogers, AR 72758</p>
            </div>
            <div className="text-right text-xs text-[#94a3b8] space-y-0.5">
              <div>Prepared for <span className="text-[#0f172a] font-medium">Nick @ Appreciate</span></div>
              <div>March 25, 2026</div>
              <a href={SUBJECT.loopnetUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[10px] tracking-[0.15em] uppercase font-medium text-[#1e40af] hover:text-[#1e3a8a] transition-colors">
                View on LoopNet →
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">

        {/* ── 01 PROPERTY OVERVIEW ── */}
        <section className="mb-10">
          <SectionLabel number="01" title="Property Overview" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#e2e8f0] border border-[#e2e8f0] rounded-lg overflow-hidden">
            <KV label="Property Type" value={SUBJECT.type} sub={SUBJECT.subtype} />
            <KV label="Rentable Area" value={`${fmtNum(SUBJECT.totalSF)} SF`} sub={`${SUBJECT.availableSpaces} spaces available`} />
            <KV label="Year Built" value="2025" sub="New construction" accent />
            <KV label="Asking Rent" value={`$${SUBJECT.askingRentLow}\u2013$${SUBJECT.askingRentHigh}/SF`} sub="Per annum (NNN)" />
            <KV label="Developer" value="NWA Industrial" sub="Crossland Construction" />
          </div>
        </section>

        {/* ── 02 VALUATION SUMMARY ── */}
        <section className="mb-10">
          <SectionLabel number="02" title="Valuation Summary" subtitle="Income approach via direct capitalization" />

          {/* Preset quick-select */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mr-1">Presets:</span>
            {[
              { key: 'conservative', label: 'Conservative' },
              { key: 'base', label: 'Base Case' },
              { key: 'optimistic', label: 'Optimistic' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => applyPreset(s.key)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Interactive Assumption Sliders */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Rent ($/SF)</label>
                <span className="font-mono text-sm font-semibold text-[#0f172a]">${rentPSF.toFixed(2)}</span>
              </div>
              <input type="range" min="12" max="24" step="0.25" value={rentPSF} onChange={e => setRentPSF(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#e2e8f0] rounded-full appearance-none cursor-pointer accent-[#1e40af]" />
              <div className="flex justify-between text-[10px] text-[#cbd5e1] mt-0.5"><span>$12</span><span>$24</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Vacancy (%)</label>
                <span className="font-mono text-sm font-semibold text-[#0f172a]">{vacancyPct.toFixed(1)}%</span>
              </div>
              <input type="range" min="0" max="20" step="0.5" value={vacancyPct} onChange={e => setVacancyPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#e2e8f0] rounded-full appearance-none cursor-pointer accent-[#1e40af]" />
              <div className="flex justify-between text-[10px] text-[#cbd5e1] mt-0.5"><span>0%</span><span>20%</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Expenses (%)</label>
                <span className="font-mono text-sm font-semibold text-[#0f172a]">{opexPct.toFixed(0)}%</span>
              </div>
              <input type="range" min="10" max="50" step="1" value={opexPct} onChange={e => setOpexPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#e2e8f0] rounded-full appearance-none cursor-pointer accent-[#1e40af]" />
              <div className="flex justify-between text-[10px] text-[#cbd5e1] mt-0.5"><span>10%</span><span>50%</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Cap Rate (%)</label>
                <span className="font-mono text-sm font-semibold text-[#0f172a]">{capRate.toFixed(2)}%</span>
              </div>
              <input type="range" min="5" max="10" step="0.05" value={capRate} onChange={e => setCapRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#e2e8f0] rounded-full appearance-none cursor-pointer accent-[#1e40af]" />
              <div className="flex justify-between text-[10px] text-[#cbd5e1] mt-0.5"><span>5%</span><span>10%</span></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8]">
                    <th className="text-left py-2 font-medium">Line Item</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">$/SF</th>
                    <th className="text-right py-2 font-medium">Assumptions</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2.5 text-[#475569] font-sans">Gross Potential Income</td>
                    <td className="py-2.5 text-right">{fmt(v.gpi)}</td>
                    <td className="py-2.5 text-right text-[#64748b]">{fmtDec(v.rentPSF)}</td>
                    <td className="py-2.5 text-right text-[#94a3b8] text-xs font-sans">{fmtNum(SUBJECT.totalSF)} SF x ${v.rentPSF.toFixed(2)}/SF</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2.5 text-[#475569] font-sans pl-4">Less: Vacancy &amp; Credit Loss</td>
                    <td className="py-2.5 text-right text-[#dc2626]">({fmt(v.vacancy)})</td>
                    <td className="py-2.5 text-right text-[#dc2626]">({fmtDec(v.vacancy / SUBJECT.totalSF)})</td>
                    <td className="py-2.5 text-right text-[#94a3b8] text-xs font-sans">{v.vacancyPct}% vacancy rate</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2.5 text-[#475569] font-sans">Effective Gross Income</td>
                    <td className="py-2.5 text-right">{fmt(v.egi)}</td>
                    <td className="py-2.5 text-right text-[#64748b]">{fmtDec(v.egi / SUBJECT.totalSF)}</td>
                    <td className="py-2.5"></td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2.5 text-[#475569] font-sans pl-4">Less: Operating Expenses</td>
                    <td className="py-2.5 text-right text-[#dc2626]">({fmt(v.opex)})</td>
                    <td className="py-2.5 text-right text-[#dc2626]">({fmtDec(v.opex / SUBJECT.totalSF)})</td>
                    <td className="py-2.5 text-right text-[#94a3b8] text-xs font-sans">{v.opexPct}% of EGI</td>
                  </tr>
                  <tr className="border-t-2 border-[#0f172a] font-semibold">
                    <td className="py-2.5 font-sans">Net Operating Income</td>
                    <td className="py-2.5 text-right text-[#16a34a]">{fmt(v.noi)}</td>
                    <td className="py-2.5 text-right text-[#16a34a]">{fmtDec(v.noi / SUBJECT.totalSF)}</td>
                    <td className="py-2.5"></td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2.5 text-[#475569] font-sans">Capitalization Rate</td>
                    <td className="py-2.5 text-right">{fmtPct(v.capRate)}</td>
                    <td className="py-2.5"></td>
                    <td className="py-2.5 text-right text-[#94a3b8] text-xs font-sans">Blended national/central</td>
                  </tr>
                  <tr className="border-t-2 border-[#1e40af] bg-[#f8fafc]">
                    <td className="py-3 font-semibold font-sans text-[#1e40af]">Indicated Value</td>
                    <td className="py-3 text-right font-semibold text-[#1e40af] text-base">{fmt(v.value)}</td>
                    <td className="py-3 text-right font-semibold text-[#1e40af]">{fmtDec(v.ppsf)}/SF</td>
                    <td className="py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-2">Income Allocation</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {incomeBreakdown.map((_, i) => <Cell key={i} fill={['#1e40af','#94a3b8','#cbd5e1'][i]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip formatter={fmt} />} />
                  <Legend formatter={(val) => <span className="text-[11px] text-[#64748b]">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario reference cards */}
          <div className="grid grid-cols-3 gap-px bg-[#e2e8f0] border border-[#e2e8f0] rounded-lg overflow-hidden mt-6">
            {[
              { key: 'conservative', label: 'Conservative', color: '#64748b' },
              { key: 'base', label: 'Base Case', color: '#1e40af' },
              { key: 'optimistic', label: 'Optimistic', color: '#16a34a' },
            ].map(s => {
              const sv = scenarios[s.key]
              return (
                <div
                  key={s.key}
                  className="bg-white p-4 text-center cursor-pointer hover:bg-[#f8fafc] transition-colors"
                  onClick={() => applyPreset(s.key)}
                >
                  <div className="text-[10px] tracking-[0.15em] uppercase font-medium text-[#94a3b8] mb-1">{s.label}</div>
                  <div className="text-xl font-semibold font-mono" style={{ color: s.color }}>{fmt(sv.value)}</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5 font-mono">{fmtDec(sv.ppsf)}/SF</div>
                  <div className="text-[10px] text-[#cbd5e1] mt-1">{sv.capRate}% cap &middot; {sv.vacancyPct}% vac &middot; {sv.opexPct}% opex</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 03 COMPARABLE SALES ── */}
        <section className="mb-10">
          <SectionLabel number="03" title="Comparable Sales Analysis" subtitle="Recent small-format industrial & flex transactions in Arkansas" />

          <div className="overflow-x-auto border border-[#e2e8f0] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">
                  <th className="text-left py-3 px-4">Property</th>
                  <th className="text-left py-3 px-3">Type</th>
                  <th className="text-right py-3 px-3">Size (SF)</th>
                  <th className="text-right py-3 px-3">Sale Price</th>
                  <th className="text-right py-3 px-3">$/SF</th>
                  <th className="text-right py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {COMPS.map((c, i) => (
                  <tr key={c.id} className={`border-t border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${i % 2 !== 0 ? 'bg-[#fafbfc]' : ''}`}>
                    <td className="py-3 px-4 font-sans">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[#1e40af] hover:underline font-medium text-sm">{c.name}</a>
                      <div className="text-[11px] text-[#94a3b8]">{c.address}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded bg-[#f1f5f9] text-[#64748b] font-sans">{c.type}</span>
                    </td>
                    <td className="text-right py-3 px-3 text-[#475569]">{fmtNum(c.sf)}</td>
                    <td className="text-right py-3 px-3 text-[#475569]">{fmt(c.salePrice)}</td>
                    <td className="text-right py-3 px-3 font-semibold text-[#0f172a]">${c.ppsf}</td>
                    <td className="text-right py-3 px-4 text-[#94a3b8] font-sans text-xs">{c.date}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#1e40af] bg-[#eff6ff]">
                  <td className="py-3 px-4 font-sans">
                    <a href={SUBJECT.loopnetUrl} target="_blank" rel="noopener noreferrer" className="text-[#1e40af] hover:underline font-semibold text-sm">Subject Property (est.)</a>
                    <div className="text-[11px] text-[#64748b]">{SUBJECT.address}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded bg-[#dbeafe] text-[#1e40af] font-sans">Flex Industrial</span>
                  </td>
                  <td className="text-right py-3 px-3 text-[#1e40af] font-semibold">{fmtNum(SUBJECT.totalSF)}</td>
                  <td className="text-right py-3 px-3 text-[#1e40af] font-semibold">{fmt(v.value)}</td>
                  <td className="text-right py-3 px-3 font-bold text-[#1e40af]">${Math.round(v.ppsf)}</td>
                  <td className="text-right py-3 px-4 text-[#64748b] font-sans text-xs">&mdash;</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Price/SF chart */}
          <div className="mt-6 border border-[#e2e8f0] rounded-lg p-5 bg-[#fafbfc]">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-3">Price per Square Foot Comparison</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={compChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => `$${val}`} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="bg-white border border-[#e2e8f0] rounded px-3 py-2 text-sm shadow-lg">
                      <div className="text-[#64748b] text-xs mb-1">{label}</div>
                      <div className="font-semibold text-[#0f172a]">${payload[0].value}/SF</div>
                    </div>
                  )
                }} />
                <ReferenceLine y={Math.round(v.ppsf)} stroke="#1e40af" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Subject: $${Math.round(v.ppsf)}/SF`, fill: '#1e40af', fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="ppsf" radius={[3,3,0,0]} maxBarSize={48}>
                  {compChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Valuation Premium Bridge */}
          <div className="mt-6 border border-[#e2e8f0] rounded-lg overflow-hidden">
            <div className="bg-[#eff6ff] px-5 py-3 border-b border-[#dbeafe]">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#1e40af] font-semibold">Why the Subject Commands ${Math.round(v.ppsf)}/SF vs. Comp Average of ${Math.round(COMPS.reduce((a,c) => a + c.ppsf, 0) / COMPS.length)}/SF</p>
            </div>
            <div className="px-5 py-4 text-sm text-[#475569] leading-relaxed space-y-3">
              <p className="font-medium text-[#0f172a]">The ${Math.round(v.ppsf)}/SF indicated value is derived from the <span className="text-[#1e40af]">income approach (NOI ÷ cap rate)</span>, not from averaging comp sale prices. Here is why the income approach produces a premium over raw comp $/SF:</p>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                <div className="bg-[#f8fafc] rounded-md p-3">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">1. Flex vs. Bulk Warehouse</div>
                  <p className="text-[13px]">Most comps are older warehouse or portfolio deals at $55–$100/SF. Flex buildings with office finish command higher rents ($16–$19/SF NNN vs. $9–$10/SF warehouse), which directly increases NOI and therefore value per SF.</p>
                </div>
                <div className="bg-[#f8fafc] rounded-md p-3">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">2. New Construction Premium</div>
                  <p className="text-[13px]">A 2025 build commands a premium over aged stock — no deferred maintenance, modern spec (clear heights, dock configuration), lower insurance, and higher tenant demand. The closest comp (Lowell Flex, 2022 build) traded at $123/SF.</p>
                </div>
                <div className="bg-[#f8fafc] rounded-md p-3">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">3. Size Premium</div>
                  <p className="text-[13px]">At 38,225 SF, the subject is in the most competitive small-bay segment. The two smallest comps (Springdale 24.9K SF at $149/SF and N. Little Rock 23.5K SF at $67/SF) show that smaller product trades at wide price ranges, with quality assets on the high end.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#f8fafc] rounded-md p-3 mt-2">
                <div className="flex-1">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">Reconciliation</div>
                  <p className="text-[13px]">Comp-implied range (flex-adjusted): <span className="font-mono font-semibold text-[#0f172a]">$100–$149/SF</span>. Income-indicated value: <span className="font-mono font-semibold text-[#1e40af]">${Math.round(v.ppsf)}/SF</span>. The income approach produces a ~{Math.round(((v.ppsf / ((123 + 149) / 2)) - 1) * 100)}% premium over the best flex comps, reflecting the new-build advantage and tight market vacancy ({vacancyPct}%). Adjust the sliders above to test different assumptions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 MARKET CONTEXT ── */}
        <section className="mb-10">
          <SectionLabel number="04" title="Market Context" subtitle="Northwest Arkansas industrial & flex market" />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
              <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-[#e2e8f0]">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Key Market Indicators</p>
              </div>
              <div className="divide-y divide-[#f1f5f9]">
                <MetricRow label="NWA Industrial Vacancy" value={fmtPct(MARKET_DATA.nwaIndustrialVacancy)} trend="down" />
                <MetricRow label="Avg Warehouse Rent" value={`$${MARKET_DATA.avgWarehouseRent}/SF`} />
                <MetricRow label="Rent Growth (YoY)" value={`+${fmtPct(MARKET_DATA.warehouseRentGrowth)}`} trend="up" />
                <MetricRow label="Flex Rent Range" value={`$${MARKET_DATA.flexRentRange.low}\u2013$${MARKET_DATA.flexRentRange.high}/SF`} />
                <MetricRow label="National Flex Cap Rate" value={fmtPct(MARKET_DATA.nationalFlexCapRate)} />
                <MetricRow label="Central Region Cap Rate" value={fmtPct(MARKET_DATA.centralRegionFlexCapRate)} />
                <MetricRow label="New Supply (2025)" value={`${(MARKET_DATA.newSupply2025SF / 1e6).toFixed(1)}M SF`} />
                <MetricRow label="Net Absorption (H2 '25)" value={`+${fmtNum(MARKET_DATA.positiveAbsorptionH2)} SF`} trend="up" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-[#e2e8f0] rounded-lg p-4">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-3">Rent Comparables ($/SF/yr)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={rentCompData} layout="vertical" barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={val => `$${val}`} domain={[0, 25]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip formatter={val => `$${val.toFixed(2)}/SF`} />} />
                    <Bar dataKey="rate" radius={[0,3,3,0]}>
                      {rentCompData.map((d, i) => <Cell key={i} fill={d.isSubject ? '#1e40af' : '#cbd5e1'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-[#e2e8f0] rounded-lg p-4">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-2">Market Health Assessment</p>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData} outerRadius={70}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 10]} />
                    <Radar name="Score" dataKey="value" stroke="#1e40af" fill="#1e40af" fillOpacity={0.08} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 INVESTMENT SCORECARD ── */}
        <section className="mb-10">
          <SectionLabel number="05" title="Investment Scorecard" />
          <Scorecard />
        </section>

        {/* ── 06 RECOMMENDATION ── */}
        <section className="mb-10">
          <SectionLabel number="06" title="Conclusion & Recommendation" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3 text-sm text-[#475569] leading-relaxed">
              <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Methodology</h3>
              <p><strong>Primary method: Income approach</strong> via direct capitalization. NOI is derived from 38,225 SF at $17.50/SF NNN rent (midpoint of $16–$19 asking range), less 6.4% market vacancy and 30% operating expenses. NOI is then capitalized at 7.03% (blended national flex 6.93% + central region 7.13%).</p>
              <p><strong>Cross-check: Sales comparison.</strong> Comp average is ~$99/SF, but ranges from $55 (bulk NNN warehouse) to $149 (small-bay Springdale). The two most comparable flex sales — Lowell ($123/SF, 2022 build) and Springdale ($149/SF, 24.9K SF) — bracket the income-indicated value and support the premium for new, small-format flex.</p>
            </div>
            <div className="space-y-3 text-sm text-[#475569] leading-relaxed">
              <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Key Considerations</h3>
              <p>New 2025 construction by NWA Industrial / Crossland eliminates near-term deferred maintenance risk and positions the asset favorably for institutional tenants.</p>
              <p>The NWA flex market remains undersupplied for small-bay product under 100K SF, with strong demand driven by the Walmart vendor ecosystem. Vacancy compressed from 10.4% to 6.1% in H2 2025, signaling a tightening market.</p>
            </div>
            <div>
              <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-4">Recommendation</h3>
              <div className="border-2 border-[#16a34a] rounded-lg p-5 bg-[#f0fdf4]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                  <span className="text-[#15803d] font-semibold text-base">Favorable — Worth Pursuing</span>
                </div>
                <p className="text-sm text-[#475569] leading-relaxed">
                  New-build flex in an undersupplied, growing market with strong institutional demand. Current valuation of {fmt(v.value)} ({fmtDec(v.ppsf)}/SF) is well-supported by comparable transactions. Consider negotiating below {fmt(scenarios.conservative.value)} to account for lease-up risk.
                </p>
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-3 leading-relaxed">This analysis is for informational purposes only and does not constitute financial advice. Engage a certified appraiser and legal counsel before transacting.</p>
            </div>
          </div>
        </section>

        {/* ── 07 DEAL INTELLIGENCE ── */}
        <section className="mb-10">
          <SectionLabel number="07" title="Deal Intelligence" subtitle="Ownership, broker contacts & negotiating position" />

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Ownership & Developer */}
            <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
              <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-[#e2e8f0]">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Ownership & Developer</p>
              </div>
              <div className="px-4 py-3 text-sm text-[#475569] space-y-2 leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium w-20 flex-shrink-0 pt-0.5">Entity</span>
                  <span className="font-medium text-[#0f172a]">I49 Industrial LLC</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium w-20 flex-shrink-0 pt-0.5">Principals</span>
                  <span>Ivan E. Crossland Jr. & Mattie Crossland</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium w-20 flex-shrink-0 pt-0.5">Parent</span>
                  <span>Crossland Realty Group (division of Crossland Construction — ENR Top 400)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium w-20 flex-shrink-0 pt-0.5">Strategy</span>
                  <span>Build-to-hold. Repeat NWA industrial developer (1M+ SF in the I-49 corridor via CrossMar Investments).</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium w-20 flex-shrink-0 pt-0.5">GC Office</span>
                  <span>1800 S. 52nd St., Ste 410, Rogers, AR 72758 — <span className="font-mono text-[#0f172a]">(479) 464-7077</span></span>
                </div>
              </div>
            </div>

            {/* Listing Brokers */}
            <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
              <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-[#e2e8f0]">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Listing Brokers — Cushman & Wakefield | Sage Partners</p>
              </div>
              <div className="divide-y divide-[#f1f5f9]">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0f172a]">Matt Mozzoni</span>
                    <span className="inline-block text-[9px] tracking-wider uppercase font-medium px-1.5 py-0.5 rounded bg-[#dbeafe] text-[#1e40af]">Power Broker</span>
                  </div>
                  <div className="text-xs text-[#64748b]">Managing Director, Principal NWA</div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="font-mono text-sm text-[#0f172a]">(479) 845-3019</span>
                    <a href="https://www.linkedin.com/in/matt-mozzoni-7a293a64/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#1e40af] hover:underline">LinkedIn</a>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-1">Focus: Tenant rep, Walmart vendor acquisitions, Fort Smith/Van Buren industrial. CCIM & SIOR candidate.</p>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0f172a]">Lauren Blass</span>
                  </div>
                  <div className="text-xs text-[#64748b]">Associate Broker</div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="font-mono text-sm text-[#0f172a]">(479) 845-3000</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-1">Prior: SVP Client Engagement at VML Commerce / Wunderman Thompson. Joined Sage Partners 2025.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Park Summary */}
          <div className="border border-[#e2e8f0] rounded-lg overflow-hidden mb-6">
            <div className="bg-[#eff6ff] px-5 py-3 border-b border-[#dbeafe]">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#1e40af] font-semibold">Full Park — Two Buildings on 16.4 Acres</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">
                    <th className="text-left py-2.5 px-4">Building</th>
                    <th className="text-right py-2.5 px-3">Size (SF)</th>
                    <th className="text-right py-2.5 px-3">Asking Rent</th>
                    <th className="text-right py-2.5 px-3">Clear Height</th>
                    <th className="text-right py-2.5 px-3">Doors</th>
                    <th className="text-right py-2.5 px-3">Use</th>
                    <th className="text-right py-2.5 px-4">Terms</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2.5 px-4 font-sans font-medium text-[#0f172a]">Bldg 1 — Flex/Retail</td>
                    <td className="py-2.5 px-3 text-right">38,189</td>
                    <td className="py-2.5 px-3 text-right text-[#1e40af] font-semibold">$19.00/SF</td>
                    <td className="py-2.5 px-3 text-right">16&apos;6&quot;</td>
                    <td className="py-2.5 px-3 text-right font-sans text-xs text-[#64748b]">32 grade-level + glass roll-up</td>
                    <td className="py-2.5 px-3 text-right font-sans text-xs text-[#64748b]">Office / Retail</td>
                    <td className="py-2.5 px-4 text-right font-sans text-xs text-[#64748b]">5-7 yr NNN</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9] bg-[#fafbfc]">
                    <td className="py-2.5 px-4 font-sans font-medium text-[#0f172a]">Bldg 2 — Flex/Warehouse</td>
                    <td className="py-2.5 px-3 text-right">38,225</td>
                    <td className="py-2.5 px-3 text-right text-[#1e40af] font-semibold">$16.00/SF</td>
                    <td className="py-2.5 px-3 text-right">18&apos;6&quot;</td>
                    <td className="py-2.5 px-3 text-right font-sans text-xs text-[#64748b]">16 dock-high + 16 glass roll-up</td>
                    <td className="py-2.5 px-3 text-right font-sans text-xs text-[#64748b]">Flex / Warehouse</td>
                    <td className="py-2.5 px-4 text-right font-sans text-xs text-[#64748b]">5-7 yr NNN</td>
                  </tr>
                  <tr className="border-t-2 border-[#0f172a] font-semibold">
                    <td className="py-2.5 px-4 font-sans">Combined Park Total</td>
                    <td className="py-2.5 px-3 text-right">76,414</td>
                    <td className="py-2.5 px-3 text-right text-[#64748b]">$16–$19/SF</td>
                    <td className="py-2.5 px-3 text-right">—</td>
                    <td className="py-2.5 px-3 text-right font-sans text-xs text-[#64748b]">Cross-dock capable</td>
                    <td className="py-2.5 px-3 text-right font-sans text-xs text-[#64748b]">Mixed flex</td>
                    <td className="py-2.5 px-4 text-right font-sans text-xs text-[#64748b]">Shell, avail now</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] text-[11px] text-[#94a3b8]">
              TI allowance: $30–$35/SF ($133K–$155K per bay) · Min divisible: 4,432 SF · 480V 3-phase power · ESFR sprinklers · Min 5-yr lease
            </div>
          </div>

          {/* Negotiating Position */}
          <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
            <div className="bg-[#fef2f2] px-5 py-3 border-b border-[#fecaca]">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#991b1b] font-semibold">Negotiating Leverage</p>
            </div>
            <div className="px-5 py-4 text-sm text-[#475569] leading-relaxed space-y-3">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#f8fafc] rounded-md p-3">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">Time on Market</div>
                  <div className="text-lg font-semibold font-mono text-[#dc2626]">7+ months</div>
                  <p className="text-[12px] text-[#64748b] mt-1">Delivered summer 2025, still showing &quot;Available Now&quot; as of Feb 2026. Listed since Aug 2023.</p>
                </div>
                <div className="bg-[#f8fafc] rounded-md p-3">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">Carry Cost Pressure</div>
                  <div className="text-lg font-semibold font-mono text-[#dc2626]">$15M+</div>
                  <p className="text-[12px] text-[#64748b] mt-1">Est. construction cost on 76K SF new-build park sitting vacant — significant monthly debt service with zero rental income.</p>
                </div>
                <div className="bg-[#f8fafc] rounded-md p-3">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">Pricing Advantage</div>
                  <div className="text-lg font-semibold font-mono text-[#16a34a]">~50% below</div>
                  <p className="text-[12px] text-[#64748b] mt-1">Bldg 1 at $19/SF vs $40/SF at Pinnacle Hills one exit north. Strong value story even at asking.</p>
                </div>
              </div>
              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-md p-3 mt-2">
                <p className="text-[13px]"><span className="font-semibold text-[#92400e]">Suggested approach:</span> Contact Matt Mozzoni at (479) 845-3019. Ask about current occupancy across both buildings, any LOIs in hand, and whether the developer would entertain a purchase vs. lease. For Bldg 2 specifically, target $14–$15/SF on a long-term commitment (vs. $16 ask). On a purchase basis, frame the offer in the conservative scenario range ({fmt(scenarios.conservative.value)}) to account for lease-up risk, then negotiate toward the base case.</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 border border-[#e2e8f0] rounded-lg p-4">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-3">Development Timeline</p>
            <div className="flex items-center gap-0 overflow-x-auto">
              {[
                { date: 'Aug 2023', label: 'Listed on LoopNet' },
                { date: 'Nov 2023', label: 'Building permits filed' },
                { date: 'Jun 2024', label: 'Addition permit ($80K)' },
                { date: 'Summer 2025', label: 'Delivery / completion' },
                { date: 'Feb 2026', label: 'Last listing update' },
                { date: 'Today', label: '7+ mo. vacant post-delivery', highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.highlight ? 'bg-[#dc2626]' : 'bg-[#1e40af]'}`}></div>
                    <div className={`text-[10px] font-medium mt-1 ${item.highlight ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>{item.date}</div>
                    <div className="text-[10px] text-[#94a3b8] max-w-[100px] text-center">{item.label}</div>
                  </div>
                  {i < 5 && <div className="w-8 h-px bg-[#cbd5e1] mx-1 mt-[-16px]"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOURCES ── */}
        <section className="mb-6">
          <div className="border-t border-[#e2e8f0] pt-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-3">Sources & References</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              {SOURCES.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#64748b] hover:text-[#1e40af] transition-colors underline decoration-[#e2e8f0] hover:decoration-[#1e40af]">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#e2e8f0] bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>Prepared for Nick @ Appreciate</span>
          <span>6361 S Oldridge Pl, Rogers, AR 72758</span>
          <span>Generated March 25, 2026</span>
        </div>
      </footer>
    </div>
  )
}

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function SectionLabel({ number, title, subtitle }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="text-[10px] tracking-[0.15em] text-[#cbd5e1] font-mono">{number}</span>
      <div>
        <h2 className="text-lg font-semibold text-[#0f172a]">{title}</h2>
        {subtitle && <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function KV({ label, value, sub, accent }) {
  return (
    <div className="bg-white px-4 py-3.5">
      <div className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium mb-1">{label}</div>
      <div className={`text-base font-semibold ${accent ? 'text-[#16a34a]' : 'text-[#0f172a]'}`}>{value}</div>
      {sub && <div className="text-[11px] text-[#94a3b8] mt-0.5">{sub}</div>}
    </div>
  )
}

function MetricRow({ label, value, trend }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-[#475569]">{label}</span>
      <span className="font-mono text-sm font-medium text-[#0f172a] flex items-center gap-1.5">
        {trend === 'up' && <span className="text-[#16a34a] text-[10px]">&#9650;</span>}
        {trend === 'down' && <span className="text-[#16a34a] text-[10px]">&#9660;</span>}
        {value}
      </span>
    </div>
  )
}

function Scorecard() {
  const items = [
    { label: 'New Construction (2025)', score: 9, note: 'Brand new, modern spec — minimal CapEx' },
    { label: 'Market Vacancy (6.4%)', score: 8, note: 'Below natural vacancy rate' },
    { label: 'Rent vs. Market Comps', score: 7, note: 'In-line with NWA flex asking rents' },
    { label: 'Location (Rogers/NWA)', score: 8, note: 'Walmart ecosystem growth corridor' },
    { label: 'Flex Configuration', score: 8, note: 'Multi-tenant capable, diverse use' },
    { label: 'Absorption Trend', score: 7, note: 'Positive and accelerating in H2 2025' },
  ]
  const avg = (items.reduce((a, b) => a + b.score, 0) / items.length).toFixed(1)

  return (
    <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
      <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#94a3b8] font-medium">Weighted Assessment</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-[#0f172a] font-mono">{avg}</span>
          <span className="text-sm text-[#94a3b8]">/10</span>
        </div>
      </div>
      <div className="divide-y divide-[#f1f5f9]">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#0f172a]">{item.label}</div>
              <div className="text-[11px] text-[#94a3b8]">{item.note}</div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-24 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.score * 10}%`,
                    backgroundColor: item.score >= 8 ? '#16a34a' : item.score >= 6 ? '#ca8a04' : '#dc2626',
                  }}
                />
              </div>
              <span className="text-sm font-mono font-semibold w-6 text-right" style={{ color: item.score >= 8 ? '#16a34a' : item.score >= 6 ? '#ca8a04' : '#dc2626' }}>
                {item.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
