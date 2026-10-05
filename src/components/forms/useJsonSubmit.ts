"use client";

import { useState } from "react";

type State = { status: "idle" | "sending" | "done"; error: string | null; fields: Record<string, string> };

/** Odeslání JSON na API s chybami polí ze serverové validace. */
export function useJsonSubmit(url: string, method: "POST" | "PUT" = "POST") {
  const [state, setState] = useState<State>({ status: "idle", error: null, fields: {} });

  async function submit(body: unknown) {
    setState({ status: "sending", error: null, fields: {} });
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "idle", error: data.error ?? "Něco se nepovedlo, zkuste to prosím znovu.", fields: data.fields ?? {} });
        return null;
      }
      setState({ status: "done", error: null, fields: {} });
      return data;
    } catch {
      setState({ status: "idle", error: "Nepodařilo se spojit se serverem. Zkontrolujte připojení.", fields: {} });
      return null;
    }
  }

  const reset = () => setState({ status: "idle", error: null, fields: {} });
  return { ...state, submit, reset, sending: state.status === "sending", done: state.status === "done" };
}
