'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts'

const SUBJECT = {
  address: '6361 S Oldridge Pl, Rogers, AR 72758',
  type: 'Industrial / Flex',
  yearBuilt: 2025, totalSF: 38225, availableSpaces: 2,
  smallestUnit: 4432, largestUnit: 38225,
  askingRentLow: 16.00, askingRentHigh: 19.00,
  developer: 'NWA Industrial (Crossland Construction)',
  permitValuation: 236730, lotSizeAcres: null,
  nearbyLotSale: { address: '6388 S Oldridge Pl', acres: 16.38, price: 3350000, date: 'Jun 2022' },
}

const COMPS = [
  { id: 1, name: 'Bentonville Industrial', address: 'Hwy 12, Bentonville', sf: 284896, salePrice: 31480000, ppsf: 110, date: 'Aug 2025', type: 'Industrial' },
  { id: 2, name: 'Bentonville Mixed-Use', address: 'S Main & SW 8th', sf: 8706, salePrice: 3500000, ppsf: 402, date: 'Nov 2025', type: 'Mixed-Use' },
  { id: 3, name: 'Beau Terre Office Park', address: 'Beau Terre, Bentonville', sf: 381197, salePrice: 44600000, ppsf: 117, date: 'Oct 2024', type: 'Office' },
  { id: 4, name: 'Rogers/Bentonville Portfolio', address: 'Pinnacle Hills & S Walton', sf: 405000, salePrice: 68000000, ppsf: 168, date: 'Feb 2026', type: 'Office Portfolio' },
  { id: 5, name: 'Fayetteville Industrial', address: 'Fayetteville, AR', sf: 150000, salePrice: 15000000, ppsf: 100, date: 'Nov 2025', type: 'Industrial' },
]

const MARKET_DATA = {
  nwaIndustrialVacancy: 6.4, nwaWarehouseVacancyH2: 6.1,
  avgWarehouseRent: 9.60, warehouseRentGrowth: 2.9,
  flexRentRange: { low: 16, high: 23 },
  newSupply2025SF: 1900000, positiveAbsorptionQ1: 87824, positiveAbsorptionH2: 597962,
  nationalFlexCapRate: 6.93, centralRegionFlexCapRate: 7.13,
}

function computeValuation(rentPSF, vacancyPct, opexPct, capRate) {
  const gpi = SUBJECT.totalSF * rentPSF
  const vacancy = gpi * (vacancyPct / 100)
  const egi = gpi - vacancy
  const opex = egi * (opexPct / 100)
  const noi = egi - opex
  const value = noi / (capRate / 100)
  return { gpi, vacancy, egi, opex, noi, value, ppsf: value / SUBJECT.totalSF }
}

const scenarios = {
  conservative: computeValuation(16.00, 10, 35, 7.50),
  base: computeValuation(17.50, 6.4, 30, 7.03),
  optimistic: computeValuation(19.00, 4, 25, 6.50),
}

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n)
const fmtPct = (n) => n.toFixed(1) + '%'

