"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Memisahkan memuat/gagal/kosong dan mengabaikan respons permintaan lama. */
export function useResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(false);
    try {
      const result = await loader();
      if (id === requestId.current) setData(result);
    } catch {
      if (id === requestId.current) setError(true);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void reload();
    return () => { requestId.current += 1; };
  }, [reload]);

  return { data, loading, error, reload };
}
