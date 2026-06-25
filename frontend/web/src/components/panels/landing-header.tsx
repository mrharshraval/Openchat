"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-6 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img
            src="/brand/logo-lockups/monochrome/Black%20Filled.svg"
            alt="Moots"
            className="h-7 w-auto dark:hidden"
          />
          <img
            src="/brand/logo-lockups/monochrome/White%20Filled.svg"
            alt="Moots"
            className="h-7 w-auto hidden dark:block"
          />
        </Link>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-8 w-20 bg-muted/20 animate-pulse rounded-full" />
          ) : session ? (
            <Button asChild size="sm" className="text-[13px] h-8">
              <Link href="/chat">Start Chat</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-[13px] h-8">
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button asChild size="sm" className="text-[13px] h-8">
                <Link href="/chat">Start Chat</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
