(() => {
  const C = window.CM_CONFIG, D = window.CM_DATA, API = window.CM_API;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bg = c => /^(https?:|assets\/|\/)/.test(c || "") ? `url("${esc(c)}") center/cover` : (c || "#155EEF");
  const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

  // Instagram icon links (only social link on the site)
  const IG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';
  $$("[data-ig]").forEach(a => { a.href = C.INSTAGRAM_URL; a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", "Visit Compact Media on Instagram"); a.innerHTML = IG; });

  // WhatsApp buttons stay hidden until a real number is configured
  $$("[data-wa]").forEach(a => { if (C.WHATSAPP_NUMBER) { a.href = "https://wa.me/" + C.WHATSAPP_NUMBER; a.target = "_blank"; a.rel = "noopener noreferrer" } else a.hidden = true });

  // Nav
  const nav = $("#nav"), lk = $("#lk"), bgBtn = $("#bg");
  addEventListener("scroll", () => nav.classList.toggle("s", scrollY > 40), { passive: true });
  bgBtn.onclick = () => { const o = lk.classList.toggle("open"); bgBtn.setAttribute("aria-expanded", o) };
  lk.onclick = e => { if (e.target.closest("a")) { lk.classList.remove("open"); bgBtn.setAttribute("aria-expanded", "false") } };
  const links = $$(".links a:not(.btn):not(.ig)");
  const so = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) links.forEach(a => a.classList.toggle("on", a.hash == "#" + x.target.id)) }), { rootMargin: "-45% 0px -50% 0px" });
  ["home", "about", "services", "work", "testimonials"].forEach(i => so.observe($("#" + i)));
  const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add("in")), { threshold: .15 });
  $$(".rv").forEach(x => io.observe(x));

  // Services + form dropdown (single source: data.js)
  const sv = $("#sv"), sel = $("#f_service"), rsel = $("#r_service");
  D.services.forEach((s, i) => {
    sv.insertAdjacentHTML("beforeend", `<button aria-expanded="false"><span>${String(i + 1).padStart(2, "0")}</span><b>${esc(s.name)}</b><em>+</em></button><div class="d"><p>${esc(s.desc)}</p></div>`);
    sel.add(new Option(s.name, s.name)); rsel.add(new Option(s.name, s.name));
  });
  sv.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const o = b.classList.contains("o"); sv.querySelectorAll("button").forEach(x => { x.classList.remove("o"); x.setAttribute("aria-expanded", "false") }); if (!o) { b.classList.add("o"); b.setAttribute("aria-expanded", "true") } });

  // Detail dialog
  const det = $("#det"), db = $("#db");
  $("#dc").onclick = () => det.close();
  det.addEventListener("click", e => { if (e.target === det) det.close() });
  const sec = (h, t) => t ? `<h4>${h}</h4><p>${esc(t)}</p>` : "";

  // Work
  let projects = [], cat = "All";
  const fl = $("#fl"), gr = $("#gr");
  const drawWork = () => {
    const list = projects.map((p, k) => [p, k]).filter(([p]) => cat == "All" || p.category == cat);
    gr.innerHTML = list.map(([p, k]) => `<a class="pj" href="#" data-k="${k}" style="--g:${bg(p.cover)}" aria-label="${esc(p.title)}">${p.demo ? '<span class="demo">DEMO</span>' : ""}<div><div class="tag">${esc(p.category)}</div><h3>${esc(p.title)} ↗</h3>${p.client ? `<small>${esc(p.client)}</small>` : ""}</div></a>`).join("") || `<div class="empty-t" style="grid-column:1/-1"><h3>${projects.length ? "No projects in this category yet." : "Our work is on its way."}</h3><a class="btn" href="#contact">Start a project</a></div>`;
  };
  gr.addEventListener("click", e => {
    const a = e.target.closest(".pj"); if (!a) return; e.preventDefault(); const p = projects[+a.dataset.k];
    const imgs = (p.images && p.images.length ? p.images : [p.cover, p.cover, p.cover]);
    db.innerHTML = `<div class="tag">${esc(p.category)}${p.demo ? " · DEMO" : ""}</div><h3>${esc(p.title)}</h3><div class="gal">${imgs.map(i => `<i style="background:${bg(i)}"></i>`).join("")}</div>${sec("Client", p.client)}${sec("Overview", p.description)}${sec("Challenge", p.challenge)}${sec("Strategy", p.strategy)}${sec("Execution", p.execution)}${sec("Outcome", p.outcome)}${p.videoUrl ? `<p style="margin-top:18px"><a class="btn ghost" href="${esc(p.videoUrl)}" target="_blank" rel="noopener noreferrer">Watch video ↗</a></p>` : ""}<p style="margin-top:26px"><a class="btn" href="#contact" id="dgo">Start a similar project</a></p>`;
    det.showModal();
  });
  db.addEventListener("click", e => { if (e.target.id == "dgo") det.close() });
  ["All", ...D.categories].forEach((c, i) => fl.insertAdjacentHTML("beforeend", `<button class="${i ? "" : "on"}">${c}</button>`));
  fl.onclick = e => { if (e.target.tagName != "BUTTON") return; $$("#fl button").forEach(b => b.classList.remove("on")); e.target.classList.add("on"); cat = e.target.textContent; drawWork() };
  const loadWork = () => { gr.innerHTML = '<p class="loadmsg">Loading work…</p>'; API.getProjects().then(r => { projects = r; drawWork() }).catch(() => { gr.innerHTML = '<div class="empty-t" style="grid-column:1/-1"><h3>We couldn’t load our work right now.</h3><button class="btn" id="rw">Try again</button></div>'; $("#rw").onclick = loadWork }) };
  loadWork();

  // Testimonials
  let tests = [];
  const tbox = $("#tbox");
  const init = n => (n || "?").trim().charAt(0).toUpperCase();
  const avatar = t => `<div class="av" ${t.avatar ? `style="background-image:url('${esc(t.avatar)}')"` : ""} aria-hidden="true">${t.avatar ? "" : esc(init(t.name))}</div>`;
  const who = t => `<div class="au">${avatar(t)}<div><b>${esc(t.name)}</b><small>${[t.business, t.service].filter(Boolean).map(esc).join(" · ")}</small></div></div>`;
  const drawT = () => {
    if (!tests.length) { tbox.innerHTML = `<div class="empty-t"><h3>Every great partnership has a story.<br>Be the first to share yours.</h3><button class="btn" data-review>Share your experience</button></div>`; return }
    const f = tests.find(t => t.featured) || tests[0], rest = tests.filter(t => t !== f);
    const rated = tests.filter(t => t.rating && !t.demo), avg = rated.length ? (rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1) : "";
    tbox.innerHTML = `${avg ? `<p class="sum"><b>★</b> ${avg} average from ${rated.length} review${rated.length > 1 ? "s" : ""}</p>` : ""}
    <article class="tf" tabindex="0" role="button" data-t="${tests.indexOf(f)}" aria-label="Read full review by ${esc(f.name)}">${f.demo ? '<span class="demo">DEMO</span>' : ""}${f.rating ? `<div class="st" aria-label="${f.rating} out of 5 stars">${stars(f.rating)}</div>` : ""}<blockquote>${esc(f.text)}</blockquote>${who(f)}</article>
    ${rest.length ? `<div class="tbar"><h3>More from our clients</h3><div class="arr"><button type="button" data-dir="-1" aria-label="Previous reviews">←</button><button type="button" data-dir="1" aria-label="Next reviews">→</button></div></div><div class="tr" id="tr">${rest.map(t => `<article class="tc" tabindex="0" role="button" data-t="${tests.indexOf(t)}">${t.demo ? '<span class="demo">DEMO</span>' : ""}${t.rating ? `<div class="st" aria-label="${t.rating} out of 5 stars">${stars(t.rating)}</div>` : ""}<p>${esc(t.text)}</p>${who(t)}</article>`).join("")}</div>` : ""}
    <div class="tm"><button class="btn" data-review>Share your experience</button></div>`;
  };
  const showT = i => { const t = tests[i]; db.innerHTML = `<div class="tag">Client review${t.demo ? " · DEMO" : ""}</div>${t.rating ? `<div class="st" style="margin-top:14px">${stars(t.rating)}</div>` : ""}<h3 style="font-size:1.5rem;line-height:1.3;letter-spacing:-.01em">“${esc(t.text)}”</h3><h4>${esc(t.name)}</h4><p>${[t.business, t.service, t.date].filter(Boolean).map(esc).join(" · ")}</p>`; det.showModal() };
  tbox.addEventListener("click", e => { const d = e.target.closest("[data-dir]"); if (d) { const tr = $("#tr"), rm = matchMedia("(prefers-reduced-motion: reduce)").matches; tr.scrollBy({ left: +d.dataset.dir * (tr.clientWidth * .8), behavior: rm ? "auto" : "smooth" }); return } const q = e.target.closest("[data-t]"); if (q) showT(+q.dataset.t) });
  tbox.addEventListener("keydown", e => { const q = e.target.closest("[data-t]"); if (q && (e.key == "Enter" || e.key == " ")) { e.preventDefault(); showT(+q.dataset.t) } });
  API.getTestimonials().then(r => { tests = r; drawT() }).catch(() => { tbox.innerHTML = '<div class="empty-t"><h3>Reviews are unavailable right now.</h3></div>' });

  // Forms
  const say = (el, t, c) => { el.className = "msg " + c; el.textContent = t };
  const fieldErr = (f, name, msg) => { const el = f.elements[name]; el.setAttribute("aria-invalid", !!msg); el.closest(".fld").querySelector(".er").textContent = msg || "" };
  const cf = $("#cf"); let busy = false;
  cf.onsubmit = e => {
    e.preventDefault(); if (busy) return; const f = cf, m = $("#cm"), v = n => f.elements[n].value.trim();
    let ok = true; const chk = (n, bad, msg) => { fieldErr(f, n, bad ? msg : ""); if (bad) ok = false };
    chk("name", v("name").length < 2, "Please enter your name.");
    chk("email", !/^\S+@\S+\.\S+$/.test(v("email")), "Please enter a valid email.");
    chk("phone", !/^[+\d][\d\s\-()]{6,17}$/.test(v("phone")), "Please enter a valid phone number.");
    chk("message", v("message").length < 10, "Please write at least 10 characters.");
    if (!ok) return say(m, "Please fix the highlighted fields.", "er");
    if (!C.WHATSAPP_NUMBER) return say(m, "This form isn’t connected yet. Please check back soon.", "er");
    busy = true; const b = f.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "Sending…";
    const txt = ["New website inquiry", "Name: " + v("name"), "Email: " + v("email"), "Phone: " + v("phone"), "Business: " + (v("business") || "-"), "Service: " + (f.elements.service.value || "-"), "", v("message")].join("\n");
    window.open("https://wa.me/" + C.WHATSAPP_NUMBER + "?text=" + encodeURIComponent(txt), "_blank", "noopener");
    say(m, "Thank you! WhatsApp is opening with your message. Just press send.", "ok"); f.reset();
    setTimeout(() => { busy = false; b.disabled = false; b.textContent = "Send message" }, 3000);
  };
  const dl = $("#dl"), st = $("#stars"), rf = $("#rf"); let r = 0;
  for (let i = 1; i <= 5; i++) st.insertAdjacentHTML("beforeend", `<button type="button" aria-label="${i} star${i > 1 ? "s" : ""}">★</button>`);
  st.onclick = e => { const b = e.target.closest("button"); if (!b) return; r = [...st.children].indexOf(b) + 1;[...st.children].forEach((x, i) => x.classList.toggle("on", i < r)) };
  document.addEventListener("click", e => { if (e.target.closest("[data-review]")) { $("#rs").hidden = true; rf.hidden = false; dl.showModal() } });
  $("#cl").onclick = () => dl.close(); $("#cl2").onclick = () => dl.close();
  let rb = false;
  rf.onsubmit = async e => {
    e.preventDefault(); if (rb) return; const m = $("#rm"), f = rf, v = n => f.elements[n].value.trim();
    if (f.elements.website.value) return; // honeypot
    if (v("name").length < 2 || !r || v("text").length < 10 || !f.elements.consent.checked) return say(m, "Please add your name, a star rating, a review (10+ characters) and tick the consent box.", "er");
    const file = f.elements.avatar.files[0];
    if (file && (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2e6)) return say(m, "Profile photo must be a JPG, PNG or WebP under 2 MB.", "er");
    const fd = new FormData(f); fd.set("rating", r); fd.delete("website");
    rb = true; const b = f.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "Submitting…"; say(m, "", "");
    try { await API.submitReview(fd); f.hidden = true; $("#rs").hidden = false; f.reset(); r = 0;[...st.children].forEach(x => x.classList.remove("on")) }
    catch (err) { say(m, err.message == "not_configured" ? "Review submission isn’t connected yet. Please try again soon." : "Something went wrong. Please try again.", "er") }
    rb = false; b.disabled = false; b.textContent = "Submit my review";
  };
})();
