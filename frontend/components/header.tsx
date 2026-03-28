"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";
import { Code2, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";

interface HeaderProps {
  isChatPage?: boolean;
  repoId?: string;
  onSelectFile?: (file: any) => void;
  onOpenDiagram?: () => void;
  activePanel?: "code" | "diagram" | null;
}

export default function Header({
  isChatPage,
  repoId,
  onSelectFile,
  onOpenDiagram,
  activePanel,
}: HeaderProps) {
  const { isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">

        {/* LEFT */}
        <div className="flex items-center gap-2">

          {/* ✅ CHAT SIDEBAR (LEFT DRAWER) */}
          {isChatPage && (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-3 border-b">
                  <SheetTitle className="text-sm">Navigation</SheetTitle>
                </SheetHeader>

                {repoId && (
                  <Sidebar
                    repoId={repoId}
                    onSelectFile={(file) => {
                      onSelectFile?.(file);
                      setIsSidebarOpen(false);
                    }}
                    onOpenDiagram={() => {
                      onOpenDiagram?.();
                      setIsSidebarOpen(false);
                    }}
                    activePanel={activePanel ?? null}
                  />
                )}
              </SheetContent>
            </Sheet>
          )}

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="border rounded-md p-1 transition group-hover:scale-105">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              VectorAI
            </span>
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          <ModeToggle />

          {/* ✅ DESKTOP */}
          <div className="flex items-center gap-2">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Login</Button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <Button size="sm">Sign Up</Button>
                </SignUpButton>
              </>
            ) : (
              <>

                <UserButton
                  afterSwitchSessionUrl="/"
                  appearance={{
                    elements: { avatarBox: "w-8 h-8 border" },
                  }}
                />
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}