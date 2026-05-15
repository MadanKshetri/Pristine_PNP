import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";

export function StoreResetListener() {
  const pathname = usePathname();
  const { shouldResetOnNavigate, resetAll, setShouldResetOnNavigate } =
    useActivityFilters();

  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      if (shouldResetOnNavigate) {
        resetAll(false);
      } else {
        setShouldResetOnNavigate(true);
      }

      prevPath.current = pathname;
    }
  }, [pathname]);

  return null;
}
