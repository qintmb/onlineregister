import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2 } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { SignatureCanvas, SignatureCanvasHandle } from "./SignatureCanvas";
import { type DaftarNama, supabase } from "@/lib/supabase";

interface NormalizedSupabaseError {
  code: string;
  message: string;
  details: string;
  hint: string;
}

export function RegistrationForm() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<
    DaftarNama | null
  >(null);
  const [jabatan, setJabatan] = useState("");
  const [instansi, setInstansi] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const signatureRef = useRef<SignatureCanvasHandle>(null);

  // Validation: Name must be selected from whitelist
  const isNameValid = selectedParticipant !== null &&
    searchValue === selectedParticipant.nama;
  const isFormComplete = isNameValid && jabatan && instansi && signature &&
    !isAlreadyRegistered;

  const normalizeSupabaseError = (err: unknown): NormalizedSupabaseError => {
    if (!err || typeof err !== "object") {
      return {
        code: "UNKNOWN",
        message: "Unknown error",
        details: "",
        hint: "",
      };
    }

    const maybeError = err as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };
    return {
      code: maybeError.code ?? "UNKNOWN",
      message: maybeError.message ?? "Unknown error",
      details: maybeError.details ?? "",
      hint: maybeError.hint ?? "",
    };
  };

  const getFriendlySupabaseError = (err: unknown) => {
    const normalized = normalizeSupabaseError(err);

    if (normalized.code === "23505") {
      return "Anda sudah check-in sebelumnya.";
    }
    if (normalized.message.toLowerCase().includes("row-level security")) {
      return "Akses Supabase ditolak (RLS). Jalankan SQL fix policy.";
    }
    if (normalized.message.toLowerCase().includes("network")) {
      return "Koneksi ke Supabase bermasalah. Coba cek internet lalu ulangi.";
    }
    return normalized.message || "Gagal submit. Silakan coba lagi.";
  };

  const hasExistingCheckIn = async (uuid: string) => {
    const { data, error: checkError } = await supabase
      .from("daftar_hadir")
      .select("id")
      .eq("uuid", uuid)
      .limit(1);
    if (checkError) throw checkError;
    return (data?.length ?? 0) > 0;
  };

  const handleParticipantSelect = async (participant: DaftarNama) => {
    setSelectedParticipant(participant);
    setSearchValue(participant.nama);
    setJabatan(participant.jabatan);
    setInstansi(participant.departemen_instansi);
    setError(null);
    setIsAlreadyRegistered(false);

    // Check if member already checked-in
    setIsCheckingStatus(true);
    try {
      const isCheckedIn = await hasExistingCheckIn(participant.id);
      if (isCheckedIn) {
        setIsAlreadyRegistered(true);
        // Already registered → redirect to profile page
        router.push(`/profile?id=${participant.id}`);
        return;
      }
    } catch (err) {
      console.error(
        "Error checking registration status:",
        normalizeSupabaseError(err),
      );
      setError("Gagal memeriksa status check-in. Silakan coba lagi.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCancel = () => {
    setSearchValue("");
    setSelectedParticipant(null);
    setJabatan("");
    setInstansi("");
    setSignature(null);
    setError(null);
    setIsAlreadyRegistered(false);
    signatureRef.current?.resetSignature();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedParticipant) return setError("Pilih nama peserta dahulu");
    if (isAlreadyRegistered) return setError("Anda sudah melakukan check-in");
    if (!signature) return setError("Tanda tangan diperlukan");

    setIsSubmitting(true);
    setError(null);

    try {
      const base64Data = signature.split(",")[1];
      if (!base64Data) {
        throw new Error("Format tanda tangan tidak valid");
      }
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      const fileName = `${selectedParticipant.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("ttd")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("ttd").getPublicUrl(fileName);

      const isCheckedIn = await hasExistingCheckIn(selectedParticipant.id);
      if (isCheckedIn) {
        setIsAlreadyRegistered(true);
        setError("Anda sudah check-in sebelumnya.");
        router.push(`/profile?id=${selectedParticipant.id}`);
        return;
      }

      const { error: insertError } = await supabase
        .from("daftar_hadir")
        .insert({
          uuid: selectedParticipant.id,
          nama: selectedParticipant.nama,
          jabatan: selectedParticipant.jabatan,
          departemen_instansi: selectedParticipant.departemen_instansi,
          photo_ttd_url: publicUrl,
          check_in: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Redirect to profile page
      router.push(`/profile?id=${selectedParticipant.id}`);
    } catch (err) {
      console.error(err);
      setError(getFriendlySupabaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="glass-card w-full max-w-sm p-6 space-y-5 animate-fade-in">
        <div className="text-center space-y-1 mb-2">
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            DATA ABSEN
          </h2>
          <div className="h-0.5 w-24 bg-red-600 mx-auto rounded-full opacity-80">
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Search */}
          <SearchInput
            value={searchValue}
            onChange={(val) => {
              setSearchValue(val);
              if (!val) {
                setSelectedParticipant(null);
                setJabatan("");
                setInstansi("");
                setIsAlreadyRegistered(false);
              }
            }}
            onSelect={handleParticipantSelect}
          />

          {/* Jabatan & Instansi - Same Width as Nama */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-red-500 tracking-wider uppercase">
                Jabatan
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300"
                  size={14}
                />
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
              <label className="text-xs font-bold text-red-500 tracking-wider uppercase">
                DEPT. / UNIT
              </label>
              <div className="relative">
                <Building2
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300"
                  size={14}
                />
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
            <SignatureCanvas
              ref={signatureRef}
              onSignatureChange={setSignature}
              disabled={!selectedParticipant || isAlreadyRegistered ||
                isCheckingStatus}
            />
          </div>

          {/* Duplication Warning */}
          {isAlreadyRegistered && (
            <div className="text-red-600 text-[11px] text-center bg-red-50 py-2 rounded-lg border border-red-200 font-bold px-2 animate-pulse">
              ⚠️ Nama ini sudah melakukan registrasi/check-in sebelumnya.
            </div>
          )}

          {/* Validation Warning */}
          {searchValue && !isNameValid && !isCheckingStatus && (
            <div className="text-amber-600 text-xs text-center bg-amber-50 py-2 rounded-lg border border-amber-200 font-medium">
              * Pilih nama dari daftar yang tersedia
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
              disabled={isSubmitting || isCheckingStatus}
              className="glass-button glass-button-secondary py-2.5 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormComplete || isCheckingStatus}
              className={`glass-button py-2.5 text-xs flex items-center justify-center gap-2 shadow-blue-500/20 transition-all ${
                !isFormComplete || isCheckingStatus
                  ? "bg-slate-300 cursor-not-allowed hover:bg-slate-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting || isCheckingStatus
                ? <span className="spinner w-4 h-4 border-2" />
                : "Check In"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
