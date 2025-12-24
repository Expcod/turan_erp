"use client"

import type { ReactNode } from "react"
import { I18nProvider } from "@/lib/i18n"
import { UserProvider } from "@/lib/user-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <UserProvider>{children}</UserProvider>
    </I18nProvider>
  )
}
