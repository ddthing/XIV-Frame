"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type TabValue = string | number

interface TabsContextValue {
  value: TabValue | null
  baseId: string
  orientation: "horizontal" | "vertical"
  listRef: React.RefObject<HTMLDivElement | null>
  select: (value: TabValue) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("Tabs components must be used within Tabs.")
  }

  return context
}

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: TabValue | null
  defaultValue?: TabValue | null
  orientation?: "horizontal" | "vertical"
  onValueChange?: (value: TabValue) => void
}

function Tabs({
  className,
  orientation = "horizontal",
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<TabValue | null>(defaultValue)
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const baseId = React.useId().replace(/:/g, "")
  const value = controlledValue === undefined ? uncontrolledValue : controlledValue

  const select = React.useCallback((nextValue: TabValue) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(nextValue)
    }
    onValueChange?.(nextValue)
  }, [controlledValue, onValueChange])

  const contextValue = React.useMemo(() => ({
    value,
    baseId,
    orientation,
    listRef,
    select,
  }), [baseId, orientation, select, value])

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        data-horizontal={orientation === "horizontal" ? "" : undefined}
        data-vertical={orientation === "vertical" ? "" : undefined}
        className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list flex max-w-full items-center justify-center rounded-none p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tabsListVariants> {}

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsListProps) {
  const { listRef, orientation } = useTabsContext()

  return (
    <div
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      role="tablist"
      aria-orientation={orientation}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

interface TabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: TabValue
}

function TabsTrigger({ className, value: tabValue, children, onClick, onKeyDown, ...props }: TabsTriggerProps) {
  const { value, baseId, listRef, select } = useTabsContext()
  const active = Object.is(value, tabValue)
  const valueId = String(tabValue).replace(/[^a-zA-Z0-9_-]/g, "-")
  const tabId = `${baseId}-tab-${valueId}`
  const panelId = `${baseId}-panel-${valueId}`

  const handleSelect = () => select(tabValue)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleSelect()
      return
    }

    if (!listRef.current || !["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      return
    }

    const tabs = Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'))
    const currentIndex = tabs.indexOf(event.currentTarget)
    if (currentIndex < 0 || tabs.length === 0) return

    let nextIndex = currentIndex
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = tabs.length - 1
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % tabs.length
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length

    event.preventDefault()
    tabs[nextIndex]?.focus()
  }

  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      data-active={active ? "" : undefined}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-none border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && !props.disabled) handleSelect()
      }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabValue
}

function TabsContent({ className, value: panelValue, children, ...props }: TabsContentProps) {
  const { value, baseId } = useTabsContext()
  const active = Object.is(value, panelValue)
  const valueId = String(panelValue).replace(/[^a-zA-Z0-9_-]/g, "-")

  if (!active) return null

  return (
    <div
      {...props}
      data-slot="tabs-content"
      role="tabpanel"
      id={`${baseId}-panel-${valueId}`}
      aria-labelledby={`${baseId}-tab-${valueId}`}
      tabIndex={0}
      className={cn("flex-1 text-xs/relaxed outline-none", className)}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
