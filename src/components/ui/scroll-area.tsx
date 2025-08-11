import * as React from "react";
import { cn } from "@/lib/utils";

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
));
ScrollBar.displayName = "ScrollBar";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  disableScrollbar?: boolean;
}

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  ScrollAreaProps
>(({ className, disableScrollbar, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-auto",
      disableScrollbar && "scrollbar-hide",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ScrollArea.displayName = "ScrollArea";

export { ScrollArea, ScrollBar };
