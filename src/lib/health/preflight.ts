export async function assertAppHealthy() {
  const endpoints = [
    '/api/sessions',
    '/api/metrics/summary',
  ];
  for (const p of endpoints) {
    const res = await fetch(p);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new Error(`Preflight failed for ${p}: ${res.status} ${res.statusText}`);
    }
  }
  return true;
}