'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  nama: string
}

export function SuccessModal({ isOpen, onClose, nama }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-8 w-full max-w-sm relative z-10 text-center shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="text-green-600" size={40} />
            </motion.div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Registrasi Berhasil!
            </h3>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Terima kasih <span className="font-semibold text-slate-900">{nama}</span>, data kehadiran Anda telah tersimpan.
            </p>

            <button
              onClick={onClose}
              className="glass-button w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl shadow-lg shadow-blue-500/20"
            >
              Tutup
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
