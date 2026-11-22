
/* The Compact Media — Supabase Data Access */
window.CM_API = (() => {
  const C = window.CM_CONFIG;
  const D = window.CM_DATA;

  let client = null;

  const ready = async () => {
    if (client) return client;

    if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) {
      throw new Error("Supabase configuration is missing.");
    }

    // Load Supabase JS if it is not already available.
    if (!window.supabase) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = () => reject(
          new Error("Could not load Supabase library.")
        );
        document.head.appendChild(script);
      });
    }

    if (!window.supabase?.createClient) {
      throw new Error("Supabase library is unavailable.");
    }

    client = window.supabase.createClient(
      C.SUPABASE_URL,
      C.SUPABASE_ANON_KEY
    );

    return client;
  };

  return {
    isConnected: () => !!(
      C.SUPABASE_URL && C.SUPABASE_ANON_KEY
    ),

    // Fetch published projects.
    getProjects: async () => {
      const db = await ready();

      const { data, error } = await db
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });

      if (error) throw error;

      return data.map(p => ({
        id: p.id,
        title: p.title,
        client: p.client_name || "",
        category: p.category || "",
        cover: p.cover_image_url || "",
        images: p.gallery_images || [],
        description: p.full_description || p.short_description || "",
        challenge: "",
        strategy: "",
        execution: "",
        outcome: "",
        featured: !!p.featured,
        demo: false,
        published: true,
        videoUrl: p.video_url || "",
        projectUrl: p.project_url || "",
        services: p.services || [],
        date: p.project_date || ""
      }));
    },

    // Fetch published testimonials.
    getTestimonials: async () => {
      const db = await ready();

      const { data, error } = await db
        .from("testimonials")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });

      if (error) throw error;

      return data.map(t => ({
        id: t.id,
        name: t.client_name || "",
        business: t.business_name || "",
        service: t.service || "",
        rating: t.rating || 5,
        text: t.testimonial_text || "",
        date: t.testimonial_date || "",
        avatar: t.image_url || "",
        featured: !!t.featured,
        demo: false,
        published: true
      }));
    },

    // Submit customer reviews for admin approval.
    submitReview: async formData => {
      const db = await ready();

      // Ignore automated submissions caught by the honeypot.
      if (formData.get("website")) {
        return { success: true };
      }

      const name = String(formData.get("name") || "").trim();
      const business = String(formData.get("business") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const rating = Number(formData.get("rating") || 5);
      const review = String(formData.get("text") || "").trim();
      const avatar = formData.get("avatar");

      if (!name || !review) {
        throw new Error("Please provide your name and review.");
      }

      if (name.length > 100 || business.length > 120 ||
          email.length > 254 || service.length > 80 ||
          review.length < 10 || review.length > 2000) {
        throw new Error("Some review fields exceed the allowed limits.");
      }

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Please select a valid rating.");
      }

      let imageUrl = null;

      // Upload optional review image.
      if (avatar instanceof File && avatar.size > 0) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(avatar.type)) {
          throw new Error("Please upload a JPG, PNG or WebP image.");
        }

        if (avatar.size > 2 * 1024 * 1024) {
          throw new Error("The review image must be 2 MB or smaller.");
        }

        const extension = avatar.type === "image/png"
          ? "png"
          : avatar.type === "image/webp"
            ? "webp"
            : "jpg";

        const path = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await db.storage
          .from("feedback-images")
          .upload(path, avatar, {
            contentType: avatar.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: imageData } = db.storage
          .from("feedback-images")
          .getPublicUrl(path);

        imageUrl = imageData.publicUrl;
      }

      // Generate the ID locally so no SELECT permission is needed.
      const feedbackId = crypto.randomUUID();

      // Public submissions are always pending moderation.
      const { error } = await db
        .from("customer_feedback")
        .insert({
          id: feedbackId,
          customer_name: name,
          business_name: business || null,
          rating,
          service: service || null,
          review_text: review,
          image_url: imageUrl,
          status: "pending",
          published_at: null
        });

      if (error) throw error;

      // Store customer email separately from public review data.
      if (email) {
        const { error: privateError } = await db
          .from("feedback_private")
          .insert({
            feedback_id: feedbackId,
            email_private: email
          });

        if (privateError) {
          throw new Error(
            "Your review was submitted, but its private email could not be saved."
          );
        }
      }

      return { success: true };
    }
  };
})();
