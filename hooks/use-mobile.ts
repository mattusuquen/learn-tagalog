import * as React from "react"

const MOBILE_BREAKPOINT = 768

// matchMedia as an external store: no setState-in-effect, and SSR-safe via the
// server snapshot (false). The subscribe callback fires on viewport changes.
function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
