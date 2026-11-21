/* Content data. Shapes match the API contract in README.md.
   Items with demo:true are clearly labelled DEMO on the page. Delete them (or set API_BASE_URL) for real content. */
window.CM_DATA = {
  services: [
    { name: "Paid Advertising", desc: "Digital paid advertising solutions designed to reach the right audience and support business growth." },
    { name: "Social Media Marketing", desc: "Building and managing social media presence through content, strategy, and audience engagement." },
    { name: "Website Development", desc: "Creating professional websites to strengthen the digital presence of businesses." },
    { name: "Google Ads", desc: "Helping businesses reach potential customers through targeted Google advertising campaigns." },
    { name: "SEO", desc: "Improving online visibility and organic discoverability through search engine optimization." }
  ],
  categories: ["Social Media", "Ads", "Design", "Web"],
  projects: [
    { id: "d1", title: "Demo social media campaign", client: "Demo client", category: "Social Media", cover: "linear-gradient(135deg,#155EEF,#0a1f5c)", images: [], description: "Demo placeholder.", challenge: "", strategy: "", execution: "", outcome: "", featured: true, published: true, demo: true },
    { id: "d2", title: "Demo brand identity", client: "Demo client", category: "Design", cover: "linear-gradient(135deg,#62A0FF,#10182A)", images: [], description: "Demo placeholder.", challenge: "", strategy: "", execution: "", outcome: "", featured: false, published: true, demo: true },
    { id: "d3", title: "Demo ad creative", client: "Demo client", category: "Ads", cover: "linear-gradient(120deg,#0a1f5c,#62A0FF)", images: [], description: "Demo placeholder.", challenge: "", strategy: "", execution: "", outcome: "", featured: false, published: true, demo: true },
    { id: "d4", title: "Demo website build", client: "Demo client", category: "Web", cover: "linear-gradient(200deg,#155EEF,#080D1B)", images: [], description: "Demo placeholder.", challenge: "", strategy: "", execution: "", outcome: "", featured: false, published: true, demo: true }
  ],
  testimonials: [
    { id: "t1", name: "Demo Client", business: "Demo Business", service: "Social Media Marketing", rating: 5, text: "Sample testimonial. This is where a featured client review will appear in large type.", date: "", avatar: "", featured: true, published: true, demo: true },
    { id: "t2", name: "Demo Name", business: "Demo Business", service: "Google Ads", rating: 5, text: "Sample supporting review for layout preview only.", date: "", avatar: "", featured: false, published: true, demo: true },
    { id: "t3", name: "Demo Name", business: "", service: "SEO", rating: 4, text: "Another sample review showing how several reviews sit together.", date: "", avatar: "", featured: false, published: true, demo: true }
  ]
};
