'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts'

// ─── DATA ───────────────────────────────────────────────────────────────────

const SUBJECT = {
  address: '6361 S Oldridge Pl, Rogers, AR 72758',
  type: 'Industrial / Flex (Office · Retail · Warehouse)',
  yearBuilt: 2025,
  totalSF: 38225,
  availableSpaces: 2,
  smallestUnit: 4432,
  largestUnit: 38225,
  askingRentLow: 16.00,
  askingRentHigh: 19.00,
  developer: 'NWA Industrial (Crossland Construction)',
  permitValuation: 236730,
  lotSizeAcres: null,
  nearbyLotSale: { address: '6388 S Oldridge Pl', acres: 16.38, price: 3350000, date: 'Jun 2022' },
}

const COMPS = [
  { id: 1, name: 'Bentonville Industrial', address: 'Hwy 12, Bentonville', sf: 284896, salePrice: 31480000, ppsf: 110, date: 'Aug 2025', type: 'Industrial', yearBuilt: null },
  { id: 2, name: 'Bentonville Mixed-Use', address: 'S Main & SW 8th, Bentonville', sf: 8706, salePrice: 3500000, ppsf: 402, date: 'Nov 2025', type: 'Mixed-Use', yearBuilt: null },
  { id: 3, name: 'Beau Terre Office Park', address: 'Beau Terre, Bentonville', sf: 381197, salePrice: 44600000, ppsf: 117, date: 'Oct 2024', type: 'Office', yearBuilt: null },
  { id: 4, name: 'Rogers/Bentonville Portfolio', address: 'Pinnacle Hills & S Walton', sf: 405000, salePrice: 68000000, ppsf: 168, date: 'Feb 2026', type: 'Office Portfolio', yearBuilt: null },
  { id: 5, name: 'Fayetteville Industrial', address: 'Fayetteville, AR', sf: 150000, salePrice: 15000000, ppsf: 100, date: 'Nov 2025', type: 'Industrial', yearBuilt: null },
]

const MARKET_DATA = {
  nwaIndustrialVacancy: 6.4,
  nwaWarehouseVacancyH2: 6.1,
  avgWarehouseRent: 9.60,
  warehouseRentGrowth: 2.9,
  flexRentRange: { low: 16, high: 23 },
  newSupply2025SF: 1900000,
  positiveAbsorptionQ1: 87824,
  positiveAbsorptionH2: 597962,
  nationalFlexCapRate: 6.93,
  centralRegionFlexCapRate: 7.13,
  rogersIndustrialAvgPPSF: 235,
  rogersWarehouseAvgPPSF: 267,
  rogersCommercialAvgPPSF: 408,
}

// ─── VALUATION SCENARIOS ────────────────────────────────────────────────────

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

// ─── HELPERS ────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n)
const fmtPct = (n) => `${n.toFixed(1)}%`

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Card({ children, className = '', span = 1 }) {
  return (
    <div className={`bg-[#111827] border border-[#1e293b] rounded-2xl p-6 ${span > 1 ? `col-span-${span}` : ''} ${className}`}>
      {children}
    </div>
  )
}

function Metric({ label, value, sub, color = '#f1f5f9' }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[#64748b] mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-[#94a3b8] mt-0.5">{sub}</div>}
    </div>
  )
}

