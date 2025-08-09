import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import titaBadge from "@/assets/tita-badge.png";
import { fetchRecommendationsHistory, getUser, hasBadge, resetOnboarding } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [minted, setMinted] = useState(false);
  const [lastHash, setLastHash] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<{ items: { id: string; title: string }[]; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const user = await getUser();
      if (user?.email) setEmail(user.email);
      const r = localStorage.getItem("tita:receiver");
      if (r) setPubKey(r);
      const hb = await hasBadge();
      setMinted(hb.has);
      setLastHash(hb.lastHash);
      const hist = await fetchRecommendationsHistory();
      setHistory(hist);
      setLoading(false);
    };
    load();
  }, []);

  const save = () => {
    localStorage.setItem("tita:receiver", pubKey);
    toast({ title: "Guardado", description: "Tu public key de Stellar (testnet) fue guardada localmente." });
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetOnboarding();
      localStorage.removeItem("tita:onboarding");
      localStorage.removeItem("tita:progress");
      toast({ title: "Reiniciado", description: "Vuelve a responder el onboarding para una nueva ruta." });
      navigate("/onboarding");
    } catch (e: any) {
      toast({ title: "No se pudo reiniciar", description: e?.message ?? "Intenta de nuevo" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Tu perfil</h1>
        <Card>
          <CardHeader>
            <CardTitle>Datos básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input value={email} readOnly disabled placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm mb-1">Stellar public key (testnet)</label>
              <Input value={pubKey} onChange={(e) => setPubKey(e.target.value)} placeholder="G..." />
            </div>
            <Button onClick={save} disabled={loading}>Guardar</Button>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Tu TITA Builder Badge</h2>
          {minted ? (
            <div className="flex items-center gap-4">
              <img src={titaBadge} alt="TITA Builder Badge NFT en Stellar Testnet" className="w-28 h-28" loading="lazy" />
              <div>
                <p className="text-muted-foreground">¡Felicidades! Tu badge fue emitido en Stellar testnet.</p>
                {lastHash && (
                  <a className="text-sm underline" href={`https://testnet.steexp.com/tx/${lastHash}`} target="_blank" rel="noreferrer">Ver transacción</a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Aún no has completado tu ruta. Termina todas tus tareas para emitir tu badge.</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Historial de recomendaciones</h2>
          {history.length ? (
            <div className="space-y-3">
              {history.map((h) => (
                <Card key={h.created_at}>
                  <CardHeader>
                    <CardTitle className="text-base">{new Date(h.created_at).toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm">
                      {h.items.slice(0, 3).map((it) => (
                        <li key={it.id}>{it.title}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aún no tienes recomendaciones guardadas.</p>
          )}
        </div>

        <div className="mt-8">
          <Button variant="outline" onClick={handleReset} disabled={loading}>Reiniciar onboarding</Button>
        </div>
      </section>
    </main>
  );
}
