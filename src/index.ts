import { buildRouter } from "./routes";

const html = `<!doctype html>
<html data-theme="business" lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>ME-CLI Web • OTP & Login</title>
  <meta name="theme-color" content="#0b0f19">
  <!-- Tailwind Play CDN & daisyUI v5 -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css"/>
  <style type="text/tailwindcss">
    @layer utilities {
      .glass-card { @apply bg-base-200/60 backdrop-blur-xl border border-base-300/40 shadow-xl rounded-2xl; }
      .code { @apply font-mono text-xs px-2 py-1 rounded bg-base-300/70; }
    }
  </style>
</head>
<body class="min-h-dvh bg-gradient-to-b from-base-200 via-base-300 to-base-200 text-base-content">
  <header class="sticky top-0 z-10 backdrop-blur bg-base-100/60 border-b border-base-300/50">
    <div class="navbar container mx-auto">
      <div class="flex-1 gap-2">
        <span class="text-xl font-black tracking-tight">ME-CLI<span class="opacity-60"> Web</span></span>
        <span class="badge badge-outline hidden sm:inline">Cloudflare Worker</span>
      </div>
      <div class="flex-none gap-2">
        <label class="swap swap-rotate">
          <input id="themeToggle" type="checkbox"/>
          <svg class="swap-off h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15a5 5 0 100-10 5 5 0 000 10z"/><path fill-rule="evenodd" d="M10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3.22 4.64a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42zm11.36 11.36a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42zM1 11a1 1 0 100-2h-1a1 1 0 100 2h1zm19-2a1 1 0 110 2h-1a1 1 0 110-2h1zM3.22 15.36a1 1 0 010 1.42l-.7.7a1 1 0 01-1.42-1.42l.7-.7a1 1 0 011.42 0zm14-11.36a1 1 0 010 1.42l-.7.7a1 1 0 01-1.42-1.42l.7-.7a1 1 0 011.42 0z" clip-rule="evenodd"/></svg>
          <svg class="swap-on h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 107.446 5.03 6 6 0 11-7.416-7.4A7.97 7.97 0 0010 2z"/></svg>
        </label>
        <a class="btn btn-primary btn-sm" href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer">Dashboard</a>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-4 py-8">
    <section class="grid lg:grid-cols-2 gap-6 items-start">
      <!-- Left: Hero / About -->
      <article class="glass-card p-6">
        <h1 class="text-2xl font-extrabold">OTP & Login Gateway</h1>
        <p class="mt-2 opacity-80">
          UI ini membungkus endpoint <span class="code">/api/otp</span> & <span class="code">/api/login</span> di Cloudflare Worker.
          Cocok buat replace CLI jadi layanan web ringan di edge.
        </p>
        <ul class="mt-4 space-y-2">
          <li class="flex items-center gap-2"><span class="badge badge-success badge-sm"></span> Edge-native, cepat, tanpa server.</li>
          <li class="flex items-center gap-2"><span class="badge badge-info badge-sm"></span> Validasi nomor <span class="code">628…</span> + feedback realtime.</li>
          <li class="flex items-center gap-2"><span class="badge badge-warning badge-sm"></span> Aman: header sensitif & secrets disimpan di Worker env.</li>
        </ul>
        <div class="mt-6 grid sm:grid-cols-2 gap-3">
          <a class="btn btn-outline" href="https://developers.cloudflare.com/workers/examples/return-html/" target="_blank" rel="noreferrer">Contoh HTML Worker</a>
          <a class="btn btn-outline" href="https://daisyui.com/docs/cdn/?lang=en" target="_blank" rel="noreferrer">daisyUI CDN</a>
        </div>
      </article>

      <!-- Right: Form Card -->
      <article class="glass-card p-6">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-xl font-bold">Masuk dengan OTP</h2>
          <div class="join">
            <button id="step1Tab" class="btn btn-sm join-item btn-primary">1. Minta OTP</button>
            <button id="step2Tab" class="btn btn-sm join-item btn-ghost">2. Verifikasi</button>
          </div>
        </div>

        <div id="step1" class="mt-4 space-y-4">
          <label class="form-control">
            <div class="label"><span class="label-text">Nomor XL (format 628…)</span></div>
            <input id="phone" type="tel" inputmode="numeric" placeholder="62812xxxxxxxx" class="input input-bordered w-full" />
          </label>
          <button id="requestOtpBtn" class="btn btn-primary w-full">
            <span class="loading loading-spinner loading-sm hidden" id="otpLoading"></span>
            Kirim OTP
          </button>
          <p class="text-sm opacity-70">Dengan menekan tombol ini, sistem akan memanggil <span class="code">/api/otp</span>.</p>
        </div>

        <div id="step2" class="mt-4 space-y-4 hidden">
          <div class="grid sm:grid-cols-2 gap-3">
            <label class="form-control">
              <div class="label"><span class="label-text">Nomor</span></div>
              <input id="phone2" type="tel" inputmode="numeric" class="input input-bordered w-full" placeholder="62812xxxxxxxx" />
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">OTP</span></div>
              <input id="otp" type="text" inputmode="numeric" maxlength="8" class="input input-bordered w-full" placeholder="6 digit" />
            </label>
          </div>
          <button id="verifyBtn" class="btn btn-success w-full">
            <span class="loading loading-spinner loading-sm hidden" id="verifyLoading"></span>
            Verifikasi & Login
          </button>
          <details class="collapse collapse-arrow">
            <summary class="collapse-title text-sm">Hasil token</summary>
            <div class="collapse-content">
              <pre id="resultBox" class="mt-2 p-3 overflow-auto rounded bg-base-300/60 text-xs"></pre>
            </div>
          </details>
        </div>
      </article>
    </section>

    <section class="mt-8">
      <article class="glass-card p-6">
        <h3 class="font-bold">Catatan</h3>
        <ol class="list-decimal pl-5 mt-2 space-y-1 text-sm opacity-80">
          <li>Pastikan <span class="code">BASIC_AUTH</span>, <span class="code">API_KEY</span>, dan <span class="code">CRYPTO_API</span> sudah di-set sebagai <em>secrets</em> Worker.</li>
          <li>Endpoint backend ada di Worker ini: <span class="code">/api/otp</span> dan <span class="code">/api/login</span>.</li>
          <li>UI ini hanya memanggil API internal (edge), tidak menyimpan data di browser.</li>
        </ol>
      </article>
    </section>
  </main>

  <div id="toast" class="toast toast-end"></div>

  <script>
    const $ = (q) => document.querySelector(q);
    const showToast = (msg, type="info") => {
      const t = document.createElement("div");
      t.className = "alert " + (type === "success" ? "alert-success" : type === "error" ? "alert-error" : "alert-info");
      t.innerHTML = '<span>' + msg + '</span>';
      $("#toast").appendChild(t);
      setTimeout(() => t.remove(), 4000);
    };

    const phoneRe = /^628\\d{7,11}$/;

    // Tabs
    $("#step1Tab").addEventListener("click", () => {
      $("#step1").classList.remove("hidden");
      $("#step2").classList.add("hidden");
      $("#step1Tab").classList.add("btn-primary"); $("#step2Tab").classList.remove("btn-primary");
    });
    $("#step2Tab").addEventListener("click", () => {
      $("#step2").classList.remove("hidden");
      $("#step1").classList.add("hidden");
      $("#step2Tab").classList.add("btn-primary"); $("#step1Tab").classList.remove("btn-primary");
    });

    // Theme toggle
    const themeEl = document.documentElement;
    $("#themeToggle").addEventListener("change", (e) => {
      themeEl.setAttribute("data-theme", e.target.checked ? "dracula" : "business");
    });

    // Request OTP
    $("#requestOtpBtn").addEventListener("click", async () => {
      const phone = $("#phone").value.trim();
      if (!phoneRe.test(phone)) {
        showToast("Format nomor harus 628… dengan panjang valid.", "error"); return;
      }
      $("#otpLoading").classList.remove("hidden");
      try {
        const r = await fetch("/api/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contact: phone }) });
        if (!r.ok) { throw new Error("Gagal minta OTP: " + r.status); }
        const data = await r.json();
        showToast("OTP terkirim. Cek SMS kamu.", "success");
        // Auto isi di step 2
        $("#phone2").value = phone;
        $("#step2Tab").click();
      } catch (e) {
        console.error(e); showToast(e.message || "Gagal minta OTP", "error");
      } finally {
        $("#otpLoading").classList.add("hidden");
      }
    });

    // Verify OTP
    $("#verifyBtn").addEventListener("click", async () => {
      const phone = $("#phone2").value.trim();
      const otp = $("#otp").value.trim();
      if (!phoneRe.test(phone)) { showToast("Nomor tidak valid.", "error"); return; }
      if (!/^\\d{4,8}$/.test(otp)) { showToast("OTP tidak valid.", "error"); return; }
      $("#verifyLoading").classList.remove("hidden");
      try {
        const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contact: phone, otp }) });
        if (!r.ok) { throw new Error("Login gagal: " + r.status); }
        const data = await r.json();
        $("#resultBox").textContent = JSON.stringify(data, null, 2);
        showToast("Berhasil login. Token ditampilkan.", "success");
      } catch (e) {
        console.error(e); showToast(e.message || "Verifikasi gagal", "error");
      } finally {
        $("#verifyLoading").classList.add("hidden");
      }
    });
  </script>
</body>
</html>`;

export default {
  async fetch(req: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(req.url);
    // Serve UI at "/"
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    // Delegate API routes
    const router = buildRouter();
    return router.handle(req, env);
  },
};
