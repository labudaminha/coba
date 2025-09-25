export async function encryptSignXData(apiBase: string, apiKey: string, payload: unknown) {
  const r = await fetch(`${apiBase}/encryptsign`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(payload ?? {}),
  });
  if (!r.ok) throw new Error(`encryptsign failed: ${r.status}`);
  return r.json();
}

export async function signAx(apiBase: string, apiKey: string, deviceInfo: any) {
  const r = await fetch(`${apiBase}/sign-ax`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(deviceInfo ?? {}),
  });
  if (!r.ok) throw new Error(`sign-ax failed: ${r.status}`);
  return r.json();
}
