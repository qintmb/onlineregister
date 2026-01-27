import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DaftarNama {
  id: string
  nama: string
  jabatan: string
  departemen_instansi: string
  created_at: string
}

export interface DaftarHadir {
  id: string
  uuid: string | null
  nama: string
  jabatan: string
  departemen_instansi: string
  photo_ttd_url: string
  check_in: string
}
