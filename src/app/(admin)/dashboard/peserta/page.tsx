"use client";

import { useEffect, useState } from "react";
import { type DaftarNama, supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const DEPT_OPTIONS = [
  "DANA PENSIUN",
  "DEPT. OF CLINKER & CEMENT PRODUCTION",
  "DEPT. OF COMMUNICATION & LGA",
  "DEPT. OF FINANCE (BUSINESS CONTROLLER)",
  "DEPT. OF HUMAN CAPITAL & GRC",
  "DEPT. OF INFRASTRUCTURE",
  "DEPT. OF INTERNAL AUDIT",
  "DEPT. OF INVENTORY MANAGEMENT",
  "DEPT. OF MAINTENANCE",
  "DEPT. OF MARKET PLANNING & DEVELOPMENT",
  "DEPT. OF MINING & POWER PLANT",
  "DEPT. OF PRODUCTION PLANNING & CONTROL",
  "DEPT. OF PROJECT MGMT & MAINT. SUPPORT",
  "DEPT. OF SALES",
  "DEWAN KOMISARIS",
  "DIREKSI",
  "GROUP HEAD OF PROCUREMENT",
  "KOMITE AUDIT",
  "KOPKAR ST",
  "OOTC",
  "PT BIRINGKASSI RAYA",
  "PT EMKL TOPABIRING",
  "PT PELSINDO",
  "PT PKM",
  "PT SETRA",
  "PT TONASA LINES",
  "SEK. DEKOM / KOMITE PEMANTAU RISIKO",
  "SKST",
  "STAF SEK. DEKOM",
  "UNIT OF WAREHOUSE",
  "YKST",
];

export default function PesertaPage() {
  const [data, setData] = useState<DaftarNama[]>([]);
  const [checkedInUuids, setCheckedInUuids] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "checked-in" | "not-checked-in"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    jabatan: "",
    departemen_instansi: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch participants (Daftar Nama)
      const { data: participants, error: participantError } = await supabase
        .from("daftar_nama")
        .select("*")
        .order("created_at", { ascending: false });

      if (participantError) throw participantError;

      // 2. Fetch Check-ins (Daftar Hadir) - only need UUIDs
      const { data: checkIns, error: checkInError } = await supabase
        .from("daftar_hadir")
        .select("uuid");

      if (checkInError) throw checkInError;

      // Create Set of checked-in UUIDs for O(1) lookup
      const checkedInSet = new Set(
        checkIns?.map((item) => item.uuid).filter(Boolean) as string[],
      );

      setData(participants || []);
      setCheckedInUuids(checkedInSet);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPeserta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("daftar_nama")
        .insert([formData]);

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({ nama: "", jabatan: "", departemen_instansi: "" });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Gagal menambah peserta");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle single item selection
  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Toggle select all visible items
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map((item) => item.id)));
    }
  };

  // Handle delete peserta
  const handleDeletePeserta = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);

      const { error } = await supabase
        .from("daftar_nama")
        .delete()
        .in("id", idsToDelete);

      if (error) throw error;

      setDeletedCount(idsToDelete.length);
      setIsDeleteModalOpen(false);
      setSelectedIds(new Set());
      setIsDeleteMode(false);

      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 1000);

      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus peserta");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete mode
  const cancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedIds(new Set());
  };

  const filteredData = data.filter((item) => {
    // 1. Search Filter
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(search.toLowerCase());

    // 2. Status Filter
    const isCheckedIn = checkedInUuids.has(item.id);
    let matchesStatus = true;
    if (filterStatus === "checked-in") matchesStatus = isCheckedIn;
    if (filterStatus === "not-checked-in") matchesStatus = !isCheckedIn;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header className="sticky -top-4 md:-top-8 z-20 bg-slate-50/80 backdrop-blur-md -mx-4 px-4 md:-mx-8 md:px-8 py-4 border-b border-slate-200 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="w-full xl:w-auto">
          <h1 className="text-2xl font-bold text-slate-900">Data Karyawan</h1>
          <p className="text-slate-500 text-sm">Detail Database Karyawan</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          {/* Status Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterStatus === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("checked-in")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                filterStatus === "checked-in"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Sudah Absen
            </button>
            <button
              onClick={() => setFilterStatus("not-checked-in")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                filterStatus === "not-checked-in"
                  ? "bg-red-100 text-red-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Belum
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-10 py-2 text-sm bg-white border-slate-200 w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isDeleteMode
              ? (
                <>
                  <button
                    onClick={cancelDeleteMode}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 flex items-center gap-2 whitespace-nowrap text-sm shadow-sm justify-center transition-colors"
                  >
                    <X size={16} />
                    Batal
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={selectedIds.size === 0}
                    className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 whitespace-nowrap text-sm shadow-sm justify-center transition-colors ${
                      selectedIds.size > 0
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-red-300 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 size={16} />
                    Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
                  </button>
                </>
              )
              : (
                <>
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 flex items-center gap-2 whitespace-nowrap text-sm shadow-sm justify-center transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2 whitespace-nowrap text-sm shadow-sm justify-center"
                  >
                    <Plus size={16} />
                    Add Peserta
                  </button>
                </>
              )}
          </div>
        </div>
      </header>

      {/* Table */}
      {isLoading
        ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-8 h-8 border-slate-200 border-t-blue-600" />
          </div>
        )
        : (
          <div className="glass-card overflow-hidden ring-1 ring-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    {isDeleteMode && (
                      <th className="px-3 py-2 font-semibold w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredData.length &&
                            filteredData.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-3 py-2 font-semibold w-12 text-center">
                      Status
                    </th>
                    <th className="px-3 py-2 font-semibold">Nama & Jabatan</th>
                    <th className="px-3 py-2 font-semibold">DEPT/ Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => {
                    const isCheckedIn = checkedInUuids.has(item.id);
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-red-50 hover:bg-red-100"
                            : "hover:bg-slate-50"
                        }`}
                        onClick={() => isDeleteMode && toggleSelectId(item.id)}
                      >
                        {isDeleteMode && (
                          <td
                            className="px-3 py-2 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectId(item.id)}
                              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="px-3 py-2 text-center">
                          <div className="flex justify-center">
                            {isCheckedIn
                              ? (
                                <div className="group relative">
                                  <CheckCircle
                                    size={18}
                                    className="text-green-500"
                                  />
                                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Sudah Absen
                                  </span>
                                </div>
                              )
                              : (
                                <div className="group relative">
                                  <XCircle size={18} className="text-red-200" />
                                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Belum Absen
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-slate-900 font-bold text-xs leading-tight">
                            {item.nama}
                          </div>
                          <div className="text-slate-500 text-[10px] leading-tight mt-0.5">
                            {item.jabatan}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-[10px]">
                          {item.departemen_instansi}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-slate-400"
                      >
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
                <h3 className="text-lg font-bold text-slate-900">
                  Tambah Peserta Baru
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPeserta} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 tracking-wider">
                    NAMA LENGKAP
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })}
                    className="glass-input w-full p-2.5 bg-slate-50 border-slate-200"
                    placeholder="Nama Peserta"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 tracking-wider">
                    JABATAN
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })}
                    className="glass-input w-full p-2.5 bg-slate-50 border-slate-200"
                    placeholder="Jabatan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 tracking-wider">
                    INSTANSI / DEPARTEMEN
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.departemen_instansi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departemen_instansi: e.target.value,
                        })}
                      className="glass-input w-full p-2.5 bg-slate-50 border-slate-200 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Pilih Instansi/Departemen
                      </option>
                      {DEPT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={16}
                    />
                  </div>
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
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative z-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={28} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Konfirmasi Hapus
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Apakah Anda yakin ingin menghapus{" "}
                  <span className="font-semibold text-red-600">
                    {selectedIds.size} peserta
                  </span>?
                  <br />Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="glass-button glass-button-secondary flex-1 py-2.5"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePeserta}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting
                      ? (
                        <>
                          <div className="spinner w-4 h-4 border-white/30 border-t-white" />
                          Menghapus...
                        </>
                      )
                      : (
                        <>
                          <Trash2 size={16} />
                          Ya, Hapus
                        </>
                      )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="font-medium text-sm">
              {deletedCount} peserta berhasil dihapus
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
