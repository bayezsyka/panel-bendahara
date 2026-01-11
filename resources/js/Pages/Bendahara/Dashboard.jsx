import React from 'react'
import { Head, router } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, Legend
} from 'recharts'

function rupiah(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
}

function monthLabel(ym) {
  // ym: "2026-01"
  const d = new Date(ym + '-01')
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(d)
}

export default function Dashboard({ title, kpis, series, months }) {
  function changeMonths(m) {
    router.get('/bendahara/dashboard', { months: m }, {
      preserveState: true,
      replace: true,
    })
  }

  return (
    <BendaharaLayout>
      <Head title={title} />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="text-sm text-gray-500">Per {kpis.asOf}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">Range grafik</div>
            <select
              className="rounded border p-2"
              value={months}
              onChange={(e) => changeMonths(e.target.value)}
            >
              <option value="3">3 bulan</option>
              <option value="6">6 bulan</option>
              <option value="12">12 bulan</option>
              <option value="24">24 bulan</option>
            </select>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Pemasukan bulan ini</div>
            <div className="mt-1 text-xl font-semibold">{rupiah(kpis.incomeThisMonth)}</div>
          </div>

          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Pengeluaran bulan ini</div>
            <div className="mt-1 text-xl font-semibold">{rupiah(kpis.expenseThisMonth)}</div>
          </div>

          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Saldo bulan ini</div>
            <div className="mt-1 text-xl font-semibold">{rupiah(kpis.netThisMonth)}</div>
          </div>

          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Saldo total</div>
            <div className="mt-1 text-xl font-semibold">{rupiah(kpis.netAllTime)}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded border p-4">
          <div className="mb-3 text-lg font-semibold">Tren {months} bulan terakhir</div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={series}>
                <XAxis dataKey="month" tickFormatter={monthLabel} />
                <YAxis tickFormatter={(v) => new Intl.NumberFormat('id-ID').format(v)} />
                <Tooltip
                  formatter={(value, name) => [rupiah(value), name]}
                  labelFormatter={(label) => monthLabel(label)}
                />
                <Legend />
                <Bar dataKey="income" name="Pemasukan" />
                <Bar dataKey="expense" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini table biar jelas angka mentahnya */}
          <div className="mt-4 overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Bulan</th>
                  <th className="p-3 text-right">Pemasukan</th>
                  <th className="p-3 text-right">Pengeluaran</th>
                  <th className="p-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {series.map((r) => (
                  <tr key={r.month} className="border-t">
                    <td className="p-3">{monthLabel(r.month)}</td>
                    <td className="p-3 text-right">{rupiah(r.income)}</td>
                    <td className="p-3 text-right">{rupiah(r.expense)}</td>
                    <td className="p-3 text-right">{rupiah(r.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BendaharaLayout>
  )
}
