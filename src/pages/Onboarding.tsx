import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const steps = ["Experiencia", "Metas", "Tiempo"] as const;

type Answers = {
  experiencia: "Principiante" | "Intermedio" | "Avanzado" | null;
  metas: string[];
  tiempo: "3-5h" | "5-10h" | "10+h" | null;
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ experiencia: null, metas: [], tiempo: null });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("tita:onboarding");
    if (saved) setAnswers(JSON.parse(saved));
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step + 1) / steps.length) * 100;

  const canContinue = () => {
    if (step === 0) return !!answers.experiencia;
    if (step === 1) return answers.metas.length > 0;
    if (step === 2) return !!answers.tiempo;
    return false;
  };

  const finish = () => {
    localStorage.setItem("tita:onboarding", JSON.stringify(answers));
    navigate("/panel");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gradient-primary">Tu ruta Web3 con TITA</h1>
          <p className="text-muted-foreground">Responde rápido y te recomendaremos recursos a tu medida.</p>
        </header>

        <Progress value={progress} className="mb-6" />

        <Card>
          <CardHeader>
            <CardTitle>Paso {step + 1}: {steps[step]}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="space-y-3">
                <RadioGroup
                  value={answers.experiencia ?? undefined}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, experiencia: v as Answers["experiencia"] }))}
                >
                  {["Principiante", "Intermedio", "Avanzado"].map((v) => (
                    <div className="flex items-center space-x-2" key={v}>
                      <RadioGroupItem id={v} value={v} />
                      <Label htmlFor={v}>{v}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 1 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Conseguir trabajo Web3",
                  "Lanzar proyecto",
                  "Aprender DeFi/Payments",
                  "Participar en hackathons",
                ].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    className={`rounded-md border px-3 py-2 text-left transition-colors ${
                      answers.metas.includes(goal)
                        ? "bg-secondary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() =>
                      setAnswers((a) => ({
                        ...a,
                        metas: a.metas.includes(goal)
                          ? a.metas.filter((g) => g !== goal)
                          : [...a.metas, goal],
                      }))
                    }
                  >
                    {goal}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <RadioGroup
                  value={answers.tiempo ?? undefined}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, tiempo: v as Answers["tiempo"] }))}
                >
                  {["3-5h", "5-10h", "10+h"].map((v) => (
                    <div className="flex items-center space-x-2" key={v}>
                      <RadioGroupItem id={v} value={v} />
                      <Label htmlFor={v}>{v} / semana</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0}>Atrás</Button>
          {step < steps.length - 1 ? (
            <Button variant="hero" onClick={next} disabled={!canContinue()}>Continuar</Button>
          ) : (
            <Button variant="hero" onClick={finish} disabled={!canContinue()}>Ver mi panel</Button>
          )}
        </div>
      </section>
    </main>
  );
}
