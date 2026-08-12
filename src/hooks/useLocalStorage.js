import { useEffect, useState } from "react";

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — fail silently, data stays in memory for this session
    }
  }, [key, value]);

  return [value, setValue];
}
