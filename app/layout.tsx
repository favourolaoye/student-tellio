import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"
import AuthWrapper from "./clientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tellio | Students",
  description: "Report incidents and get assistance with Tellio",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
       <AuthWrapper>
          {children}
          <Toaster position="top-right"/>
       </AuthWrapper>
      </body>
    </html>
  )
}
