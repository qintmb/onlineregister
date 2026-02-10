'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Loader2, Gift, ArrowLeft } from 'lucide-react'
import { MotionBackground } from '@/components/MotionBackground'

interface ProfileData {
  nama: string
  jabatan: string
  departemen_instansi: string
  souvenir: number | null
  check_in: string
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Memuat data...</p>
        </div>
      </main>
    }>
      <ProfileContent />
    </Suspense>
  )
}

function ProfileContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const uuid = searchParams.get('id')

  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!uuid) {
      setIsLoading(false)
      setNotFound(true)
      return
    }
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid])

  const fetchProfile = async () => {
    try {
      // Check if user exists in daftar_hadir (already registered)
      const { data: hadir, error: hadirError } = await supabase
        .from('daftar_hadir')
        .select('nama, jabatan, departemen_instansi, check_in, uuid')
        .eq('uuid', uuid!)
        .maybeSingle()

      if (hadirError) throw hadirError
      if (!hadir) {
        setNotFound(true)
        return
      }

      // Fetch souvenir from daftar_nama
      const { data: namaData } = await supabase
        .from('daftar_nama')
        .select('souvenir')
        .eq('id', uuid!)
        .maybeSingle()

      setData({
        nama: hadir.nama,
        jabatan: hadir.jabatan,
        departemen_instansi: hadir.departemen_instansi,
        check_in: hadir.check_in,
        souvenir: namaData?.souvenir ?? null,
      })
    } catch (err) {
      console.error(err)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Memuat data...</p>
        </div>
      </main>
    )
  }

  if (notFound || !data) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Data Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm">Anda belum melakukan registrasi atau data telah dihapus.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft size={16} />
            Kembali ke Registrasi
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden">
      <MotionBackground />

      {/* Logo */}
      <div className="mb-6 animate-fade-in">
        <Image
          src="/raker_logo.svg"
          alt="RAKER LOGO"
          width={180}
          height={180}
          priority
          className="mx-auto drop-shadow-2xl"
        />
      </div>

      {/* Profile Card */}
      <div className="glass-card w-full max-w-sm p-8 space-y-6 animate-fade-in text-center relative z-10">
        {/* Thank you heading */}
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Terima kasih telah Registrasi
          </h1>
          <div className="h-0.5 w-24 bg-red-600 mx-auto rounded-full opacity-80"></div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama</p>
            <p className="text-sm font-bold text-slate-900">{data.nama}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jabatan</p>
            <p className="text-sm font-medium text-slate-700">{data.jabatan}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instansi</p>
            <p className="text-sm font-medium text-slate-700">{data.departemen_instansi}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200"></div>

        {/* Souvenir Number - BIG like a queue/waiting number */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Gift size={18} className="text-red-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Souvenir No</p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl py-6 px-4 shadow-lg shadow-red-500/20">
              <p className="text-7xl sm:text-8xl font-heading font-black text-white leading-none tracking-tight drop-shadow-md">
                {data.souvenir ?? '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-400 text-[9px] relative z-10">
        © 2026 PT Semen Tonasa. All rights reserved.
      </footer>
    </main>
  )
}
