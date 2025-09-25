import { getOtp, submitOtp } from "./client";
import { signAx } from "./crypto-remote";

export function buildRouter() {
  return {
    async handle(req: Request, env: any): Promise<Response> {
      const url = new URL(req.url);

      if (url.pathname === "/api/otp" && req.method === "POST") {
        const { contact } = await req.json();
        // Dapatkan fingerprint/deviceId via layanan kripto (opsional, kalau header ini diwajibkan upstream)
        try {
          const ax = await signAx(env.CRYPTO_API, env.API_KEY, { ua: env.UA });
          env.AX_DEVICE_ID = ax.axDeviceId;
          env.AX_FP = ax.axFingerprint;
        } catch { /* jika tidak wajib, boleh diabaikan */ }
        const out = await getOtp(contact, env);
        return Response.json(out);
      }

      if (url.pathname === "/api/login" && req.method === "POST") {
        const { contact, otp } = await req.json();
        const out = await submitOtp(contact, otp, env);
        return Response.json(out);
      }

      return new Response("Not found", { status: 404 });
    }
  };
}
