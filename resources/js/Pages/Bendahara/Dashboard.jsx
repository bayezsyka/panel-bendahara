import React from 'react'
import { Head, router, Link } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import Dropdown from '@/Components/Dropdown' // Import komponen Dropdown
import {
  ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
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

// Warna untuk pie chart
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6']

export default function Dashboard({ title, kpis, expenseSeries, projectExpenses, topProjects, months }) {
  function changeMonths(m) {
    router.get('/bendahara/dashboard', { months: m }, {
      preserveState: true,
      replace: true,
    })
  }

  // Fungsi untuk menangani export
  const handleExport = (withReceipts) => {
    const url = route('bendahara.export.all.pdf', { with_receipts: withReceipts ? 1 : 0 });
    window.open(url, '_blank');
  };

  return (
    <BendaharaLayout>
      <Head title={title} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="text-sm text-gray-500">Data per {kpis.asOf}</div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dropdown Export Laporan */}
            <Dropdown>
                <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none"
                        >
                            Export Laporan
                            <svg
                                className="-mr-0.5 ml-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </span>
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <Dropdown.Link as="button" onClick={() => handleExport(false)} className="w-full text-left">
                        Export PDF (Tanpa Nota)
                    </Dropdown.Link>
                    <Dropdown.Link as="button" onClick={() => handleExport(true)} className="w-full text-left">
                        Export PDF (Dengan Nota)
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>

            {/* Filter Range Grafik */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Range grafik</div>
              <select
                className="rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Pengeluaran Bulan Ini</div>
                <div className="text-lg font-bold text-gray-900">{rupiah(kpis.expenseThisMonth)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Total Pengeluaran</div>
                <div className="text-lg font-bold text-gray-900">{rupiah(kpis.totalExpense)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Proyek Aktif</div>
                <div className="text-lg font-bold text-gray-900">{kpis.activeProjects}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Proyek Selesai</div>
                <div className="text-lg font-bold text-gray-900">{kpis.completedProjects}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Expense Trend Chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tren Pengeluaran</h3>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">{months} bulan terakhir</span>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={expenseSeries}>
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={monthLabel} 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(v)} 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [rupiah(value), 'Pengeluaran']}
                    labelFormatter={(label) => monthLabel(label)}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Expense Pie Chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribusi Pengeluaran per Proyek</h3>
              <p className="text-sm text-gray-500">10 proyek dengan pengeluaran tertinggi</p>
            </div>
            {projectExpenses && projectExpenses.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={projectExpenses}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name.substring(0, 15)}${name.length > 15 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {projectExpenses.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => rupiah(value)}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                Belum ada data pengeluaran
              </div>
            )}
          </div>
        </div>

        {/* Top Projects Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Proyek dengan Pengeluaran Tertinggi</h3>
              <Link 
                href="/bendahara/projects" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500">Nama Proyek</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProjects && topProjects.length > 0 ? (
                  topProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/bendahara/projects/${project.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.status === 'ongoing' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {project.status === 'ongoing' ? 'Berjalan' : 'Selesai'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {rupiah(project.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      Belum ada data proyek
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Expense Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Detail Pengeluaran Bulanan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500">Bulan</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenseSeries && expenseSeries.map((r) => (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{monthLabel(r.month)}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{rupiah(r.expense)}</td>
                  </tr>
                ))}
              </tbody>
              {expenseSeries && expenseSeries.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-3 font-semibold text-gray-900">Total</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">
                      {rupiah(expenseSeries.reduce((sum, r) => sum + r.expense, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </BendaharaLayout>
  )
}