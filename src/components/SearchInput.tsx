'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User } from 'lucide-react'
import { supabase, type DaftarNama } from '@/lib/supabase'

interface SearchInputProps {
  onSelect: (participant: DaftarNama) => void
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ onSelect, value, onChange }: SearchInputProps) {
  const [suggestions, setSuggestions] = useState<DaftarNama[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchParticipants = async () => {
      // Require minimum 3 characters for search
      if (value.length < 3) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('daftar_nama')
          .select('*')
          .ilike('nama', `%${value}%`)
          .limit(5) // Reduced from 10 for faster response

        if (error) throw error
        setSuggestions(data || [])
        setIsOpen(true)
      } catch (error) {
        console.error('Error searching participants:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchParticipants, 300)
    return () => clearTimeout(debounce)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (participant: DaftarNama) => {
    onSelect(participant)
    setSuggestions([]) // Clear suggestions to ensure dropdown is closed
    setIsOpen(false)
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 tracking-wider">NAMA PESERTA</label>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder="Ketik nama..."
            className="glass-input pl-4 pr-10 py-3 text-sm h-10 md:h-12 w-full font-medium"
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="search-dropdown max-h-[40vh]">
            {suggestions.map((participant) => (
              <div
                key={participant.id}
                onClick={() => handleSelect(participant)}
                className="search-item py-2 px-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User size={14} className="text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">{participant.nama}</p>
                    <p className="text-xs text-slate-500 truncate leading-tight">{participant.jabatan}</p>
                    <p className="text-[10px] text-slate-400 truncate">{participant.departemen_instansi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isOpen && value.length >= 3 && suggestions.length === 0 && !isLoading && (
          <div className="search-dropdown">
            <div className="p-3 text-center text-xs text-slate-500">
              Tidak ada hasil
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
