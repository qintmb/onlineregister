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
    const headers = [['Waktu Check-In', 'Nama', 'Jabatan', 'Instansi']]
    
    const rows = data.map(item => [
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
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Hadir</h1>
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
      
      {/* Print Header */}
      <div className="hidden print-only mb-8 text-center">
        <h1 className="text-2xl font-bold text-black border-b-2 border-black pb-4 mb-4">DAFTAR HADIR RAKER 2026 PT SEMEN TONASA</h1>
        <p className="text-right text-sm text-gray-600">Export: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 no-print">
          <div className="spinner w-8 h-8 border-slate-200 border-t-blue-600" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden ring-1 ring-slate-200 shadow-sm print:shadow-none print:ring-0 print:bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 print:bg-white print:text-black print:border-black">
                <tr>
                  <th className="px-4 md:px-6 py-4 font-semibold">Waktu</th>
                  <th className="px-4 md:px-6 py-4 font-semibold">Nama</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell print:table-cell font-semibold">Jabatan</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell print:table-cell font-semibold">Instansi</th>
                  <th className="px-4 md:px-6 py-4 text-center font-semibold">TTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors print:hover:bg-white">
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-xs md:text-sm whitespace-nowrap print:text-black">
                      {new Date(item.check_in).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-900 font-medium text-sm md:text-base print:text-black">
                      {item.nama}
                      <div className="md:hidden text-xs text-slate-500 mt-1 print:hidden">
                        {item.jabatan} <br/> {item.departemen_instansi}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-sm hidden md:table-cell print:table-cell print:text-black">
                      {item.jabatan}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-sm hidden md:table-cell print:table-cell print:text-black">
                      {item.departemen_instansi}
                    </td>
                    <td className="px-4 md:px-6 py-4 flex justify-center">
                      <div className="relative w-12 h-8 md:w-16 md:h-10 print:w-20 print:h-12 bg-white rounded overflow-hidden cursor-pointer hover:scale-150 transition-transform origin-center border border-slate-200 print:border-none">
                        {item.photo_ttd_url ? (
                          <img
                            src={item.photo_ttd_url}
                            alt="TTD"
                            className="absolute inset-0 w-full h-full object-contain"
                            onError={(e) => {
                              // Hide broken image and show fallback
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
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
