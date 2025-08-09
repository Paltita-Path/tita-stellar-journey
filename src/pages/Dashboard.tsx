import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { resources } from "@/data/resources";
import { issueBadge } from "@/lib/stellar";

export type RecItem = {
  id: string;
  title: string;
  url: string;
  type: "course" | "hackathon" | "grant";
  tags: string[];
};

type ProgressMap = Record<string, boolean>;

export default function Dashboard() {
  const [answers, setAnswers] = useState<any>(null);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [receiver, setReceiver] = useState<string>("");
  const [issuingSecret, setIssuingSecret] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    const a = localStorage.getItem("tita:onboarding");
    if (a) setAnswers(JSON.parse(a));
    const p = localStorage.getItem("tita:progress");
    if (p) setProgressMap(JSON.parse(p));
    const rp = localStorage.getItem("tita:receiver");
    if (rp) setReceiver(rp);
  }, []);

  useEffect(() => {
    localStorage.setItem("tita:progress", JSON.stringify(progressMap));
  }, [progressMap]);

  const recs = useMemo(() => {
    // Muy simple: filtra por experiencia/metas
    const metas: string[] = answers?.metas ?? [];
    const level = (answers?.experiencia ?? "Principiante").toLowerCase();
    const all = [...resources.courses, ...resources.hackathons, ...resources.grants];
    return all.filter((r) => metas.some((m) => r.tags.includes(m)) || r.tags.includes(level)).slice(0, 9);
  }, [answers]);

  const completed = Object.values(progressMap).filter(Boolean).length;
  const total = recs.length || 1;
  const percent = Math.round((completed / total) * 100);

  const toggle = (id: string) => setProgressMap((m) => ({ ...m, [id]: !m[id] }));

  const lostMessages = [
    "Respira. Avanza una tarea pequeña hoy. TITA está contigo.",
    "Nadie empieza experto. El progreso consistente gana.",
    "Vuelve a lo básico y elige un solo recurso ahora.",
  ];

  const handleLost = () => {
    const msg = lostMessages[Math.floor(Math.random() * lostMessages.length)];
    toast({ title: "Me siento perdido", description: msg });
  };

  const readyToMint = percent === 100;

  const onMint = async () => {
    if (!issuingSecret || !receiver) {
      toast({ title: "Faltan datos", description: "Ingresa secret del emisor y tu public key de Stellar (testnet)." });
      return;
    }
    try {
      localStorage.setItem("tita:receiver", receiver);
      const result = await issueBadge({ issuingSecret, receiverPublicKey: receiver });
      if (result?.hash) {
        setTxHash(result.hash);
        localStorage.setItem("tita:badge", "minted");
        toast({ title: "NFT emitido (testnet)", description: "Verifica tu cuenta en Stellar Expert testnet." });
        setOpen(false);
      }
    } catch (e: any) {
      toast({ title: "Error emitiendo NFT", description: e?.message ?? "Revisa trustline y fondos (testnet)." });
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tu panel personalizado</h1>
            <p className="text-muted-foreground">Recursos recomendados según tu onboarding.</p>
          </div>
          <div className="min-w-[240px]">
            <Progress value={percent} />
            <div className="text-sm text-muted-foreground mt-1">Progreso: {completed}/{total} ({percent}%)</div>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleLost}>Me siento perdido</Button>
          {readyToMint && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">Emitir TITA Builder Badge (testnet)</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Emitir NFT en Stellar Testnet</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Solo para pruebas. No compartas secretos en producción. Usa cuentas de testnet y asegúrate de tener trustline al asset.</p>
                  <Input placeholder="Secret key del emisor (S...)" value={issuingSecret} onChange={(e) => setIssuingSecret(e.target.value)} />
                  <Input placeholder="Tu public key receptor (G...)" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
                  {txHash && (
                    <a className="text-sm underline" href={`https://testnet.steexp.com/tx/${txHash}`} target="_blank" rel="noreferrer">Ver transacción</a>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={onMint}>Emitir</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recs.map((r) => (
            <Card key={r.id} className={progressMap[r.id] ? "opacity-80" : ""}>
              <CardHeader>
                <CardTitle className="text-base">{r.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground capitalize">{r.type}</div>
                <div className="flex flex-wrap gap-1">
                  {r.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded border bg-secondary/50">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-sm underline">Abrir</a>
                  <Button size="sm" variant={progressMap[r.id] ? "secondary" : "default"} onClick={() => toggle(r.id)}>
                    {progressMap[r.id] ? "Hecho" : "Marcar hecho"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
