import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { signInWithEmail } from "@/lib/api";

const Index = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setHasSession(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleStart = async () => {
    if (hasSession) {
      navigate("/onboarding");
      return;
    }
    if (!email) {
      toast({ title: "Ingresa tu email", description: "Te enviaremos un magic link para continuar." });
      return;
    }
    try {
      setLoading(true);
      await signInWithEmail(email);
      toast({ title: "Revisa tu correo", description: "Enviamos un magic link para continuar con TITA 🥑" });
    } catch (e: any) {
      toast({ title: "Error de autenticación", description: e?.message ?? "Intenta de nuevo" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center bg-background">
      <section className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gradient-primary">Hola, soy TITA 🥑, tu compañera para aprender y construir en Web3</h1>
          <p className="mt-4 text-lg text-muted-foreground">Cuéntame tus metas y te daré una ruta con cursos, hackathons y grants. Completa tu progreso y recibe tu TITA Builder Badge.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {!hasSession && (
              <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
            <Button variant="hero" size="lg" onClick={handleStart} disabled={loading}>
              {hasSession ? "Comenzar" : loading ? "Enviando..." : "Comenzar"}
            </Button>
            <Link to="/panel"><Button variant="outline" size="lg">Ver panel</Button></Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-2xl border bg-gradient-primary shadow-elegant animate-[pulse_3s_ease-in-out_infinite]" aria-hidden />
        </div>
      </section>
    </main>
  );
};

export default Index;
