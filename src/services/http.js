const cached = new Map();
const inFlight = new Map();

export class ProviderError extends Error {
  constructor(source, detail, status = 0) {
    super(detail);
    this.source = source;
    this.status = status;
  }
}

async function fetchJson(url, source, { timeout, retries, signal, ...options }) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    let error;
    try {
      const deadline = AbortSignal.timeout(timeout);
      const res = await fetch(url, { ...options, signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
        headers: { Accept: 'application/json', ...options.headers } });
      if (!res.ok) throw new ProviderError(source, 'The provider returned HTTP ' + res.status + '.', res.status);
      return await res.json();
    } catch (cause) {
      if (signal?.aborted) throw cause;
      error = cause instanceof ProviderError ? cause : new ProviderError(source, 'The provider did not return readable data.');
    }
    if (attempt === retries || (error.status >= 400 && error.status < 500 && error.status !== 429)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
  }
}

export function postJson(url, source, body, { signal, timeout = 6500 } = {}) {
  return fetchJson(url, source, { timeout, retries: 0, signal, method: 'POST',
    body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
}

export async function request(url, source, { ttl = 300_000, timeout = 6500, retries = 1 } = {}) {
  const entry = cached.get(url);
  if (ttl > 0 && entry?.until > Date.now()) return entry.data;
  if (ttl > 0 && inFlight.has(url)) return inFlight.get(url);
  const task = fetchJson(url, source, { timeout, retries });
  if (ttl > 0) inFlight.set(url, task);
  try {
    const data = await task;
    if (ttl > 0) cached.set(url, { data, until: Date.now() + ttl });
    return data;
  } finally {
    if (ttl > 0) inFlight.delete(url);
  }
}
