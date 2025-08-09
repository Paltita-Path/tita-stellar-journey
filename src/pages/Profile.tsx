import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import titaBadge from "@/assets/tita-badge.png";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [minted, setMinted] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("tita:email");
    if (e) setEmail(e);
    const r = localStorage.getItem("tita:receiver");
    if (r) setPubKey(r);
    setMinted(localStorage.getItem("tita:badge") === "minted");
  }, []);

  const save = () => {
    localStorage.setItem("tita:email", email);
    localStorage.setItem("tita:receiver", pubKey);
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
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm mb-1">Stellar public key (testnet)</label>
              <Input value={pubKey} onChange={(e) => setPubKey(e.target.value)} placeholder="G..." />
            </div>
            <Button onClick={save}>Guardar</Button>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Tu TITA Builder Badge</h2>
          {minted ? (
            <div className="flex items-center gap-4">
              <img src={titaBadge} alt="TITA Builder Badge NFT" className="w-28 h-28" loading="lazy" />
              <p className="text-muted-foreground">¡Felicidades! Tu badge fue emitido en Stellar testnet.</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Aún no has completado tu ruta. Termina todas tus tareas para emitir tu badge.</p>
          )}
        </div>
      </section>
    </main>
  );
}
