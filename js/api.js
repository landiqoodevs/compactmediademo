/* Data-access layer. The future dashboard/backend only needs to satisfy this contract. */
window.CM_API = (() => {
  const C = window.CM_CONFIG, D = window.CM_DATA, base = (C.API_BASE_URL || "").replace(/\/$/, "");
  const get = async p => { const r = await fetch(base + p, { headers: { Accept: "application/json" } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); };
  return {
    isConnected: () => !!base,
    getProjects: async () => base ? get("/projects?status=published") : D.projects.filter(p => p.published),
    getTestimonials: async () => base ? get("/reviews?status=published") : D.testimonials.filter(t => t.published),
    // Reviews are always saved as "pending" by the server; they are never auto-published.
    submitReview: async formData => {
      if (!base) throw new Error("not_configured");
      const r = await fetch(base + "/reviews", { method: "POST", body: formData });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }
  };
})();
