import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Zap,
  Eye,
  Share2,
  Download,
  Code2,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/header";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header/>
      {/* HERO */}
      <section className="px-4 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Understand any codebase
        </h1>

        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          Paste a repository, explore architecture, and chat with your code using AI.
        </p>

        <div className="mt-8 flex justify-center">
          <SignUpButton mode="modal">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 max-w-6xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<MessageSquare size={18} />}
          title="Chat with Code"
          desc="Ask questions and get answers instantly."
        />
        <FeatureCard
          icon={<Zap size={18} />}
          title="Smart Processing"
          desc="Auto analysis of structure and dependencies."
        />
        <FeatureCard
          icon={<Eye size={18} />}
          title="Code Viewer"
          desc="Clean and readable code display."
        />
        <FeatureCard
          icon={<Code2 size={18} />}
          title="AI Explanations"
          desc="Understand files without reading everything."
        />
        <FeatureCard
          icon={<Share2 size={18} />}
          title="Diagram Generator"
          desc="Visualize your system easily."
        />
        <FeatureCard
          icon={<Download size={18} />}
          title="Export"
          desc="Download or save your work anytime."
        />
      </section>


      {/* FOOTER */}
      <footer className="text-center text-sm py-8">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} VectorAI
        </p>
      </footer>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-5">
        <div className="mb-3 text-muted-foreground">{icon}</div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}

function Step({ step, title }: { step: string; title: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-lg font-semibold">{step}</div>
        <p className="mt-2 text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}