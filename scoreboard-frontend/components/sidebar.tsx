"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Upload,
  FileBarChart2,
  AlertTriangle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed.toString())
  }, [isCollapsed])

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      color: "text-emerald-500",
    },
    {
      label: "Upload Data",
      icon: Upload,
      href: "/",
      color: "text-blue-500",
    },
    {
      label: "Beneficiaries",
      icon: Users,
      href: "/beneficiaries",
      color: "text-violet-500",
    },
    {
      label: "Reports",
      icon: FileBarChart2,
      href: "/reports",
      color: "text-orange-500",
    },
    {
      label: "Anomalies",
      icon: AlertTriangle,
      href: "/anomalies",
      color: "text-amber-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      color: "text-gray-500",
    },
  ]

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  <span className="text-xl font-bold">WelfareCast</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="px-2 py-4">
                <nav className="flex flex-col gap-1">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                        pathname === route.href ? "bg-gray-100 font-medium" : "text-gray-500",
                      )}
                    >
                      <route.icon className={cn("h-5 w-5", route.color)} />
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
            <div className="border-t px-2 py-4">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="rounded-full bg-gray-100 p-1">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-gray-500">admin@welfare.gov</p>
                  </div>
                </div>
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            "hidden md:flex h-screen flex-col border-r bg-white transition-all duration-300",
            isCollapsed ? "w-[70px]" : "w-[250px]",
            className,
          )}
        >
          <div
            className={cn(
              "px-6 py-4 border-b flex items-center",
              isCollapsed ? "justify-center px-2" : "justify-between",
            )}
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              <BarChart3 className="h-6 w-6 text-emerald-600 shrink-0" />
              {!isCollapsed && <span className="text-xl font-bold whitespace-nowrap">WelfareCast</span>}
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={toggleCollapsed}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className={cn("py-4", isCollapsed ? "px-2" : "px-2")}>
              <nav className="flex flex-col gap-1">
                {routes.map((route) => (
                  <Tooltip key={route.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg transition-all hover:bg-gray-100",
                          isCollapsed ? "justify-center p-2" : "px-3 py-2",
                          pathname === route.href ? "bg-gray-100 font-medium" : "text-gray-500",
                        )}
                      >
                        <route.icon className={cn("h-5 w-5", route.color)} />
                        {!isCollapsed && <span className="text-sm">{route.label}</span>}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" hidden={!isCollapsed}>
                      {route.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </nav>
            </div>
          </ScrollArea>
          <div className="border-t py-4">
            <div className={cn("flex items-center gap-3 rounded-lg", isCollapsed ? "px-2 justify-center" : "px-3")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3 flex-1")}>
                    <div className="rounded-full bg-gray-100 p-1 shrink-0">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@welfare.gov</p>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" hidden={!isCollapsed}>
                  <p>Admin User</p>
                  <p className="text-xs text-gray-500">admin@welfare.gov</p>
                </TooltipContent>
              </Tooltip>
              {!isCollapsed && (
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Mobile Toggle Button (Fixed Position) */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40 bg-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
