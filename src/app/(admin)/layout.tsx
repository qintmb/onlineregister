import { AdminSidebar } from '@/components/AdminSidebar'
import '../globals.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <AdminSidebar />
      <main className="md:pl-64 min-h-dvh pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
