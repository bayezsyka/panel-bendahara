import React, { useState, useContext } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import PageHeader from '@/Components/PageHeader'
import Dropdown, { DropDownContext } from '@/Components/Dropdown'
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
  const d = new Date(ym + '-01')
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(d)
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6']

const ExportActions = ({ expenseTypes, handleExport, handleExportByType, selectedExpenseType, setSelectedExpenseType }) => {
  const { setOpen } = useContext(DropDownContext);

  const onExport = (withReceipts) => {
    handleExport(withReceipts);
    setOpen(false);
  };

  const onExportByType = () => {
    if (!selectedExpenseType) {
      alert('Pilih tipe biaya terlebih dahulu');
      return;
    }
    handleExportByType();
    setOpen(false);
  };

  return (
    <Dropdown.Content closeOnClick={false} width="64">
      <div className="block px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Export Semua
      </div>
      <Dropdown.Link as="button" onClick={() => onExport(false)} className="w-full text-left">
        PDF (Tanpa Nota)
      </Dropdown.Link>
      <Dropdown.Link as="button" onClick={() => onExport(true)} className="w-full text-left">
        PDF (Dengan Nota)
      </Dropdown.Link>

      <div className="border-t border-gray-100 my-1"></div>

      <div className="px-4 py-3 space-y-3">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Export Per Tipe Biaya
        </label>
        <select
          value={selectedExpenseType}
          onChange={(e) => setSelectedExpenseType(e.target.value)}
          className="block w-full rounded-lg border-gray-200 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">Pilih Tipe</option>
          {expenseTypes.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={onExportByType}
          className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Tipe Biaya
        </button>
      </div>
    </Dropdown.Content>
  );
};

export default function Dashboard({ title, kpis, expenseSeries, projectExpenses, topProjects, months, expenseTypes }) {
  const [selectedExpenseType, setSelectedExpenseType] = useState('')
  function changeMonths(m) {
    router.get('/bendahara/dashboard', { months: m }, {
      preserveState: true,
      replace: true,
    })
  }

  const handleExport = (withReceipts) => {
    const url = route('bendahara.export.all.pdf', { with_receipts: withReceipts ? 1 : 0 });
    window.open(url, '_blank');
  };

  const handleExportByType = () => {
    if (!selectedExpenseType) {
      alert('Pilih tipe biaya terlebih dahulu');
      return;
    }
    const url = route('bendahara.export.by.type.pdf', { expense_type_id: selectedExpenseType });
    window.open(url, '_blank');
  };

  return (
    <BendaharaLayout>
      <Head title={title} />

      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={title}
          meta={`Data per ${kpis.asOf}`}
          actions={
            <>
              {/* Dropdown Export */}
              <Dropdown>
                <Dropdown.Trigger>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                    <svg className="ml-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Dropdown.Trigger>
                <ExportActions 
                  expenseTypes={expenseTypes}
                  handleExport={handleExport}
                  handleExportByType={handleExportByType}
                  selectedExpenseType={selectedExpenseType}
                  setSelectedExpenseType={setSelectedExpenseType}
                />
              </Dropdown>



              {/* Filter Range */}
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={months}
                onChange={(e) => changeMonths(e.target.value)}
              >
                <option value="3">3 bulan</option>
                <option value="6">6 bulan</option>
                <option value="12">12 bulan</option>
                <option value="24">24 bulan</option>
              </select>
            </>
          }
        />


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
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">{months} bulan</span>
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
              <h3 className="text-lg font-semibold text-gray-900">Distribusi per Proyek</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Pengeluaran Tertinggi</h3>
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
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Total</th>
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
            <h3 className="text-lg font-semibold text-gray-900">Pengeluaran Bulanan</h3>
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