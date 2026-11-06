"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type State = "checking" | "up" | "down";

/** Hubi in API-ga iyo CORS-ku shaqeeyaan: GET {API}/health/ready. */
export default function ApiStatus() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API_URL}/health/ready`, { signal: ctrl.signal, cache: "no-store" })
      .then((r) => setState(r.ok ? "up" : "down"))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setState("down");
      });
    return () => ctrl.abort();
  }, []);

  const label = { checking: "Hubinaya…", up: "API + DB waa nool yihiin", down: "API/DB lama gaadhi karo" }[state];
  const cls = { checking: "wait", up: "ok", down: "bad" }[state];
  return <span className={`badge ${cls}`}>{label}</span>;
}
