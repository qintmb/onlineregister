'use client'

import { useEffect, useState } from 'react'
import { supabase, type DaftarNama } from '@/lib/supabase'
import { Search, Plus, X, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PesertaPage() {
  const [data, setData] = useState<DaftarNama[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    departemen_instansi: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('daftar_nama')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setData(result || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPeserta = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('daftar_nama')
        .insert([formData])

      if (error) throw error
      
      setIsModalOpen(false)
      setFormData({ nama: '', jabatan: '', departemen_instansi: '' })
      fetchData() // Refresh list
    } catch (err) {
      console.error(err)
      alert('Gagal menambah peserta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredData = data.filter(item => 
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.jabatan.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-slate-900">List Peserta</h1>
          <p className="text-slate-500 text-sm">Database peserta RAKER 2026</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-10 py-2 text-sm bg-white border-slate-200 w-full"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2 whitespace-nowrap text-sm shadow-sm"
          >
            <Plus size={16} />
            Add Peserta
          </button>
        </div>
      </header>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner w-8 h-8 border-slate-200 border-t-blue-600" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden ring-1 ring-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                  <th className="px-6 py-4 font-semibold">Jabatan</th>
                  <th className="px-6 py-4 font-semibold">Instansi</th>
                  <th className="px-6 py-4 text-right font-semibold">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      {item.nama}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {item.jabatan}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {item.departemen_instansi}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Peserta Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Tambah Peserta Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPeserta} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 tracking-wider">NAMA LENGKAP</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className="glass-input w-full p-2.5 bg-slate-50 border-slate-200"
                    placeholder="Nama Peserta"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 tracking-wider">JABATAN</label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                    className="glass-input w-full p-2.5 bg-slate-50 border-slate-200"
                    placeholder="Jabatan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 tracking-wider">INSTANSI / DEPARTEMEN</label>
                  <input
                    type="text"
                    required
                    value={formData.departemen_instansi}
                    onChange={(e) => setFormData({...formData, departemen_instansi: e.target.value})}
                    className="glass-input w-full p-2.5 bg-slate-50 border-slate-200"
                    placeholder="Instansi"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="glass-button glass-button-secondary flex-1 py-2.5"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="glass-button flex-1 bg-blue-600 hover:bg-blue-700 py-2.5"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
