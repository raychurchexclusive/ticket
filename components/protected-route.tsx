"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"admin" | "seller" | "user">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, userData, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        // User is not logged in, redirect to login page
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        // User doesn't have the required role, redirect to dashboard
        router.push("/dashboard")
      }
    }
  }, [currentUser, userData, loading, router, pathname, allowedRoles])

  // Show loading state while checking authentication
  if (loading || !currentUser || (allowedRoles && userData && !allowedRoles.includes(userData.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tct-navy">
        <div className="h-12 w-12 rounded-full border-4 border-tct-magenta border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}
