import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";

export function StoreResetListener() {
  const pathname = usePathname();
  const { shouldResetOnNavigate, resetAll, setShouldResetOnNavigate } =
    useActivityFilters();

  const prevPath = useRef(pathname);

  console.log("StoreResetListener: mounted with path", pathname);

  useEffect(() => {
    console.log("StoreResetListener: path changed to", pathname);
    if (prevPath.current !== pathname) {
      if (shouldResetOnNavigate) {
        console.log("StoreResetListener: resetting store due to navigation");
        resetAll(false);
      } else {
        setShouldResetOnNavigate(true);
      }

      prevPath.current = pathname;
    }
  }, [pathname]);

  return null;
}
