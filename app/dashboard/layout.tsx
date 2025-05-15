"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/lib/auth-context"
import {
  Calendar,
  CreditCard,
  Home,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Ticket,
  User,
  Users,
  X,
  BarChart3,
  Wallet,
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      roles: ["user", "seller", "admin"],
    },
    {
      title: "My Tickets",
      href: "/dashboard/user/tickets",
      icon: <Ticket className="h-5 w-5" />,
      roles: ["user"],
    },
    {
      title: "Payment Methods",
      href: "/dashboard/user/payment",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["user"],
    },
    {
      title: "Events",
      href: "/events",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["user", "seller", "admin"],
    },
    {
      title: "Seller Dashboard",
      href: "/dashboard/seller",
      icon: <BarChart3 className="h-5 w-5" />,
      roles: ["seller"],
    },
    {
      title: "Scan Tickets",
      href: "/dashboard/seller/scan",
      icon: <QrCode className="h-5 w-5" />,
      roles: ["seller"],
    },
    {
      title: "Payments",
      href: "/dashboard/seller/payments",
      icon: <Wallet className="h-5 w-5" />,
      roles: ["seller"],
    },
    {
      title: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Admin Setup",
      href: "/dashboard/admin/setup",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/dashboard/user/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["user", "seller", "admin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => {
    // If user role is in the item's roles array, show the item
    return item.roles.includes(user?.role || "user")
  })

  return (
    <div className="min-h-screen bg-tct-navy text-white">
      {/* Mobile Header */}
      <header className="lg:hidden bg-tct-navy border-b border-tct-cyan/20 p-4">
        <div className="flex items-center justify-between">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-tct-navy border-b border-tct-cyan/20">
          <nav className="flex flex-col p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive(item.href)
                    ? "bg-tct-magenta text-white"
                    : "hover:bg-tct-navy/50 text-gray-300 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex items-center justify-start px-4 py-2 text-gray-300 hover:text-white hover:bg-tct-navy/50"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </Button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-tct-navy border-r border-tct-cyan/20 min-h-screen">
          <div className="p-4">
            <Logo />
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive(item.href)
                    ? "bg-tct-magenta text-white"
                    : "hover:bg-tct-navy/50 text-gray-300 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-tct-cyan/20">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-tct-magenta flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || "User"}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-tct-navy/95">{children}</main>
      </div>
    </div>
  )
}
