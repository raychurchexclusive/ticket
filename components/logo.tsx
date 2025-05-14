import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function Logo({ className = "", showText = false, size = "lg" }: LogoProps) {
  const sizes = {
    sm: { container: "h-8", logo: 32 },
    md: { container: "h-12", logo: 48 },
    lg: { container: "h-16", logo: 64 },
    xl: { container: "h-20", logo: 80 },
    "2xl": { container: "h-24", logo: 96 },
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizes[size].container}`}>
        <Image
          src="/logo.png"
          alt="Top City Tickets Logo"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="object-contain"
          priority
        />
      </div>
      {showText && <span className="font-bold hidden sm:inline-block text-white">Top City Tickets</span>}
    </Link>
  )
}
