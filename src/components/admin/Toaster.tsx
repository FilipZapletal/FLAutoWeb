"use client";

import { useEffect, useState } from "react";

const EVENT = "admin:toast";

/** Krátká zpráva dole na obrazovce (např. „Vůz byl označen jako Rezervováno“). Volá se odkudkoli v administraci. */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 5000);
    };
    window.addEventListener(EVENT, onToast);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(EVENT, onToast);
    };
  }, []);

  if (!message) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto w-fit max-w-md rounded-full border border-line bg-card px-5 py-3 text-center text-sm shadow-xl">
      {message}
    </div>
  );
}
