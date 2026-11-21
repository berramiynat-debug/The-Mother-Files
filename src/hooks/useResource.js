import { useEffect, useState } from 'react';

export function useResource(key, load) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!key) return undefined;
    let active = true;
    Promise.resolve().then(load).then(
      (data) => { if (active) setResult({ key, version, data }); },
      (error) => { if (active) setResult({ key, version, error }); },
    );
    return () => { active = false; };
  }, [key, version, load]);

  const current = result?.key === key && result.version === version ? result : null;
  return { data: current?.data, error: current?.error, loading: Boolean(key) && !current, retry: () => setVersion((value) => value + 1) };
}
