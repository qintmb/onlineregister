import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Building2 } from 'lucide-react'
import { SearchInput } from './SearchInput'
import { SignatureCanvas, SignatureCanvasHandle } from './SignatureCanvas'
import { SuccessModal } from './SuccessModal'
import { supabase, type DaftarNama } from '@/lib/supabase'

export function RegistrationForm() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<DaftarNama | null>(null)
  const [jabatan, setJabatan] = useState('')
  const [instansi, setInstansi] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const signatureRef = useRef<SignatureCanvasHandle>(null)

  // Validation: Name must be selected from whitelist
  const isNameValid = selectedParticipant !== null && searchValue === selectedParticipant.nama
  const isFormComplete = isNameValid && jabatan && instansi && signature

  const handleParticipantSelect = (participant: DaftarNama) => {
    setSelectedParticipant(participant)
    setSearchValue(participant.nama)
    setJabatan(participant.jabatan)
    setInstansi(participant.departemen_instansi)
    setError(null)
  }

  const handleCancel = () => {
    setSearchValue('')
    setSelectedParticipant(null)
    setJabatan('')
    setInstansi('')
    setSignature(null)
    setError(null)
    signatureRef.current?.resetSignature()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedParticipant) return setError('Pilih nama peserta dahulu')
    if (!signature) return setError('Tanda tangan diperlukan')

    setIsSubmitting(true)
    setError(null)

    try {
      const base64Data = signature.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })

      const fileName = `${selectedParticipant.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('ttd')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData, error: signedUrlError } = await supabase.storage
        .from('ttd')
        .createSignedUrl(fileName, 31536000) // URL valid for 1 year

      if (signedUrlError) throw signedUrlError

      const { error: insertError } = await supabase
        .from('daftar_hadir')
        .insert({
          uuid: selectedParticipant.id,
          nama: selectedParticipant.nama,
          jabatan: selectedParticipant.jabatan,
          departemen_instansi: selectedParticipant.departemen_instansi,
          photo_ttd_url: urlData.signedUrl,
          check_in: new Date().toISOString()
        })

      if (insertError) throw insertError
      setShowSuccess(true)
    } catch (err) {
      console.error(err)
      setError('Gagal submit. Jalankan RLS fix jika error berlanjut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    handleCancel()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card w-full max-w-sm p-6 space-y-5"
      >
        <div className="text-center space-y-1 mb-2">
          <h2 className="text-lg font-bold text-slate-900 leading-tight">REGISTRASI</h2>
          <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full opacity-80"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search */}
          <SearchInput
            value={searchValue}
            onChange={(val) => {
              setSearchValue(val)
              if (!val) {
                setSelectedParticipant(null)
                setJabatan('')
                setInstansi('')
              }
            }}
            onSelect={handleParticipantSelect}
          />

          {/* Jabatan & Instansi - Same Width as Nama */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Jabatan</label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={jabatan}
                  readOnly
                  placeholder="-"
                  className="glass-input pl-4 pr-9 py-3 text-sm h-10 md:h-12 w-full font-medium bg-slate-50/50 text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Instansi</label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={instansi}
                  readOnly
                  placeholder="-"
                  className="glass-input pl-4 pr-9 py-3 text-sm h-10 md:h-12 w-full font-medium bg-slate-50/50 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-1">
            <SignatureCanvas ref={signatureRef} onSignatureChange={setSignature} />
          </div>

          {/* Validation Warning */}
          {searchValue && !isNameValid && (
            <div className="text-amber-600 text-xs text-center bg-amber-50 py-2 rounded-lg border border-amber-200 font-medium">
              ⚠️ Pilih nama dari daftar yang tersedia
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-50 py-2 rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="glass-button glass-button-secondary py-2.5 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormComplete}
              className={`glass-button py-2.5 text-sm flex items-center justify-center gap-2 shadow-blue-500/20 transition-all ${
                !isFormComplete 
                  ? 'bg-slate-300 cursor-not-allowed hover:bg-slate-300' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? <span className="spinner w-4 h-4 border-2" /> : 'Check In'}
            </button>
          </div>
        </form>
      </motion.div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        nama={selectedParticipant?.nama || ''}
      />
    </>
  )
}
