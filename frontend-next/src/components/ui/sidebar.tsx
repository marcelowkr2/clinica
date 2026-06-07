'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "13rem"
const SIDEBAR_WIDTH_MOBILE = "15rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultState?: "expanded" | "collapsed"
  }
>(({ children, defaultState = "expanded", ...props }, ref) => {
  const [isMounted, setIsMounted] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [state, setState] = React.useState<"expanded" | "collapsed">(defaultState)
  const [open, setOpen] = React.useState(true)
  const [openMobile, setOpenMobile] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      const savedState = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split("=")[1]

      if (savedState) {
        setState(savedState as "expanded" | "collapsed")
      }
    }
  }, [isMounted])

  React.useEffect(() => {
    if (isMounted) {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }
  }, [isMounted, state])

  React.useEffect(() => {
    if (isMounted) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          toggleSidebar()
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMounted, state])

  const toggleSidebar = React.useCallback(() => {
    setState((prevState) =>
      prevState === "expanded" ? "collapsed" : "expanded"
    )
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-[auto_1fr] h-full w-full"
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

const sidebarVariants = cva(
  "group relative flex h-full flex-col overflow-hidden border-r bg-background data-[state=expanded]:w-[var(--sidebar-width)] data-[state=collapsed]:w-[var(--sidebar-width-icon)] transition-[width] duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-r",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  defaultCollapsed?: boolean
  showToggle?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, showToggle = true, ...props }, ref) => {
    const { state, openMobile, setOpenMobile, isMobile } = useSidebar()

    return (
      <>
        <style jsx global>{`
          :root {
            --sidebar-width: ${SIDEBAR_WIDTH};
            --sidebar-width-mobile: ${SIDEBAR_WIDTH_MOBILE};
            --sidebar-width-icon: ${SIDEBAR_WIDTH_ICON};
          }
        `}</style>
        {isMobile ? (
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent side="left" className="p-0 w-[var(--sidebar-width-mobile)]">
              <nav
                ref={ref}
                data-state={state}
                className={cn(sidebarVariants({ variant, className }))}
                {...props}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <nav
            ref={ref}
            data-state={state}
            className={cn(sidebarVariants({ variant, className }))}
            {...props}
          />
        )}
      </>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-14 items-center px-4 py-2",
        state === "collapsed" && "justify-center px-2",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "flex items-center gap-2 font-semibold transition-[opacity,transform] duration-300 ease-in-out",
        state === "collapsed" && "scale-0 opacity-0 data-[state=collapsed]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarHeaderTitle.displayName = "SidebarHeaderTitle"

const SidebarHeaderIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "flex items-center transition-[width] duration-300 ease-in-out",
        state === "expanded" && "w-5",
        state === "collapsed" && "w-full justify-center",
        className
      )}
      {...props}
    />
  )
})
SidebarHeaderIcon.displayName = "SidebarHeaderIcon"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      onClick={() => {
        if (isMobile) {
          setOpenMobile(true)
        } else {
          toggleSidebar()
        }
      }}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarSearch = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      className={cn(
        "px-4 py-2 transition-[padding] duration-300 ease-in-out",
        state === "collapsed" && "px-2",
        className
      )}
      {...props}
    >
      <div
        data-state={state}
        className={cn(
          "relative transition-[opacity] duration-300 ease-in-out",
          state === "collapsed" && "opacity-0"
        )}
      >
        <Input
          placeholder="Search..."
          className="w-full"
          disabled={state === "collapsed"}
        />
      </div>
    </div>
  )
})
SidebarSearch.displayName = "SidebarSearch"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto py-2", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mt-auto px-4 py-4", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid gap-1 px-2 group-[[data-state=collapsed]]:px-1", className)}
      {...props}
    />
  )
})
SidebarNav.displayName = "SidebarNav"

const SidebarNavHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "flex items-center gap-4 px-4 py-2 transition-[padding] duration-300 ease-in-out",
        state === "collapsed" && "justify-center px-2",
        className
      )}
      {...props}
    />
  )
})
SidebarNavHeader.displayName = "SidebarNavHeader"

const SidebarNavHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "text-xs font-medium text-muted-foreground transition-[opacity] duration-300 ease-in-out",
        state === "collapsed" && "opacity-0 hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarNavHeaderTitle.displayName = "SidebarNavHeaderTitle"

const SidebarNavLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean
    icon?: React.ReactNode
    title: string
    label?: string
    showTitleOnCollapse?: boolean
  }
>(({ className, active, icon, title, label, showTitleOnCollapse, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <a
            ref={ref}
            className={cn(
              "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent text-accent-foreground",
              state === "collapsed" && "justify-center px-2",
              className
            )}
            {...props}
          >
            {icon && (
              <span className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground">
                {icon}
              </span>
            )}
            <span
              data-state={state}
              className={cn(
                "transition-[opacity,transform] duration-300 ease-in-out",
                state === "collapsed" && !showTitleOnCollapse && "scale-0 opacity-0 hidden",
                state === "collapsed" && showTitleOnCollapse && "absolute left-full ml-6 w-max opacity-0 group-hover:opacity-100"
              )}
            >
              {title}
            </span>
            {label && (
              <span
                data-state={state}
                className={cn(
                  "ml-auto transition-[opacity] duration-300 ease-in-out",
                  state === "collapsed" && "opacity-0 hidden"
                )}
              >
                {label}
              </span>
            )}
          </a>
        </TooltipTrigger>
        {state === "collapsed" && !showTitleOnCollapse && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
            {label && <span className="ml-auto">{label}</span>}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
})
SidebarNavLink.displayName = "SidebarNavLink"

const SidebarNavSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("py-2", className)} {...props}>
      <Separator />
    </div>
  )
})
SidebarNavSeparator.displayName = "SidebarNavSeparator"

const SidebarNavSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-x-3 rounded-md px-3 py-2",
        state === "collapsed" && "justify-center px-2",
        className
      )}
      {...props}
    >
      <Skeleton className="h-5 w-5 shrink-0" />
      <Skeleton
        data-state={state}
        className={cn(
          "h-4 transition-[width,opacity] duration-300 ease-in-out",
          state === "expanded" ? "w-[120px] opacity-100" : "w-0 opacity-0"
        )}
      />
    </div>
  )
})
SidebarNavSkeleton.displayName = "SidebarNavSkeleton"

const SidebarNavItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode
    title: string
    label?: string
    asChild?: boolean
  }
>(({ className, icon, title, label, asChild = false, ...props }, ref) => {
  const { state } = useSidebar()
  const Comp = asChild ? Slot : "div"

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Comp
            ref={ref}
            className={cn(
              "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              state === "collapsed" && "justify-center px-2",
              className
            )}
            {...props}
          >
            {icon && (
              <span className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground">
                {icon}
              </span>
            )}
            <span
              data-state={state}
              className={cn(
                "transition-[opacity,transform] duration-300 ease-in-out",
                state === "collapsed" && "scale-0 opacity-0 hidden"
              )}
            >
              {title}
            </span>
            {label && (
              <span
                data-state={state}
                className={cn(
                  "ml-auto transition-[opacity] duration-300 ease-in-out",
                  state === "collapsed" && "opacity-0 hidden"
                )}
              >
                {label}
              </span>
            )}
          </Comp>
        </TooltipTrigger>
        {state === "collapsed" && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
            {label && <span className="ml-auto">{label}</span>}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
})
SidebarNavItem.displayName = "SidebarNavItem"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarHeaderIcon,
  SidebarHeaderTitle,
  SidebarNav,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavItem,
  SidebarNavLink,
  SidebarNavSeparator,
  SidebarNavSkeleton,
  SidebarProvider,
  SidebarSearch,
  SidebarTrigger,
  useSidebar,
}
