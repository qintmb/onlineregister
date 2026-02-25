"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Gift, Loader2 } from "lucide-react";
import { MotionBackground } from "@/components/MotionBackground";

interface ProfileData {
  nama: string;
  jabatan: string;
  departemen_instansi: string;
  check_in: string;
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-slate-500 text-sm">Memuat data...</p>
          </div>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uuid = searchParams.get("id");

  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uuid) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const fetchProfile = async () => {
    try {
      // Check if user exists in daftar_hadir (already registered)
      const { data: hadir, error: hadirError } = await supabase
        .from("daftar_hadir")
        .select("nama, jabatan, departemen_instansi, check_in, uuid")
        .eq("uuid", uuid!)
        .order("check_in", { ascending: false })
        .limit(1);

      if (hadirError) throw hadirError;
      const latestCheckIn = hadir?.[0];
      if (!latestCheckIn) {
        setNotFound(true);
        return;
      }

      setData({
        nama: latestCheckIn.nama,
        jabatan: latestCheckIn.jabatan,
        departemen_instansi: latestCheckIn.departemen_instansi,
        check_in: latestCheckIn.check_in,
      });
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Memuat data...</p>
        </div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Data Tidak Ditemukan
          </h2>
          <p className="text-slate-500 text-sm">
            Anda belum melakukan registrasi atau data telah dihapus.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft size={16} />
            Kembali ke Registrasi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden">
      <MotionBackground />
      {/* Profile Card */}
      <div className="glass-card w-full max-w-sm p-8 space-y-6 animate-fade-in text-center relative z-10">
        {/* Thank you heading */}
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            <p>Terima kasih</p>
            <p>Anda telah Absen</p>
          </h1>
          <div className="h-0.5 w-24 bg-red-600 mx-auto rounded-full opacity-80">
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama
            </p>
            <p className="text-sm font-bold text-slate-900">{data.nama}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Jabatan
            </p>
            <p className="text-sm font-medium text-slate-700">{data.jabatan}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Instansi
            </p>
            <p className="text-sm font-medium text-slate-700">
              {data.departemen_instansi}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-400 text-[9px] relative z-10">
        © 2026 PT Semen Tonasa. All rights reserved.
      </footer>
    </main>
  );
}
