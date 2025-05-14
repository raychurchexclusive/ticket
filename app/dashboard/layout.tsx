"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, CalendarDays, CreditCard, LogOut, Menu, QrCode, Settings, User, Users } from "lucide-react"
import { Logo } from "@/components/logo"
import { Ticket } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { userData, logOut } = useAuth()
  const [role, setRole] = useState<"admin" | "seller" | "user">("user")

  // Set role based on user data
  useEffect(() => {
    if (userData?.role) {
      setRole(userData.role as "admin" | "seller" | "user")
    }
  }, [userData])

  // Handle role change (for demo purposes)
  const handleRoleChange = (newRole: "admin" | "seller" | "user") => {
    setRole(newRole)

    // Redirect to the appropriate dashboard
    if (newRole === "admin") {
      router.push("/dashboard/admin")
    } else if (newRole === "seller") {
      router.push("/dashboard/seller")
    } else {
      router.push("/dashboard/user")
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Redirect to the appropriate dashboard on initial load
  useEffect(() => {
    if (pathname === "/dashboard") {
      if (role === "admin") {
        router.push("/dashboard/admin")
      } else if (role === "seller") {
        router.push("/dashboard/seller")
      } else {
        router.push("/dashboard/user")
      }
    }

    // Restrict access based on role
    if (role === "seller" && !pathname.startsWith("/dashboard/seller")) {
      router.push("/dashboard/seller")
    } else if (role === "user" && !pathname.startsWith("/dashboard/user")) {
      router.push("/dashboard/user")
    }
  }, [pathname, role, router])

  const adminNavItems = [
    { href: "/dashboard/admin", label: "Admin Dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard/seller", label: "Seller Dashboard", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/user", label: "User Dashboard", icon: <User className="h-5 w-5" /> },
    { href: "/dashboard/admin/events", label: "Events", icon: <CalendarDays className="h-5 w-5" /> },
    { href: "/dashboard/admin/sellers", label: "Sellers", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const sellerNavItems = [
    { href: "/dashboard/seller", label: "Dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard/seller/scan", label: "Scan Tickets", icon: <QrCode className="h-5 w-5" /> },
    { href: "/dashboard/seller/events", label: "My Events", icon: <CalendarDays className="h-5 w-5" /> },
    { href: "/dashboard/seller/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const userNavItems = [
    { href: "/dashboard/user", label: "Dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard/user/tickets", label: "My Tickets", icon: <Ticket className="h-5 w-5" /> },
    { href: "/dashboard/user/payments", label: "Payment Methods", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/dashboard/user/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const navItems = role === "admin" ? adminNavItems : role === "seller" ? sellerNavItems : userNavItems

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-tct-navy">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-tct-navy/30 bg-tct-navy text-white px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden border-tct-cyan text-white hover:text-tct-navy"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:max-w-none bg-tct-navy border-r border-tct-cyan/30 text-white">
              <div className="mb-4">
                <Logo size="lg" />
              </div>
              <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      pathname === item.href ? "bg-tct-magenta text-white" : "hover:bg-tct-navy/70"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-red-400 hover:bg-tct-navy/70 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          <Logo size="md" />
          <div className="ml-auto flex items-center gap-4">
            {/* Role switcher (only for admin in demo purposes) */}
            {userData?.role === "admin" && (
              <div className="hidden md:flex gap-2">
                <Button
                  variant={role === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("user")}
                  className={
                    role === "user"
                      ? "bg-tct-magenta hover:bg-tct-magenta/90"
                      : "border-tct-cyan text-white hover:text-tct-navy"
                  }
                >
                  User
                </Button>
                <Button
                  variant={role === "seller" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("seller")}
                  className={
                    role === "seller"
                      ? "bg-tct-magenta hover:bg-tct-magenta/90"
                      : "border-tct-cyan text-white hover:text-tct-navy"
                  }
                >
                  Seller
                </Button>
                <Button
                  variant={role === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("admin")}
                  className={
                    role === "admin"
                      ? "bg-tct-magenta hover:bg-tct-magenta/90"
                      : "border-tct-cyan text-white hover:text-tct-navy"
                  }
                >
                  Admin
                </Button>
              </div>
            )}
            <Button variant="outline" size="icon" className="border-tct-cyan text-white hover:text-tct-navy">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Link href="/dashboard/user/settings">
              <Button variant="outline" size="icon" className="border-tct-cyan text-white hover:text-tct-navy">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-64 flex-col border-r border-tct-navy/30 md:flex bg-tct-navy text-white">
            <div className="p-4">
              <Logo size="lg" />
            </div>
            <nav className="grid gap-2 p-4 text-sm font-medium">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                    pathname === item.href ? "bg-tct-magenta text-white" : "hover:bg-tct-navy/70"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-red-400 hover:bg-tct-navy/70 text-left"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </aside>
          <main className="flex-1 p-4 md:p-6 bg-tct-navy/95 text-white">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
