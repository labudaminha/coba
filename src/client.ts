export type Env = {
  BASE_API_URL: string;
  BASE_CIAM_URL: string;
  UA: string;
  BASIC_AUTH: string;
  API_KEY: string;
  CRYPTO_API: string;
  AX_DEVICE_ID?: string;
  AX_FP?: string;
};

function nowJavaLike(offsetHours = 7) {
  const now = new Date(Date.now() + offsetHours * 3600_000);
  const ms2 = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
  const iso = now.toISOString().replace("Z", "");
  // best effort offset (Workers default UTC, tapi kita append +07:00 agar mirip header lama)
  const tz = "+07:00";
  return `${iso.slice(0,19)}.${ms2}${tz}`;
}

export async function getOtp(contact: string, env: Env) {
  if (!/^628\d{7,11}$/.test(contact)) throw new Error("Nomor tidak valid");
  const url = `${env.BASE_CIAM_URL}/realms/xl-ciam/auth/otp`;
  const qs = new URLSearchParams({ contact, contactType: "SMS", alternateContact: "false" });
  const headers: Record<string,string> = {
    "accept-encoding": "gzip, deflate, br",
    "authorization": `Basic ${env.BASIC_AUTH}`,
    "user-agent": env.UA,
    "ax-request-at": nowJavaLike(7),
    "ax-request-id": crypto.randomUUID(),
  };
  if (env.AX_DEVICE_ID) headers["ax-device-id"] = env.AX_DEVICE_ID;
  if (env.AX_FP) headers["ax-fingerprint"] = env.AX_FP;

  const r = await fetch(`${url}?${qs.toString()}`, { method: "POST", headers });
  if (!r.ok) throw new Error(`OTP failed: ${r.status}`);
  return r.json();
}

export async function submitOtp(contact: string, otp: string, env: Env) {
  const url = `${env.BASE_CIAM_URL}/realms/xl-ciam/protocol/openid-connect/token`;
  const form = new URLSearchParams({ grant_type: "password", username: contact, password: otp, scope: "openid" });
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    "authorization": `Basic ${env.BASIC_AUTH}`,
    "user-agent": env.UA,
  };
  const r = await fetch(url, { method: "POST", headers, body: form });
  if (!r.ok) throw new Error(`Login failed: ${r.status}`);
  return r.json();
}
