import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Scale,
  Calculator,
  HelpCircle,
  Trash2,
  Eye,
  FileJson,
  Edit3,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getDaftarSemuaLesson, updateLessonAdmin } from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/materi/$slug")({
  loader: async ({ params }) => {
    try {
      const lessonRes = await getDaftarSemuaLesson();
      const lessonsList = lessonRes.success && lessonRes.data ? lessonRes.data : [];
      const currentLesson = lessonsList.find((l: any) => l.slug === params.slug || l.id === params.slug) || null;
      return { currentLesson };
    } catch {
      return { currentLesson: null };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit ${loaderData?.currentLesson?.judul || "Materi"} — Admin BrevetAI` },
      { name: "description", content: "Editor materi edukasi perpajakan Brevet A/B." },
    ],
  }),
  component: EditMateriDetailPage,
});

function EditMateriDetailPage() {
  const { currentLesson } = Route.useLoaderData();
  const navigate = useNavigate();

  if (!currentLesson) {
    return (
      <PageBody className="py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-foreground">Materi Tidak Ditemukan</h3>
        <p className="text-xs text-muted-foreground">Data materi yang Anda cari tidak tersedia di database Neon.</p>
        <Button onClick={() => navigate({ to: "/admin/materi" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Materi
        </Button>
      </PageBody>
    );
  }

  const parsedJson = currentLesson.kontenJson || {
    versi: "2.0",
    metadata: { tipe: "EDUKASI_TEKS" },
    blok_konten: [
      {
        tipe: "PARAGRAF",
        data: { teks: "Isi materi pembelajaran perpajakan komprehensif..." },
      },
    ],
  };

  const [editJudul, setEditJudul] = useState(currentLesson.judul || (currentLesson as any).title || "");
  const [blocks, setBlocks] = useState<any[]>(parsedJson.blok_konten || []);
  const [rawJsonText, setRawJsonText] = useState(JSON.stringify(parsedJson, null, 2));
  const [activeTab, setActiveTab] = useState("visual");
  const [loading, setLoading] = useState(false);

  const handleAddBlock = (tipe: "PARAGRAF" | "PASAL_HUKUM" | "CONTOH_KASUS" | "GLOSARIUM") => {
    let newBlockData: any = {};
    if (tipe === "PARAGRAF") {
      newBlockData = { teks: "Tuliskan penjelasan materi perpajakan baru di sini..." };
    } else if (tipe === "PASAL_HUKUM") {
      newBlockData = {
        undang_undang: "UU No. 7 Tahun 2021 tentang HPP",
        pasal: "Pasal 17 ayat (1)",
        bunyi_pasal: "Tarif pajak yang diterapkan atas Penghasilan Kena Pajak bagi Wajib Pajak Orang Pribadi...",
      };
    } else if (tipe === "CONTOH_KASUS") {
      newBlockData = {
        judul_kasus: "Perhitungan PPh Pasal 21 TER Kategori A",
        skenario: "Karyawan A memiliki PTKP TK/0 dengan gaji Rp 8.000.000 per bulan.",
        perhitungan: "Tarif TER A (1.5%) x Rp 8.000.000 = Rp 120.000 terutang per bulan.",
      };
    } else if (tipe === "GLOSARIUM") {
      newBlockData = {
        istilah: "NPPKP",
        definisi: "Nomor Pengukuhan Pengusaha Kena Pajak sebagai identitas Pengusaha Kena Pajak.",
      };
    }

    const updatedBlocks = [...blocks, { tipe, data: newBlockData }];
    setBlocks(updatedBlocks);
    setRawJsonText(
      JSON.stringify(
        { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: updatedBlocks },
        null,
        2
      )
    );
  };

  const handleUpdateBlockField = (index: number, key: string, value: string) => {
    const nextBlocks = [...blocks];
    nextBlocks[index] = {
      ...nextBlocks[index],
      data: { ...nextBlocks[index].data, [key]: value },
    };
    setBlocks(nextBlocks);
    setRawJsonText(
      JSON.stringify(
        { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: nextBlocks },
        null,
        2
      )
    );
  };

  const handleRemoveBlock = (index: number) => {
    const nextBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(nextBlocks);
    setRawJsonText(
      JSON.stringify(
        { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: nextBlocks },
        null,
        2
      )
    );
  };

  const handleSimpanMateri = async () => {
    setLoading(true);
    try {
      let finalJson = { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: blocks };
      if (activeTab === "json") {
        finalJson = JSON.parse(rawJsonText);
      }

      const res = await updateLessonAdmin({
        data: {
          id: currentLesson.id,
          judul: editJudul,
          statusPublikasi: "TERBIT",
          kontenJson: finalJson,
        },
      });

      if (res.success) {
        toast.success(`Materi "${editJudul}" berhasil diperbarui ke database Neon!`);
      } else {
        toast.error(res.message || "Gagal memperbarui materi");
      }
    } catch {
      toast.error("Format Raw JSON tidak valid. Pastikan sintaks JSON benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Edit Materi: ${currentLesson.judul}`}
        description="Sunting teks, dasar hukum, contoh kasus, dan glosarium secara interaktif."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Materi", to: "/admin/materi" },
          { label: "Edit" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/materi" })} className="font-bold">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
            <Button size="sm" onClick={handleSimpanMateri} disabled={loading} className="font-bold shadow-md">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-xs">
          {/* Header Title Editor */}
          <div className="space-y-2 border-b pb-4">
            <Label className="text-xs font-bold">Judul Materi Pembelajaran *</Label>
            <Input
              value={editJudul}
              onChange={(e) => setEditJudul(e.target.value)}
              className="text-base font-bold bg-background"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="visual" className="font-semibold text-xs py-2">
                <Edit3 className="mr-1.5 h-4 w-4 text-primary" /> Visual Editor Blok
              </TabsTrigger>
              <TabsTrigger value="preview" className="font-semibold text-xs py-2">
                <Eye className="mr-1.5 h-4 w-4 text-primary" /> Pratinjau Tampilan Siswa
              </TabsTrigger>
              <TabsTrigger value="json" className="font-semibold text-xs py-2">
                <FileJson className="mr-1.5 h-4 w-4 text-primary" /> Editor Raw JSON
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: VISUAL EDITOR BLOK */}
            <TabsContent value="visual" className="space-y-6">
              {/* Toolbar Tambah Blok */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                <span className="text-xs font-bold text-foreground">Tambah Blok Konten Edukasi:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("PARAGRAF")} className="font-semibold text-xs">
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-primary" /> + Paragraf
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("PASAL_HUKUM")} className="font-semibold text-xs">
                    <Scale className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> + Pasal Hukum
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("CONTOH_KASUS")} className="font-semibold text-xs">
                    <Calculator className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> + Contoh Kasus
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("GLOSARIUM")} className="font-semibold text-xs">
                    <HelpCircle className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> + Glosarium
                  </Button>
                </div>
              </div>

              {/* Lista Blok Konten */}
              <div className="space-y-4">
                {blocks.map((block: any, idx: number) => (
                  <div key={idx} className="rounded-xl border bg-background p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        Blok #{idx + 1} • {block.tipe}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleRemoveBlock(idx)}
                        className="text-destructive hover:bg-destructive/10 h-7 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </div>

                    {block.tipe === "PARAGRAF" && (
                      <Textarea
                        rows={4}
                        value={block.data?.teks || ""}
                        onChange={(e) => handleUpdateBlockField(idx, "teks", e.target.value)}
                        className="font-normal text-xs leading-relaxed"
                      />
                    )}

                    {block.tipe === "PASAL_HUKUM" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="UU (Contoh: UU HPP No. 7/2021)"
                            value={block.data?.undang_undang || ""}
                            onChange={(e) => handleUpdateBlockField(idx, "undang_undang", e.target.value)}
                            className="text-xs font-bold"
                          />
                          <Input
                            placeholder="Pasal (Contoh: Pasal 17)"
                            value={block.data?.pasal || ""}
                            onChange={(e) => handleUpdateBlockField(idx, "pasal", e.target.value)}
                            className="text-xs font-bold"
                          />
                        </div>
                        <Textarea
                          placeholder="Bunyi pasal undang-undang..."
                          rows={3}
                          value={block.data?.bunyi_pasal || ""}
                          onChange={(e) => handleUpdateBlockField(idx, "bunyi_pasal", e.target.value)}
                          className="text-xs italic"
                        />
                      </div>
                    )}

                    {block.tipe === "CONTOH_KASUS" && (
                      <div className="space-y-3">
                        <Input
                          placeholder="Judul Studi Kasus"
                          value={block.data?.judul_kasus || ""}
                          onChange={(e) => handleUpdateBlockField(idx, "judul_kasus", e.target.value)}
                          className="text-xs font-bold"
                        />
                        <Textarea
                          placeholder="Skenario Kasus..."
                          rows={2}
                          value={block.data?.skenario || ""}
                          onChange={(e) => handleUpdateBlockField(idx, "skenario", e.target.value)}
                          className="text-xs"
                        />
                        <Textarea
                          placeholder="Langkah Perhitungan..."
                          rows={3}
                          value={block.data?.perhitungan || ""}
                          onChange={(e) => handleUpdateBlockField(idx, "perhitungan", e.target.value)}
                          className="font-mono text-xs bg-muted/30"
                        />
                      </div>
                    )}

                    {block.tipe === "GLOSARIUM" && (
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Istilah (Contoh: NPWP)"
                          value={block.data?.istilah || ""}
                          onChange={(e) => handleUpdateBlockField(idx, "istilah", e.target.value)}
                          className="text-xs font-bold"
                        />
                        <Input
                          placeholder="Definisi Ringkas..."
                          value={block.data?.definisi || ""}
                          onChange={(e) => handleUpdateBlockField(idx, "definisi", e.target.value)}
                          className="text-xs col-span-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: PRATINJAU TAMPILAN SISWA */}
            <TabsContent value="preview" className="space-y-4">
              <div className="rounded-xl border bg-background p-6 space-y-6">
                <div className="border-b pb-4">
                  <Badge variant="secondary" className="mb-2 text-[10px]">PREVIEW TEKS MATERI</Badge>
                  <h2 className="text-2xl font-black text-foreground">{editJudul}</h2>
                </div>

                {blocks.map((b: any, i: number) => (
                  <div key={i} className="space-y-2">
                    {b.tipe === "PARAGRAF" && (
                      <p className="text-sm text-foreground leading-relaxed">{b.data?.teks}</p>
                    )}
                    {b.tipe === "PASAL_HUKUM" && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                          <Scale className="h-4 w-4" /> {b.data?.undang_undang} • {b.data?.pasal}
                        </div>
                        <p className="text-xs italic text-foreground leading-relaxed">"{b.data?.bunyi_pasal}"</p>
                      </div>
                    )}
                    {b.tipe === "CONTOH_KASUS" && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                          <Calculator className="h-4 w-4" /> {b.data?.judul_kasus}
                        </div>
                        <p className="text-xs text-foreground">{b.data?.skenario}</p>
                        <div className="font-mono text-xs bg-background/80 p-3 rounded-lg border">
                          {b.data?.perhitungan}
                        </div>
                      </div>
                    )}
                    {b.tipe === "GLOSARIUM" && (
                      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-500">{b.data?.istilah}</span>
                        <span className="text-foreground">{b.data?.definisi}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: RAW JSON EDITOR */}
            <TabsContent value="json" className="space-y-3">
              <Textarea
                rows={16}
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                className="font-mono text-xs bg-background p-4 leading-relaxed"
              />
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate({ to: "/admin/materi" })}>
              Batal
            </Button>
            <Button onClick={handleSimpanMateri} disabled={loading} className="font-bold shadow-md">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              ⚡ Simpan Perubahan Materi
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
