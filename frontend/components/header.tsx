"use client"

import { Button } from "@/components/ui/button"
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { ModeToggle } from "./ui/mode-toggle"
import { Code2, Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Header() {
  const { isSignedIn } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="border rounded-md p-1 transition group-hover:scale-105">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            VectorAI
          </span>
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-2">
          <ModeToggle />

          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Dashboard
              </Link>

              <UserButton
                afterSwitchSessionUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border",
                  },
                }}
              />
            </>
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-6">

                {!isSignedIn ? (
                  <>
                    <SignInButton mode="modal">
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </SignInButton>

                    <SignUpButton mode="modal">
                      <Button className="w-full">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm text-muted-foreground"
                    >
                      Dashboard
                    </Link>

                    <div className="pt-2">
                      <UserButton
                        afterSwitchSessionUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10 border",
                          },
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}