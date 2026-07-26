import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Search,
  BookOpen,
  Edit3,
  Eye,
  Layers,
  Sparkles,
  ImageIcon,
  Copy,
  Save,
  Loader2,
  Image as ImageLucide,
  Cloud,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getDaftarSemuaLesson,
  getDaftarSemuaChapter,
  getDaftarModul,
  updateLessonAdmin,
  generatePromptGambarMateriAdmin,
} from "@/functions/modules";
import { unggahMediaAdmin } from "@/functions/media";

export const Route = createFileRoute("/_app/admin/materi/")({
  loader: async () => {
    try {
      const [lessonRes, chapterRes, modulRes] = await Promise.all([
        getDaftarSemuaLesson(),
        getDaftarSemuaChapter(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);
      return {
        initialLessons: lessonRes.success && lessonRes.data ? lessonRes.data : [],
        chaptersList: chapterRes.success && chapterRes.data ? chapterRes.data : [],
        modulesList: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { initialLessons: [], chaptersList: [], modulesList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Kelola Gambar & Materi Pembelajaran — Admin BrevetAI" },
      { name: "description", content: "Daftar materi pembelajaran perpajakan dengan integrasi Gambar Cloudinary & Gemini Prompt Generator." },
    ],
  }),
  component: AdminMateriGridPage,
});

function AdminMateriGridPage() {
  const router = useRouter();
  const { initialLessons } = Route.useLoaderData();
  const [materiList, setMateriList] = useState<any[]>(initialLessons);
  const [cari, setCari] = useState("");

  // Modal State for Image Prompt & URL
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [gambarUrlInput, setGambarUrlInput] = useState("");
  const [promptGambarText, setPromptGambarText] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);

  const handleDirectUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedLesson) {
      const file = e.target.files[0];
      setUploadingFile(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await unggahMediaAdmin({
            data: {
              fileBase64: base64,
              namaFile: file.name,
              namaTampilan: selectedLesson.judul || file.name,
              folder: "brevetai/ilustrasi",
              entitasTipe: "ILUSTRASI",
            },
          });

          if (res.success && res.data) {
            const newUrl = res.data.secureUrl;
            setGambarUrlInput(newUrl);

            // Auto save to lesson
            await updateLessonAdmin({
              data: {
                id: selectedLesson.id,
                gambarUrl: newUrl,
              },
            });

            setMateriList(
              materiList.map((m) => (m.id === selectedLesson.id ? { ...m, gambarUrl: newUrl } : m))
            );
            toast.success("Gambar berhasil diunggah ke Cloudinary & otomatis disimpan ke materi!");
            router.invalidate();
          } else {
            toast.error(res.message || "Gagal mengunggah gambar");
          }
        } catch {
          toast.error("Terjadi kesalahan koneksi pengunggah file ke Cloudinary.");
        } finally {
          setUploadingFile(false);
        }
      };
    }
  };

  const filtered = materiList.filter((l: any) =>
    (l.judul || l.title || "").toLowerCase().includes(cari.toLowerCase())
  );

  const handleOpenImageModal = (lesson: any) => {
    setSelectedLesson(lesson);
    setGambarUrlInput(lesson.gambarUrl || "");
    setPromptGambarText(lesson.promptGambar || "");
    setImageModalOpen(true);
  };

  const handleGeneratePromptGemini = async () => {
    if (!selectedLesson) return;
    setGeneratingPrompt(true);
    try {
      const res = await generatePromptGambarMateriAdmin({ data: { id: selectedLesson.id } });
      if (res.success && res.data) {
        setPromptGambarText(res.data.promptGambar);
        toast.success("Super Prompt Gambar AI berhasil dibuat oleh Gemini!");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal membuat prompt gambar");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi AI");
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSaveGambarUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    setSavingUrl(true);
    try {
      const res = await updateLessonAdmin({
        data: {
          id: selectedLesson.id,
          gambarUrl: gambarUrlInput,
          promptGambar: promptGambarText,
        },
      });

      if (res.success) {
        toast.success("URL Gambar Materi berhasil disimpan!");
        setMateriList(
          materiList.map((m) =>
            m.id === selectedLesson.id ? { ...m, gambarUrl: gambarUrlInput, promptGambar: promptGambarText } : m
          )
        );
        setImageModalOpen(false);
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal menyimpan URL gambar");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSavingUrl(false);
    }
  };

  const copyPromptToClipboard = () => {
    if (!promptGambarText) return;
    navigator.clipboard.writeText(promptGambarText);
    toast.success("Super Prompt Gambar AI berhasil disalin! Siap ditempel ke ChatGPT / DALL-E 3 / Midjourney.");
  };

  return (
    <>
      <PageHeader
        title="Materi Pembelajaran & Gambar"
        description="Kelola materi edukasi perpajakan Brevet A/B, kelola gambar Cloudinary, dan hasilkan prompt gambar AI dengan Gemini."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Materi" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="font-bold text-xs shadow-2xs rounded-none">
              <Link to="/admin/gambar">
                <Cloud className="mr-1.5 h-3.5 w-3.5 text-primary" /> Pustaka Cloudinary
              </Link>
            </Button>
            <Button size="sm" asChild className="font-bold text-xs shadow-xs rounded-none">
              <Link to="/admin/modul">
                <Layers className="mr-1.5 h-4 w-4" /> Kelola via Modul
              </Link>
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari judul materi pembelajaran..."
            className="pl-10 h-10 bg-card shadow-2xs text-xs rounded-none border-border"
          />
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-none border border-border bg-card p-12 text-center my-6 shadow-xs">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Materi Pembelajaran</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Impor modul Brevet A/B via AI atau tambahkan materi baru di halaman kelola modul.
            </p>
          </div>
        ) : (
          /* Grid Layout - Sharp Box Cards */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l: any) => {
              const statusText = l.statusPublikasi || "TERBIT";
              const isTerbit = statusText === "TERBIT";

              return (
                <div
                  key={l.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-none border border-border bg-card shadow-xs transition-all hover:shadow-md hover:border-primary"
                >
                  <div className="space-y-3">
                    {/* Lesson Image Box Preview */}
                    {l.gambarUrl ? (
                      <div className="relative aspect-16/9 w-full bg-muted/40 overflow-hidden border-b border-border">
                        <img src={l.gambarUrl} alt={l.judul} className="h-full w-full object-cover" />
                        <Badge variant="secondary" className="absolute top-2 right-2 text-[9px] font-bold rounded-none bg-black/70 text-white">
                          📷 Image Attached
                        </Badge>
                      </div>
                    ) : (
                      <div className="relative aspect-16/9 w-full bg-muted/20 overflow-hidden border-b border-border grid place-items-center">
                        <div className="text-center space-y-1">
                          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
                          <p className="text-[10px] text-muted-foreground font-mono">Belum ada gambar</p>
                        </div>
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-muted-foreground font-semibold flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-primary" /> Materi Edukasi
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold rounded-none ${
                            isTerbit
                              ? "border-success/40 bg-success/15 text-success"
                              : "border-amber-500/40 bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          ● {statusText}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold leading-snug text-foreground line-clamp-2 pt-1">
                        {l.judul || l.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Footer Actions: Prompt AI, Image, Edit & Preview */}
                  <div className="border-t border-border bg-muted/15 p-3 flex items-center justify-between gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenImageModal(l)}
                      className="font-bold text-xs h-8 rounded-none border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-400" /> Prompt AI & Gambar
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" asChild className="font-semibold text-xs px-2 h-8 rounded-none">
                        <Link to="/belajar/materi/$slug" params={{ slug: l.slug }} target="_blank">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                        </Link>
                      </Button>

                      <Button size="sm" asChild className="font-semibold text-xs px-2.5 h-8 rounded-none shadow-xs">
                        <Link to="/admin/materi/$slug" params={{ slug: l.slug }}>
                          <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageBody>

      {/* MODAL DIALOG GENERATOR PROMPT GAMBAR GEMINI & INPUT URL */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="h-5 w-5 text-amber-400" /> Kelola Gambar & Super Prompt AI Gemini
            </DialogTitle>
            <DialogDescription className="text-xs">
              Materi: <strong>{selectedLesson?.judul}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Step 1: Generate Gemini Super Prompt */}
            <div className="space-y-2 rounded-none border border-primary/30 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" /> 1. Generator Super Prompt AI (Gemini Internal)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGeneratePromptGemini}
                  disabled={generatingPrompt}
                  className="font-bold text-xs h-7 rounded-none"
                >
                  {generatingPrompt ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                  )}
                  {generatingPrompt ? "Membuat..." : "⚡ Hasilkan Prompt Gemini"}
                </Button>
              </div>

              {promptGambarText ? (
                <div className="space-y-2 pt-1">
                  <Textarea
                    value={promptGambarText}
                    readOnly
                    rows={4}
                    className="font-mono text-[11px] bg-background border-primary/30 leading-relaxed rounded-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={copyPromptToClipboard}
                    className="font-bold text-xs w-full rounded-none"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Salin Super Prompt ke ChatGPT / DALL-E 3 / Midjourney
                  </Button>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic pt-1">
                  Klik "Hasilkan Prompt Gemini" untuk membuat deskripsi prompt gambar infografis yang mendetail.
                </p>
              )}
            </div>

            {/* Step 2: Direct File Upload to Cloudinary */}
            <div className="space-y-2 rounded-none border border-border bg-card p-3.5">
              <Label className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <Upload className="h-4 w-4 text-primary" /> 2. Unggah Gambar Langsung dari Komputer ke Cloudinary
              </Label>
              <div className="space-y-1.5">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectUploadFile}
                  disabled={uploadingFile}
                  className="text-xs cursor-pointer bg-muted/20 rounded-none border-border"
                />
                {uploadingFile && (
                  <p className="text-[11px] text-primary font-semibold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunggah file ke Cloudinary & menyimpan ke materi...
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Attach Cloudinary Image URL */}
            <form onSubmit={handleSaveGambarUrl} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label className="font-bold text-xs">3. Atau Tempelkan Tautan URL Gambar Cloudinary</Label>
                <Input
                  value={gambarUrlInput}
                  onChange={(e) => setGambarUrlInput(e.target.value)}
                  placeholder="Contoh: https://res.cloudinary.com/dnubzcde/image/upload/v12345/brevetai/diagram.png"
                  className="text-xs bg-muted/20 rounded-none font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  * Bisa salin URL gambar dari menu <Link to="/admin/gambar" className="text-primary underline">Pustaka Media Cloudinary</Link> atau hasil generate DALL-E 3.
                </p>
              </div>

              {gambarUrlInput && (
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Pratinjau Gambar:</Label>
                  <div className="aspect-16/9 w-full overflow-hidden bg-muted border border-border rounded-none">
                    <img src={gambarUrlInput} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setImageModalOpen(false)} className="rounded-none">
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={savingUrl} className="font-bold rounded-none shadow-xs">
                  {savingUrl ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                  {savingUrl ? "Memproses..." : "Simpan Gambar ke Materi"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