function Card({ children, className = '' }) {
  return <div className={`bg-[#111827] border border-[#1e293b] rounded-2xl p-6 ${className}`}>{children}</div>
}
function Metric({ label, value, sub, color = '#f1f5f9' }) {
  return (<div><div className="text-xs uppercase tracking-wider text-[#64748b] mb-1">{label}</div><div className="text-2xl font-bold" style={{ color }}>{value}</div>{sub && <div className="text-xs text-[#94a3b8] mt-0.5">{sub}</div>}</div>)
}
function Badge({ children, color = '#3b82f6' }) {
  return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: color + '20', color }}>{children}</span>
}
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState('base')
  const v = scenarios[activeScenario]
  const compChartData = COMPS.map(c => ({ name: c.name.split(' ').slice(0,2).join(' '), ppsf: c.ppsf, sf: c.sf / 1000 }))
  compChartData.push({ name: 'Subject (est.)', ppsf: Math.round(scenarios.base.ppsf), sf: SUBJECT.totalSF / 1000, isSubject: true })
  const scenarioChartData = [
    { name: 'Conservative', value: scenarios.conservative.value, noi: scenarios.conservative.noi, ppsf: Math.round(scenarios.conservative.ppsf) },
    { name: 'Base Case', value: scenarios.base.value, noi: scenarios.base.noi, ppsf: Math.round(scenarios.base.ppsf) },
    { name: 'Optimistic', value: scenarios.optimistic.value, noi: scenarios.optimistic.noi, ppsf: Math.round(scenarios.optimistic.ppsf) },
  ]
  const incomeBreakdown = [{ name: 'NOI', value: Math.round(v.noi) }, { name: 'OpEx', value: Math.round(v.opex) }, { name: 'Vacancy', value: Math.round(v.vacancy) }]
  const marketMetrics = [
    { metric: 'Vacancy Rate', value: MARKET_DATA.nwaIndustrialVacancy, fullMark: 15 },
    { metric: 'Rent Growth', value: MARKET_DATA.warehouseRentGrowth, fullMark: 10 },
    { metric: 'Flex Demand', value: 8.5, fullMark: 10 },
    { metric: 'New Supply', value: 6, fullMark: 10 },
    { metric: 'Absorption', value: 7.5, fullMark: 10 },
    { metric: 'Cap Rate Stability', value: 7, fullMark: 10 },
  ]
  const rentCompData = [
    { name: 'Subject Low', rate: 16 }, { name: 'Subject High', rate: 19 },
    { name: 'NWA Warehouse Avg', rate: 9.6 }, { name: 'NWA Flex Low', rate: 16 },
    { name: 'NWA Flex High', rate: 23 }, { name: 'Lowell Flex', rate: 14 },
    { name: 'Little Flock Flex', rate: 17.5 }, { name: 'Rogers New Flex', rate: 21 },
  ]
  const scorecardItems = [
    { label: 'New Construction (2025)', score: 9 }, { label: 'Market Vacancy (6.4%)', score: 8 },
    { label: 'Rent vs. Market', score: 7 }, { label: 'Location (Rogers/NWA)', score: 8 },
    { label: 'Flex Configuration', score: 8 }, { label: 'Absorption Trend', score: 7 },
  ]
  const avgScore = (scorecardItems.reduce((a,b) => a + b.score, 0) / scorecardItems.length).toFixed(1)

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 max-w-[1400px] mx-auto">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Property Valuation Report</h1>
              <Badge color="#10b981">LIVE</Badge>
            </div>
            <p className="text-[#94a3b8] text-lg">{SUBJECT.address}</p>
          </div>
          <div className="text-right text-sm text-[#64748b]">
            <div>Prepared for: <span className="text-[#f1f5f9]">Nick @ Appreciate</span></div>
            <div>Date: <span className="text-[#f1f5f9]">March 25, 2026</span></div>
            <div className="mt-1"><Badge color="#f59e0b">Purchase Analysis</Badge></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <Metric label="Property Type" value="Flex Industrial" sub="Office / Retail / Warehouse" />
          <Metric label="Total SF" value={fmtNum(SUBJECT.totalSF)} sub={SUBJECT.availableSpaces + ' spaces available'} />
          <Metric label="Year Built" value={SUBJECT.yearBuilt} sub="New construction" color="#10b981" />
          <Metric label="Asking Rent" value={'$' + SUBJECT.askingRentLow + '-$' + SUBJECT.askingRentHigh + '/SF'} sub="Per year (NNN)" />
          <Metric label="Est. Value (Base)" value={fmt(scenarios.base.value)} sub={fmtDec(scenarios.base.ppsf) + '/SF'} color="#3b82f6" />
        </div>
      </header>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-[#64748b] mr-2">Scenario:</span>
        {['conservative', 'base', 'optimistic'].map(s => (
          <button key={s} onClick={() => setActiveScenario(s)}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (activeScenario === s ? 'bg-[#3b82f6] text-white shadow-lg' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#253346]')}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Income Approach Valuation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Metric label="Gross Potential Income" value={fmt(v.gpi)} />
            <Metric label="Less Vacancy" value={'(' + fmt(v.vacancy) + ')'} color="#ef4444" />
            <Metric label="Less OpEx" value={'(' + fmt(v.opex) + ')'} color="#f59e0b" />
            <Metric label="Net Operating Income" value={fmt(v.noi)} color="#10b981" />
          </div>
          <div className="grid grid-cols-3 gap-4 bg-[#0d1320] rounded-xl p-4">
            <Metric label="Cap Rate" value={fmtPct(activeScenario === 'conservative' ? 7.5 : activeScenario === 'base' ? 7.03 : 6.5)} />
            <Metric label="Indicated Value" value={fmt(v.value)} color="#3b82f6" />
            <Metric label="Price per SF" value={fmtDec(v.ppsf)} color="#8b5cf6" />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4">Income Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {incomeBreakdown.map((_, i) => <Cell key={i} fill={['#10b981','#f59e0b','#ef4444'][i]} />)}
            </Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Valuation Scenarios</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scenarioChartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => '$' + (v/1e6).toFixed(1) + 'M'} />
              <Tooltip /><Bar dataKey="value" radius={[6,6,0,0]}>
                {scenarioChartData.map((_, i) => <Cell key={i} fill={['#f59e0b','#3b82f6','#10b981'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
            <div className="bg-[#0d1320] rounded-lg p-3"><div className="text-[#f59e0b] font-bold">{fmt(scenarios.conservative.value)}</div><div className="text-[#64748b] text-xs">7.50% cap</div></div>
            <div className="bg-[#0d1320] rounded-lg p-3 ring-1 ring-[#3b82f6]"><div className="text-[#3b82f6] font-bold">{fmt(scenarios.base.value)}</div><div className="text-[#64748b] text-xs">7.03% cap</div></div>
            <div className="bg-[#0d1320] rounded-lg p-3"><div className="text-[#10b981] font-bold">{fmt(scenarios.optimistic.value)}</div><div className="text-[#64748b] text-xs">6.50% cap</div></div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4">Investment Scorecard <span className="ml-auto text-2xl font-bold text-[#10b981]">{avgScore}/10</span></h2>
          <div className="space-y-3">
            {scorecardItems.map((item, i) => (
              <div key={i}><div className="flex justify-between text-sm mb-1"><span className="text-[#94a3b8]">{item.label}</span>
                <span className="font-semibold" style={{ color: item.score >= 8 ? '#10b981' : '#f59e0b' }}>{item.score}/10</span></div>
                <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: item.score * 10 + '%', background: item.score >= 8 ? '#10b981' : '#f59e0b' }} /></div></div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Comparable Sales - Price per SF</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={compChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => '$' + v} />
              <Tooltip />
              <ReferenceLine y={Math.round(scenarios.base.ppsf)} stroke="#3b82f6" strokeDasharray="5 5" />
              <Bar dataKey="ppsf" radius={[6,6,0,0]}>
                {compChartData.map((d, i) => <Cell key={i} fill={d.isSubject ? '#3b82f6' : COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4">Rent Comparables ($/SF/YR)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rentCompData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => '$' + v} domain={[0, 25]} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={110} />
              <Tooltip /><Bar dataKey="rate" radius={[0,6,6,0]}>
                {rentCompData.map((d, i) => <Cell key={i} fill={d.name.startsWith('Subject') ? '#3b82f6' : '#334155'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4">NWA Market Health</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={marketMetrics} outerRadius={85}>
              <PolarGrid stroke="#1e293b" /><PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 10]} />
              <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Comparable Sales Detail</h2>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead>
            <tr className="border-b border-[#1e293b] text-[#64748b] text-xs uppercase tracking-wider">
              <th className="text-left py-3 pr-4">Property</th><th className="text-left py-3 pr-4">Type</th>
              <th className="text-right py-3 pr-4">Size (SF)</th><th className="text-right py-3 pr-4">Sale Price</th>
              <th className="text-right py-3 pr-4">$/SF</th><th className="text-right py-3">Date</th></tr></thead>
            <tbody>{COMPS.map(c => (
              <tr key={c.id} className="border-b border-[#1e293b]/50 hover:bg-[#1a2332]">
                <td className="py-3 pr-4"><div className="font-medium">{c.name}</div><div className="text-[#64748b] text-xs">{c.address}</div></td>
                <td className="py-3 pr-4"><Badge color={c.type.includes('Industrial') ? '#10b981' : '#8b5cf6'}>{c.type}</Badge></td>
                <td className="text-right py-3 pr-4 font-mono">{fmtNum(c.sf)}</td>
                <td className="text-right py-3 pr-4 font-mono">{fmt(c.salePrice)}</td>
                <td className="text-right py-3 pr-4 font-mono font-semibold text-[#3b82f6]">{c.ppsf{'}'}</td>
                <td className="text-right py-3 text-[#94a3b8]">{c.date}</td></tr>))}
              <tr className="bg-[#0d1320] font-semibold">
                <td className="py-3 pr-4"><div>Subject Property (est.)</div><div className="text-[#64748b] text-xs font-normal">{SUBJECT.address}</div></td>
                <td className="py-3 pr-4"><Badge color="#3b82f6">Flex Industrial</Badge></td>
                <td className="text-right py-3 pr-4 font-mono">{fmtNum(SUBJECT.totalSF)}</td>
                <td className="text-right py-3 pr-4 font-mono text-[#3b82f6]">{fmt(scenarios.base.value)}</td>
                <td className="text-right py-3 pr-4 font-mono text-[#3b82f6]">{Math.round(scenarios.base.ppsf){'}'}</td>
                <td className="text-right py-3 text-[#94a3b8]">-</td></tr></tbody></table></div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4">Key Market Metrics</h2>
          <div className="space-y-3 text-sm">
            {[['NWA Industrial Vacancy', fmtPct(MARKET_DATA.nwaIndustrialVacancy), '#10b981'],
              ['Avg Warehouse Rent', '$' + MARKET_DATA.avgWarehouseRent + '/SF', '#f1f5f9'],
              ['Rent Growth (YoY)', '+' + fmtPct(MARKET_DATA.warehouseRentGrowth), '#10b981'],
              ['Flex Rent Range', '$' + MARKET_DATA.flexRentRange.low + '-$' + MARKET_DATA.flexRentRange.high + '/SF', '#f1f5f9'],
              ['Natl Flex Cap Rate', fmtPct(MARKET_DATA.nationalFlexCapRate), '#f1f5f9'],
              ['Central Region Cap', fmtPct(MARKET_DATA.centralRegionFlexCapRate), '#f1f5f9'],
              ['New Supply (2025)', (MARKET_DATA.newSupply2025SF / 1e6).toFixed(1) + 'M SF', '#f1f5f9'],
              ['Net Absorption H2', '+' + fmtNum(MARKET_DATA.positiveAbsorptionH2) + ' SF', '#10b981'],
            ].map(([label, val, color], i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
                <span className="text-[#94a3b8]">{label}</span><span className="font-semibold" style={{color}}>{val}</span></div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Assumptions, Notes & Recommendation</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[#94a3b8]">
            <div><h3 className="text-[#f1f5f9] font-semibold mb-2">Methodology</h3>
              <p>Income approach using direct capitalization. Base case: $17.50/SF rent, 6.4% vacancy, 30% OpEx, 7.03% cap rate. Comps confirm $100-$168/SF range for industrial.</p></div>
            <div><h3 className="text-[#f1f5f9] font-semibold mb-2">Key Considerations</h3>
              <p>New 2025 construction, minimal deferred maintenance. NWA flex undersupplied for small-bay. Vacancy declined 10.4% to 6.1% in H2 2025.</p></div>
            <div><h3 className="text-[#f1f5f9] font-semibold mb-2">Recommendation</h3>
              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4">
                <div className="text-[#10b981] font-bold text-lg mb-1">Favorable - Worth Pursuing</div>
                <p className="text-[#94a3b8]">Base valuation {fmt(scenarios.base.value)} ({fmtDec(scenarios.base.ppsf)}/SF). Negotiate below {fmt(scenarios.conservative.value)}.</p>
              </div>
              <p className="text-xs text-[#64748b] mt-2">Not financial advice. Engage certified appraiser.</p></div>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <p className="text-xs text-[#475569]">Sources: LoopNet #32391011 | Cushman & Wakefield NWA Report | Rogers AR Permits | Talk Business | FRED MSA Data | IRR/CBRE Cap Rates | RentCafe | Redfin | Zillow</p>
        </Card>
      </div>
      <footer className="mt-8 text-center text-xs text-[#475569] pb-8">Built for Nick @ Appreciate | {SUBJECT.address} | March 25, 2026</footer>
    </div>
  )
}
