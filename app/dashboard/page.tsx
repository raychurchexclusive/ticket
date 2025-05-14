"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // This will be handled by the layout, but just in case
    router.push("/dashboard/user")
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting to dashboard...</p>
    </div>
  )
}
