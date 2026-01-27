'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, FileText, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import Image from 'next/image'

export function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard/daftar-hadir', label: 'Daftar Hadir', icon: FileText },
    { href: '/dashboard/peserta', label: 'Peserta', icon: Users },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-dvh bg-white border-r border-slate-200 fixed left-0 top-0 flex-col z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <Image src="/st_logo.png" alt="Logo" width={32} height={32} className="w-8 h-8" unoptimized />
          <div>
            <h2 className="font-bold text-slate-900 text-sm">RAKER 2026</h2>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <link.icon size={18} />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-50 px-4 py-2 flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                 isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <link.icon size={20} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center gap-1 p-2 rounded-lg text-red-400/70"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>
    </>
  )
}
