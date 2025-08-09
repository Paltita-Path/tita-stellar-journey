import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  const { pathname } = useLocation();
  const linkClass = (to: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === to ? "bg-secondary text-secondary-foreground" : "hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Inicio TITA">
          <span className="text-sm font-semibold px-2 py-1 rounded-md bg-secondary/70">TITA</span>
          <span className="sr-only">TITA – AI Web3 Mentor</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/onboarding" className={linkClass("/onboarding")}>Onboarding</Link>
          <Link to="/panel" className={linkClass("/panel")}>Panel</Link>
          <Link to="/perfil" className={linkClass("/perfil")}>Perfil</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/onboarding"><Button variant="hero" size="sm">Comenzar</Button></Link>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
