import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center bg-background">
      <section className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gradient-primary">TITA – Tu mentora Web3 con NFT en Stellar Testnet</h1>
          <p className="mt-4 text-lg text-muted-foreground">Cuéntanos tus metas y te daremos una ruta con cursos, hackathons y grants. Completa tu progreso y recibe tu TITA Builder Badge.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/onboarding"><Button variant="hero" size="lg">Comenzar</Button></Link>
            <Link to="/panel"><Button variant="outline" size="lg">Ver panel</Button></Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-2xl border bg-gradient-primary shadow-elegant" aria-hidden />
        </div>
      </section>
    </main>
  );
};

export default Index;
