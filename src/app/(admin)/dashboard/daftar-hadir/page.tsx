'use client'

import { useEffect, useState } from 'react'
import { supabase, type DaftarHadir } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { Download, FileText } from 'lucide-react'

export default function DaftarHadirPage() {
  const [data, setData] = useState<DaftarHadir[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('daftar_hadir')
        .select('*')
        .order('check_in', { ascending: false })

      if (error) throw error
      setData(result || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToExcel = () => {
    const title = [['DAFTAR HADIR RAKER 2026 PT SEMEN TONASA']]
    const date = [[`Export Date: ${new Date().toLocaleString('id-ID')}`]]
    const spacer = [['']]
    const headers = [['No', 'Waktu Check-In', 'Nama', 'Jabatan', 'Instansi']]
    
    const rows = data.map((item, index) => [
      index + 1,
      new Date(item.check_in).toLocaleString('id-ID'),
      item.nama,
      item.jabatan,
      item.departemen_instansi
    ])

    const worksheet = XLSX.utils.aoa_to_sheet([
      ...title,
      ...date,
      ...spacer,
      ...headers,
      ...rows
    ])

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Hadir')
    XLSX.writeFile(workbook, `Daftar_Hadir_Raker_2026_${Date.now()}.xlsx`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Daftar Hadir</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {data.length} peserta
            </span>
          </div>
          <p className="text-slate-500 text-sm">Real-time update peserta registrasi</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 transition"
          >
            Refresh
          </button>
          <button 
            onClick={exportToExcel} 
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white transition flex items-center gap-2"
          >
            <Download size={16} />
            Excel
          </button>
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition flex items-center gap-2"
          >
            <FileText size={16} />
            Print
          </button>
        </div>
      </header>
      
      {/* Print Header - Smaller */}
      <div className="hidden print-only mb-4 text-center">
        <h1 className="text-base font-bold text-black border-b border-black pb-2 mb-2">DAFTAR HADIR RAKER 2026 PT SEMEN TONASA</h1>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Total: {data.length} peserta</span>
          <span>Export: {new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 no-print">
          <div className="spinner w-8 h-8 border-slate-200 border-t-blue-600" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden ring-1 ring-slate-200 shadow-sm print:shadow-none print:ring-0 print:bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 print:bg-white print:text-black print:border-black">
                <tr>
                  <th className="px-2 md:px-3 py-2 font-semibold w-10 text-center">No</th>
                  <th className="px-2 md:px-3 py-2 font-semibold">Waktu</th>
                  <th className="px-2 md:px-3 py-2 font-semibold">Nama</th>
                  <th className="px-2 md:px-3 py-2 hidden md:table-cell print:table-cell font-semibold">Jabatan</th>
                  <th className="px-2 md:px-3 py-2 hidden md:table-cell print:table-cell font-semibold">Instansi</th>
                  <th className="px-2 md:px-3 py-2 text-center font-semibold">TTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                {data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors print:hover:bg-white">
                    <td className="px-2 md:px-3 py-2 text-slate-500 text-xs text-center print:text-black">
                      {index + 1}
                    </td>
                    <td className="px-2 md:px-3 py-2 text-slate-600 text-[11px] whitespace-nowrap print:text-black">
                      {new Date(item.check_in).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-2 md:px-3 py-2 text-slate-900 font-medium text-xs print:text-black">
                      {item.nama}
                      <div className="md:hidden text-[10px] text-slate-500 mt-0.5 print:hidden">
                        {item.jabatan} • {item.departemen_instansi}
                      </div>
                    </td>
                    <td className="px-2 md:px-3 py-2 text-slate-600 text-xs hidden md:table-cell print:table-cell print:text-black">
                      {item.jabatan}
                    </td>
                    <td className="px-2 md:px-3 py-2 text-slate-600 text-xs hidden md:table-cell print:table-cell print:text-black">
                      {item.departemen_instansi}
                    </td>
                    <td className="px-2 md:px-3 py-2 flex justify-center">
                      <div className="relative w-10 h-6 md:w-12 md:h-8 print:w-16 print:h-10 bg-white rounded overflow-hidden cursor-pointer hover:scale-150 transition-transform origin-center border border-slate-200 print:border-none">
                        {item.photo_ttd_url ? (
                          <img
                            src={item.photo_ttd_url}
                            alt="TTD"
                            className="absolute inset-0 w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px]">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Belum ada data registrasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
