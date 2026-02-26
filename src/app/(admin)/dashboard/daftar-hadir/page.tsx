"use client";

import { useEffect, useState } from "react";
import { type DaftarHadir, supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import {
  CheckSquare,
  Download,
  FileText,
  Loader2,
  Square,
  Trash2,
  X,
} from "lucide-react";

export default function DaftarHadirPage() {
  const [data, setData] = useState<DaftarHadir[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel("realtime-daftar-hadir")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "daftar_hadir" },
        (payload) => {
          const newDaftarHadir = payload.new as DaftarHadir;
          setData((prev) => [newDaftarHadir, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "daftar_hadir" },
        (payload) => {
          setData((prev) => prev.filter((item) => item.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch daftar_hadir
      const { data: result, error } = await supabase
        .from("daftar_hadir")
        .select("*")
        .order("check_in", { ascending: false });

      if (error) throw error;

      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    // Create worksheet data
    const wsData: (string | number)[][] = [];

    // Row 1: Title (will be merged)
    wsData.push([
      "DAFTAR HADIR RAPAT BOD ESELON 1 PT SEMEN TONASA",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    // Row 2: Empty spacer
    wsData.push(["", "", "", "", "", "", ""]);

    // Row 3: Info row
    const exportDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const exportDay = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
    });
    wsData.push([
      `Total: ${data.length} peserta`,
      "",
      "",
      "",
      "",
      "",
      `Export: ${exportDate}`,
    ]);

    // Row 4: Empty spacer
    wsData.push(["", "", "", "", "", "", ""]);

    // Row 5: Headers
    wsData.push(["NO", "WAKTU", "NAMA", "JABATAN", "INSTANSI", "TTD"]);

    // Data rows
    data.forEach((item, index) => {
      wsData.push([
        index + 1,
        new Date(item.check_in).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        item.nama,
        item.jabatan,
        item.departemen_instansi,
        "", // TTD placeholder - images not supported in basic xlsx
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths to match reference
    worksheet["!cols"] = [
      { wch: 5 }, // NO
      { wch: 14 }, // WAKTU
      { wch: 25 }, // NAMA
      { wch: 25 }, // JABATAN
      { wch: 30 }, // INSTANSI
      { wch: 15 }, // TTD
    ];

    // Merge title cell across all columns
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge A1:G1
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Hadir");
    XLSX.writeFile(
      workbook,
      `Daftar_Hadir_Rapat_BODES1_2026_${Date.now()}.xlsx`,
    );
  };

  const exportToPdf = () => {
    const exportDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const exportDay = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
    });

    const rowsHtml = data.map((item, index) => {
      const waktu = new Date(item.check_in).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      const ttdHtml = item.photo_ttd_url
        ? `<img src="${item.photo_ttd_url}" alt="TTD" />`
        : `<span class="ttd-empty">-</span>`;

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${waktu}</td>
          <td>${item.nama}</td>
          <td>${item.jabatan}</td>
          <td>${item.departemen_instansi}</td>
          <td class="center ttd-cell">${ttdHtml}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Daftar Hadir PDF</title>
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color: #111; }
            .logo { display: block; margin: 0 auto 6px auto; width: 40px; height: 40px; object-fit: contain; }
            h1 { font-size: 14px; margin: 0 0 6px 0; text-align: center; }
            .meta { display: flex; justify-content: space-between; font-size: 10px; color: #444; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            thead { display: table-header-group; }
            thead th { text-align: left; border-bottom: 1px solid #000; padding: 6px 4px; }
            tbody td { border-bottom: 1px solid #ddd; padding: 6px 4px; vertical-align: middle; }
            .center { text-align: center; }
            .ttd-cell img { width: 70px; height: 40px; object-fit: contain; display: inline-block; }
            .ttd-empty { color: #999; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th colspan="6">
                  <img class="logo" src="/st_logo.webp" alt="Logo" />
                  <h1>DAFTAR HADIR RAPAT BOD - BAND 1 PT SEMEN TONASA</h1>
                  <div class="meta">
                    <span>Total: ${data.length} peserta</span>
                    <span>Export: ${exportDay}, ${exportDate}</span>
                  </div>
                </th>
              </tr>
              <tr>
                <th class="center">No</th>
                <th>Waktu</th>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Instansi</th>
                <th class="center">TTD</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    const waitForImages = () => {
      const images = Array.from(printWindow.document.images);
      if (images.length === 0) return Promise.resolve();
      return Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );
    };

    const onReady = async () => {
      await waitForImages();
      printWindow.focus();
      printWindow.print();
    };

    if (printWindow.document.readyState === "complete") {
      void onReady();
    } else {
      printWindow.onload = () => {
        void onReady();
      };
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item.id));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(`Yakin ingin menghapus ${selectedIds.length} data terpilih?`)
    ) return;

    setIsDeleting(true);
    try {
      // 1. Get photo URLs for storage cleanup
      const { data: toDelete, error: fetchError } = await supabase
        .from("daftar_hadir")
        .select("photo_ttd_url")
        .in("id", selectedIds);

      if (fetchError) throw fetchError;

      if (toDelete && toDelete.length > 0) {
        // Extract paths from URLs
        // URL format: .../ttd/uuid/filename.jpg?token=...
        const paths = toDelete.map((item) => {
          const url = item.photo_ttd_url;
          const parts = url.split("/ttd/");
          if (parts.length > 1) {
            // Take part after /ttd/ and remove query params if any
            return parts[1].split("?")[0];
          }
          return null;
        }).filter(Boolean) as string[];

        if (paths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("ttd")
            .remove(paths);

          if (storageError) {
            console.warn("Storage cleanup failed partially:", storageError);
            // We continue even if storage delete fails, to ensure DB is cleaned
          }
        }
      }

      // 2. Delete from table
      const { error } = await supabase
        .from("daftar_hadir")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      await fetchData();
      setSelectedIds([]);
      setDeleteMode(false);
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Gagal menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="sticky -top-4 md:-top-8 z-20 bg-slate-50/80 backdrop-blur-md -mx-4 px-4 md:-mx-8 md:px-8 py-4 border-b border-slate-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Daftar Hadir</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {data.length} peserta
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Real-time update peserta registrasi
          </p>
        </div>
        <div className="flex gap-2">
          {isDeleteMode
            ? (
              <>
                <button
                  onClick={() => {
                    setDeleteMode(false);
                    setSelectedIds([]);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <X size={16} />
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedIds.length === 0 || isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition flex items-center gap-2"
                >
                  {isDeleting
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Trash2 size={16} />}
                  Hapus ({selectedIds.length})
                </button>
              </>
            )
            : (
              <>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 transition"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setDeleteMode(true)}
                  className="px-4 py-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 hover:text-red-600 rounded-lg text-sm text-slate-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white transition flex items-center gap-2"
                >
                  <Download size={16} />
                  Excel
                </button>
                <button
                  onClick={exportToPdf}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition flex items-center gap-2"
                >
                  <FileText size={16} />
                  Export PDF
                </button>
              </>
            )}
        </div>
      </header>

      {/* Print Header - Smaller */}
      <div className="hidden print-only mb-4 text-center">
        <h1 className="text-base font-bold text-black border-b border-black pb-2 mb-2">
          DAFTAR HADIR RAPAT BOD - BAND 1 PT SEMEN TONASA
        </h1>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Total: {data.length} peserta</span>
          <span>Export: {new Date().toLocaleDateString("id-ID")}</span>
        </div>
      </div>

      {isLoading
        ? (
          <div className="flex items-center justify-center py-20 no-print">
            <div className="spinner w-8 h-8 border-slate-200 border-t-blue-600" />
          </div>
        )
        : (
          <div className="glass-card overflow-hidden ring-1 ring-slate-200 shadow-sm print:shadow-none print:ring-0 print:bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 print:bg-white print:text-black print:border-black">
                  <tr>
                    {isDeleteMode && (
                      <th className="px-3 py-2 w-10 text-center no-print">
                        <button
                          onClick={toggleSelectAll}
                          className="hover:text-slate-800"
                        >
                          {data.length > 0 && selectedIds.length === data.length
                            ? (
                              <CheckSquare
                                size={16}
                                className="text-blue-600"
                              />
                            )
                            : <Square size={16} />}
                        </button>
                      </th>
                    )}
                    <th className="px-2 md:px-3 py-2 font-semibold w-10 text-center">
                      No
                    </th>
                    <th className="px-2 md:px-3 py-2 font-semibold">Waktu</th>
                    <th className="px-2 md:px-3 py-2 font-semibold">Nama</th>
                    <th className="px-2 md:px-3 py-2 hidden md:table-cell print:table-cell font-semibold">
                      Jabatan
                    </th>
                    <th className="px-2 md:px-3 py-2 hidden md:table-cell print:table-cell font-semibold">
                      Instansi
                    </th>
                    <th className="px-2 md:px-3 py-2 text-center font-semibold">
                      TTD
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                  {data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors print:hover:bg-white ${
                        selectedIds.includes(item.id) && isDeleteMode
                          ? "bg-blue-50/50"
                          : ""
                      }`}
                      onClick={() => isDeleteMode && toggleSelect(item.id)}
                    >
                      {isDeleteMode && (
                        <td className="px-3 py-2 text-center no-print cursor-pointer">
                          <div className="flex justify-center items-center">
                            {selectedIds.includes(item.id)
                              ? (
                                <CheckSquare
                                  size={16}
                                  className="text-blue-600"
                                />
                              )
                              : <Square size={16} className="text-slate-400" />}
                          </div>
                        </td>
                      )}
                      <td className="px-2 md:px-3 py-2 text-slate-500 text-xs text-center print:text-black">
                        {index + 1}
                      </td>
                      <td className="px-2 md:px-3 py-2 text-slate-600 text-[11px] whitespace-nowrap print:text-black">
                        {new Date(item.check_in).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-2 md:px-3 py-2 text-slate-900 font-medium text-xs print:text-black">
                        {item.nama}
                        <div className="md:hidden text-[10px] text-slate-500 mt-0.5 print:hidden">
                          {item.jabatan} • {item.departemen_instansi}
                        </div>
                      </td>
                      <td className="px-2 md:px-3 py-2 text-slate-600 text-xs hidden md:table-cell print:table-cell print:text-black">
                        {item.jabatan}
                      </td>
                      <td className="px-2 md:px-3 py-2 text-slate-600 text-xs hidden md:table-cell print:table-cell print:text-black">
                        {item.departemen_instansi}
                      </td>
                      <td className="px-2 md:px-3 py-2 flex justify-center">
                        <div className="relative w-10 h-6 md:w-12 md:h-8 print:w-16 print:h-10 bg-white rounded overflow-hidden cursor-pointer hover:scale-150 transition-transform origin-center border border-slate-200 print:border-none">
                          {item.photo_ttd_url
                            ? (
                              <img
                                src={item.photo_ttd_url}
                                alt="TTD"
                                className="absolute inset-0 w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )
                            : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px]">
                                -
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td
                        colSpan={isDeleteMode ? 7 : 6}
                        className="px-6 py-12 text-center text-slate-400"
                      >
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
  );
}
