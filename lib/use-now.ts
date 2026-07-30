"use client";

import { useSyncExternalStore } from "react";

/**
 * ساعة الحائط كمصدر خارجي — وهي فعلاً كذلك.
 * ساعة واحدة مشتركة لكل من يشترك، بدل مؤقّت داخل كل بطاقة.
 * يعيد null أثناء التصيير على الخادم، فلا يختلف ما يرسمه الخادم عن المتصفح.
 */

const TICK_MS = 30_000;

let current = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (timer === null) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      for (const l of listeners) l();
    }, TICK_MS);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// لقطة مستقرة: لا تتغيّر إلا عند النبضة، وإلا لأعادت React التصيير بلا نهاية.
const getSnapshot = (): number => (current === 0 ? (current = Date.now()) : current);
const getServerSnapshot = (): null => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