function Badge({ children, color = '#3b82f6' }) {
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${color}20`, color }}>
      {children}
    </span>
  )
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm shadow-xl">
      <div className="text-[#94a3b8] text-xs mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-semibold" style={{ color: p.color || '#f1f5f9' }}>
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState('base')
  const v = scenarios[activeScenario]

  // Chart data
  const compChartData = COMPS.map(c => ({ name: c.name.split(' ').slice(0,2).join(' '), ppsf: c.ppsf, sf: c.sf / 1000 }))
  compChartData.push({ name: 'Subject (est.)', ppsf: Math.round(scenarios.base.ppsf), sf: SUBJECT.totalSF / 1000, isSubject: true })

  const scenarioChartData = [
    { name: 'Conservative', value: scenarios.conservative.value, noi: scenarios.conservative.noi, ppsf: Math.round(scenarios.conservative.ppsf) },
    { name: 'Base Case', value: scenarios.base.value, noi: scenarios.base.noi, ppsf: Math.round(scenarios.base.ppsf) },
    { name: 'Optimistic', value: scenarios.optimistic.value, noi: scenarios.optimistic.noi, ppsf: Math.round(scenarios.optimistic.ppsf) },
  ]

  const incomeBreakdown = [
    { name: 'NOI', value: Math.round(v.noi) },
    { name: 'OpEx', value: Math.round(v.opex) },
    { name: 'Vacancy', value: Math.round(v.vacancy) },
  ]

  const marketMetrics = [
    { metric: 'Vacancy Rate', value: MARKET_DATA.nwaIndustrialVacancy, fullMark: 15 },
    { metric: 'Rent Growth', value: MARKET_DATA.warehouseRentGrowth, fullMark: 10 },
    { metric: 'Flex Demand', value: 8.5, fullMark: 10 },
    { metric: 'New Supply', value: 6, fullMark: 10 },
    { metric: 'Absorption', value: 7.5, fullMark: 10 },
    { metric: 'Cap Rate Stability', value: 7, fullMark: 10 },
  ]

  const rentCompData = [
    { name: 'Subject Low', rate: 16.00 },
    { name: 'Subject High', rate: 19.00 },
    { name: 'NWA Warehouse Avg', rate: 9.60 },
    { name: 'NWA Flex Low', rate: 16.00 },
    { name: 'NWA Flex High', rate: 23.00 },
    { name: 'Lowell Flex (2026)', rate: 14.00 },
    { name: 'Little Flock Flex', rate: 17.50 },
    { name: 'Rogers New Flex', rate: 21.00 },
  ]

  const scorecardItems = [
    { label: 'New Construction (2025)', score: 9, detail: 'Brand new, modern spec' },
    { label: 'Market Vacancy (6.4%)', score: 8, detail: 'Below natural vacancy rate' },
    { label: 'Rent vs. Market', score: 7, detail: 'In-line with flex comps' },
    { label: 'Location (Rogers/NWA)', score: 8, detail: 'Strong growth corridor' },
    { label: 'Flex Configuration', score: 8, detail: 'Multi-tenant capable' },
    { label: 'Absorption Trend', score: 7, detail: 'Positive & accelerating' },
  ]
  const avgScore = (scorecardItems.reduce((a,b) => a + b.score, 0) / scorecardItems.length).toFixed(1)

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 max-w-[1400px] mx-auto">
      {/* Header */}
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

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <Metric label="Property Type" value="Flex Industrial" sub="Office · Retail · Warehouse" />
          <Metric label="Total SF" value={fmtNum(SUBJECT.totalSF)} sub={`${SUBJECT.availableSpaces} spaces available`} />
          <Metric label="Year Built" value={SUBJECT.yearBuilt} sub="New construction" color="#10b981" />
          <Metric label="Asking Rent" value={`$${SUBJECT.askingRentLow}–$${SUBJECT.askingRentHigh}/SF`} sub="Per year (NNN)" />
          <Metric label="Est. Value (Base)" value={fmt(scenarios.base.value)} sub={`${fmtDec(scenarios.base.ppsf)}/SF`} color="#3b82f6" />
        </div>
      </header>

      {/* Scenario Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-[#64748b] mr-2">Scenario:</span>
        {['conservative', 'base', 'optimistic'].map(s => (
          <button
            key={s}
            onClick={() => setActiveScenario(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeScenario === s
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#253346] hover:text-[#f1f5f9]'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Income Approach Valuation ── */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            Income Approach Valuation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Metric label="Gross Potential Income" value={fmt(v.gpi)} />
            <Metric label="Less Vacancy" value={`(${fmt(v.vacancy)})`} color="#ef4444" />
            <Metric label="Less OpEx" value={`(${fmt(v.opex)})`} color="#f59e0b" />
            <Metric label="Net Operating Income" value={fmt(v.noi)} color="#10b981" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#0d1320] rounded-xl p-4">
            <Metric label="Cap Rate Applied" value={fmtPct(activeScenario === 'conservative' ? 7.50 : activeScenario === 'base' ? 7.03 : 6.50)} />
            <Metric label="Indicated Value" value={fmt(v.value)} color="#3b82f6" />
            <Metric label="Price per SF" value={fmtDec(v.ppsf)} color="#8b5cf6" />
          </div>
        </Card>

        {/* ── Income Breakdown Pie ── */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            Income Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {incomeBreakdown.map((_, i) => <Cell key={i} fill={['#10b981','#f59e0b','#ef4444'][i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={fmt} />} />
              <Legend formatter={(v) => <span className="text-[#94a3b8] text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Scenario Comparison ── */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
            Valuation Scenarios
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scenarioChartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm shadow-xl">
                    <div className="text-[#94a3b8] text-xs mb-1">{label}</div>
                    <div className="text-[#3b82f6] font-semibold">{fmt(d.value)}</div>
                    <div className="text-[#10b981] text-xs">NOI: {fmt(d.noi)}</div>
                    <div className="text-[#8b5cf6] text-xs">{fmtDec(d.ppsf)}/SF</div>
                  </div>
                )
              }} />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {scenarioChartData.map((_, i) => <Cell key={i} fill={['#f59e0b','#3b82f6','#10b981'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
            <div className="bg-[#0d1320] rounded-lg p-3">
              <div className="text-[#f59e0b] font-bold">{fmt(scenarios.conservative.value)}</div>
              <div className="text-[#64748b] text-xs">7.50% cap · 10% vac</div>
            </div>
            <div className="bg-[#0d1320] rounded-lg p-3 ring-1 ring-[#3b82f6]">
              <div className="text-[#3b82f6] font-bold">{fmt(scenarios.base.value)}</div>
              <div className="text-[#64748b] text-xs">7.03% cap · 6.4% vac</div>
            </div>
            <div className="bg-[#0d1320] rounded-lg p-3">
              <div className="text-[#10b981] font-bold">{fmt(scenarios.optimistic.value)}</div>
              <div className="text-[#64748b] text-xs">6.50% cap · 4% vac</div>
            </div>
          </div>
        </Card>

        {/* ── Investment Scorecard ── */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            Investment Scorecard
            <span className="ml-auto text-2xl font-bold text-[#10b981]">{avgScore}/10</span>
          </h2>
          <div className="space-y-3">
            {scorecardItems.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#94a3b8]">{item.label}</span>
                  <span className="font-semibold" style={{ color: item.score >= 8 ? '#10b981' : item.score >= 6 ? '#f59e0b' : '#ef4444' }}>{item.score}/10</span>
                </div>
                <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.score * 10}%`, background: item.score >= 8 ? '#10b981' : item.score >= 6 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Comparable Sales (Price/SF) ── */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
            Comparable Sales — Price per SF
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={compChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm shadow-xl">
                    <div className="text-[#94a3b8] text-xs mb-1">{label}</div>
                    <div className="text-[#3b82f6] font-semibold">${d.ppsf}/SF</div>
                    <div className="text-[#64748b] text-xs">{(d.sf).toFixed(0)}K SF</div>
                  </div>
                )
              }} />
              <ReferenceLine y={scenarios.base.ppsf} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `Subject est: $${Math.round(scenarios.base.ppsf)}/SF`, fill: '#3b82f6', fontSize: 11, position: 'top' }} />
              <Bar dataKey="ppsf" radius={[6,6,0,0]}>
                {compChartData.map((d, i) => <Cell key={i} fill={d.isSubject ? '#3b82f6' : CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Rent Comparables ── */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            Rent Comparables ($/SF/YR)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rentCompData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} domain={[0, 25]} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={110} />
              <Tooltip content={<CustomTooltip formatter={v => `$${v.toFixed(2)}/SF`} />} />
              <Bar dataKey="rate" radius={[0,6,6,0]}>
                {rentCompData.map((d, i) => <Cell key={i} fill={d.name.startsWith('Subject') ? '#3b82f6' : '#334155'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Market Health Radar ── */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
            NWA Market Health
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={marketMetrics} outerRadius={85}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 10]} />
              <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Comp Details Table ── */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            Comparable Sales Detail
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b] text-[#64748b] text-xs uppercase tracking-wider">
                  <th className="text-left py-3 pr-4">Property</th>
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-right py-3 pr-4">Size (SF)</th>
                  <th className="text-right py-3 pr-4">Sale Price</th>
                  <th className="text-right py-3 pr-4">$/SF</th>
                  <th className="text-right py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {COMPS.map(c => (
                  <tr key={c.id} className="border-b border-[#1e293b]/50 hover:bg-[#1a2332] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[#64748b] text-xs">{c.address}</div>
                    </td>
                    <td className="py-3 pr-4"><Badge color={c.type.includes('Industrial') ? '#10b981' : '#8b5cf6'}>{c.type}</Badge></td>
                    <td className="text-right py-3 pr-4 font-mono">{fmtNum(c.sf)}</td>
                    <td className="text-right py-3 pr-4 font-mono">{fmt(c.salePrice)}</td>
                    <td className="text-right py-3 pr-4 font-mono font-semibold text-[#3b82f6]">${c.ppsf}</td>
                    <td className="text-right py-3 text-[#94a3b8]">{c.date}</td>
                  </tr>
                ))}
                <tr className="bg-[#0d1320] font-semibold">
                  <td className="py-3 pr-4">
                    <div>Subject Property (est.)</div>
                    <div className="text-[#64748b] text-xs font-normal">{SUBJECT.address}</div>
                  </td>
                  <td className="py-3 pr-4"><Badge color="#3b82f6">Flex Industrial</Badge></td>
                  <td className="text-right py-3 pr-4 font-mono">{fmtNum(SUBJECT.totalSF)}</td>
                  <td className="text-right py-3 pr-4 font-mono text-[#3b82f6]">{fmt(scenarios.base.value)}</td>
                  <td className="text-right py-3 pr-4 font-mono text-[#3b82f6]">${Math.round(scenarios.base.ppsf)}</td>
                  <td className="text-right py-3 text-[#94a3b8]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Key Market Metrics ── */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
            Key Market Metrics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">NWA Industrial Vacancy</span>
              <span className="font-semibold text-[#10b981]">{fmtPct(MARKET_DATA.nwaIndustrialVacancy)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">Avg Warehouse Rent</span>
              <span className="font-semibold">${MARKET_DATA.avgWarehouseRent}/SF</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">Rent Growth (YoY)</span>
              <span className="font-semibold text-[#10b981]">+{fmtPct(MARKET_DATA.warehouseRentGrowth)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">Flex Rent Range</span>
              <span className="font-semibold">${MARKET_DATA.flexRentRange.low}–${MARKET_DATA.flexRentRange.high}/SF</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">Natl Flex Cap Rate</span>
              <span className="font-semibold">{fmtPct(MARKET_DATA.nationalFlexCapRate)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">Central Region Cap Rate</span>
              <span className="font-semibold">{fmtPct(MARKET_DATA.centralRegionFlexCapRate)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]/50">
              <span className="text-[#94a3b8] text-sm">New Supply (2025)</span>
              <span className="font-semibold">{(MARKET_DATA.newSupply2025SF / 1e6).toFixed(1)}M SF</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#94a3b8] text-sm">Net Absorption (H2 '25)</span>
              <span className="font-semibold text-[#10b981]">+{fmtNum(MARKET_DATA.positiveAbsorptionH2)} SF</span>
            </div>
          </div>
        </Card>

        {/* ── Assumptions & Notes ── */}
        <Card className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#64748b]"></span>
            Assumptions, Notes & Recommendation
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[#94a3b8]">
            <div>
              <h3 className="text-[#f1f5f9] font-semibold mb-2">Valuation Methodology</h3>
              <p className="mb-2">Income approach using direct capitalization. Base case uses midpoint rent of $17.50/SF (NNN), market vacancy of 6.4%, 30% OpEx ratio, and 7.03% blended cap rate (national flex 6.93% / central region 7.13%).</p>
              <p>Comparable sales approach confirms range: industrial comps trade at $100–$168/SF, with newer flex assets commanding premiums.</p>
            </div>
            <div>
              <h3 className="text-[#f1f5f9] font-semibold mb-2">Key Considerations</h3>
              <p className="mb-2">• New 2025 construction by NWA Industrial / Crossland — minimal deferred maintenance risk.</p>
              <p className="mb-2">• NWA flex market undersupplied for small-bay &lt;100K SF; strong tenant demand from Walmart ecosystem.</p>
              <p>• Vacancy declined from 10.4% → 6.1% in H2 2025, signaling tightening market.</p>
            </div>
            <div>
              <h3 className="text-[#f1f5f9] font-semibold mb-2">Recommendation</h3>
              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 mb-2">
                <div className="text-[#10b981] font-bold text-lg mb-1">Favorable — Worth Pursuing</div>
                <p className="text-[#94a3b8]">New-build flex in an undersupplied, growing market with strong institutional demand. Base valuation of {fmt(scenarios.base.value)} ({fmtDec(scenarios.base.ppsf)}/SF) is well-supported by comps. Negotiate based on lease-up risk for a purchase below {fmt(scenarios.conservative.value)}.</p>
              </div>
              <p className="text-xs text-[#64748b]">This analysis is for informational purposes only and should not be considered financial advice. Engage a certified appraiser for a formal valuation.</p>
            </div>
          </div>
        </Card>

        {/* ── Data Sources ── */}
        <Card className="lg:col-span-3">
          <h2 className="text-sm font-semibold mb-2 text-[#64748b]">Data Sources</h2>
          <p className="text-xs text-[#475569]">
            LoopNet listing #32391011 · Cushman & Wakefield | Sage Partners NWA Industrial Report · Rogers AR Building Permits (Dec 2024, Mar 2025) · Talk Business & Politics transaction reports · FRED Fayetteville-Springdale-Rogers MSA data · Reonomy · National cap rate data (IRR Mid-Year 2024, CBRE H1 2024) · RentCafe · Redfin · Zillow
          </p>
        </Card>
      </div>

      <footer className="mt-8 text-center text-xs text-[#475569] pb-8">
        Built for Nick @ Appreciate · {SUBJECT.address} · Generated March 25, 2026
      </footer>
    </div>
  )
}
