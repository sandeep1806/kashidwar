"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { URL_EVENT } from "@/components/motion/HashLinks";

const FestivalMonthFilter = dynamic(() => import("./FestivalMonthFilter"), { ssr: false });

const wantsMonth = () => /^#festivals\/\w+$/.test(window.location.hash);

/**
 * The festival calendar's filter, loaded only when it has something to do:
 * the URL already names a month, or a month is tapped (<HashLinks> rewrites
 * the hash and fires URL_EVENT). Until then the page ships no filter code.
 */
export default function LazyMonthFilter() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => {
      if (wantsMonth()) setOn(true);
    };
    const id = requestAnimationFrame(check);
    window.addEventListener(URL_EVENT, check);
    window.addEventListener("hashchange", check);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener(URL_EVENT, check);
      window.removeEventListener("hashchange", check);
    };
  }, []);
  return on ? <FestivalMonthFilter /> : null;
}
