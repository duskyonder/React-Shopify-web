import type { ThemeConfig } from "@/contexts/ThemeConfigContext";

// ==================== templates/index.json ====================
export function generateIndexJson(config: ThemeConfig): string {
  const sections: Record<string, unknown> = {
    slideshow: {
      type: "slideshow",
      settings: {
        autoplay: config.slideshowAutoplay,
        autoplay_speed: config.slideshowSpeed,
      },
      blocks: Object.fromEntries(
        config.slides.map((s) => [
          s.id,
          {
            type: "slide",
            settings: {
              title: s.title,
              subtitle: s.subtitle,
              button_label: s.buttonLabel,
              button_link: s.buttonLink,
              image_url: s.imageUrl || "",
            },
          },
        ])
      ),
      block_order: config.slides.map((s) => s.id),
    },
    brand_story: {
      type: "brand-story",
      settings: {
        show_section: config.showBrandStory,
        title: config.brandStoryTitle,
        text: config.brandStoryText,
        button_label: config.brandStoryButtonLabel,
        image_url: config.brandStoryImageUrl || "",
      },
    },
    categories_slider: {
      type: "categories-slider",
      settings: { title: config.categoriesTitle },
      blocks: Object.fromEntries(
        config.categories.map((c) => [
          c.id,
          {
            type: "category",
            settings: { title: c.title, link: c.link, image_url: c.imageUrl || "" },
          },
        ])
      ),
      block_order: config.categories.map((c) => c.id),
    },
    influencer_videos: {
      type: "influencer-videos",
      settings: { show_section: config.showVideos, title: config.videosTitle },
      blocks: Object.fromEntries(
        config.videos.map((v) => [
          v.id,
          {
            type: "video",
            settings: {
              influencer_name: v.influencerName,
              caption: v.caption,
              image_url: v.imageUrl || "",
            },
          },
        ])
      ),
      block_order: config.videos.map((v) => v.id),
    },
    featured_collection: {
      type: "featured-collection",
      settings: { show_section: config.showFeatured, title: config.featuredTitle },
    },
    fabric_intro: {
      type: "fabric-intro",
      settings: { show_section: config.showFabric, title: config.fabricTitle },
      blocks: Object.fromEntries(
        config.fabrics.map((f) => [
          f.id,
          { type: "fabric", settings: { title: f.title, description: f.description } },
        ])
      ),
      block_order: config.fabrics.map((f) => f.id),
    },
    newsletter_popup: {
      type: "newsletter-popup",
      settings: {
        enable_popup: config.enableNewsletter,
        title: config.newsletterTitle,
        text: config.newsletterText,
        delay: config.newsletterDelay,
      },
    },
  };

  return JSON.stringify(
    {
      sections,
      order: [
        "slideshow",
        "brand_story",
        "categories_slider",
        "influencer_videos",
        "featured_collection",
        "fabric_intro",
        "newsletter_popup",
      ],
    },
    null,
    2
  );
}

// ==================== sections/slideshow.liquid ====================
export function generateSlideshowLiquid(_config: ThemeConfig): string {
  return `<div class="sf-hero" id="HeroSlideshow" data-autoplay="{{ section.settings.autoplay }}" data-speed="{{ section.settings.autoplay_speed | times: 1000 }}">
  <div class="sf-hero-track" id="HeroTrack">
    {% for block in section.blocks %}
      <div class="sf-hero-slide" {{ block.shopify_attributes }}>
        {% if block.settings.image_url != blank %}
          <img src="{{ block.settings.image_url }}" alt="{{ block.settings.title }}" class="sf-hero-bg">
        {% elsif block.settings.image != blank %}
          <img src="{{ block.settings.image | img_url: '1920x' }}" alt="{{ block.settings.title }}" class="sf-hero-bg">
        {% endif %}
        <div class="sf-hero-overlay"></div>
        <div class="sf-hero-content">
          <h1>{{ block.settings.title }}</h1>
          <p>{{ block.settings.subtitle }}</p>
          {% if block.settings.button_label != blank %}
            <a href="{{ block.settings.button_link }}" class="sf-btn-primary">{{ block.settings.button_label }}</a>
          {% endif %}
        </div>
      </div>
    {% endfor %}
  </div>
  <button class="sf-hero-arrow prev" id="HeroPrev" aria-label="Previous">&#8249;</button>
  <button class="sf-hero-arrow next" id="HeroNext" aria-label="Next">&#8250;</button>
  <div class="sf-hero-nav" id="HeroDots"></div>
</div>

{% schema %}
{
  "name": "Slideshow",
  "max_blocks": 8,
  "settings": [
    { "type": "checkbox", "id": "autoplay", "label": "Auto-rotate slides", "default": true },
    { "type": "range", "id": "autoplay_speed", "min": 3, "max": 9, "step": 1, "unit": "s", "label": "Change slides every", "default": 5 }
  ],
  "blocks": [{
    "type": "slide",
    "name": "Slide",
    "settings": [
      { "type": "image_picker", "id": "image", "label": "Image" },
      { "type": "text", "id": "image_url", "label": "Image URL (override)" },
      { "type": "text", "id": "title", "label": "Heading", "default": "Move with Purpose" },
      { "type": "text", "id": "subtitle", "label": "Subheading", "default": "Premium activewear for modern life." },
      { "type": "text", "id": "button_label", "label": "Button Label", "default": "Shop Now" },
      { "type": "text", "id": "button_link", "label": "Button Link", "default": "/collections/all" }
    ]
  }],
  "presets": [{ "name": "Slideshow", "blocks": [{ "type": "slide" }, { "type": "slide" }] }]
}
{% endschema %}`;
}

// ==================== sections/brand-story.liquid ====================
export function generateBrandStoryLiquid(_config: ThemeConfig): string {
  return `{% if section.settings.show_section %}
<section class="sf-section sf-brand-story">
  <div class="sf-brand-story-inner">
    <div class="sf-brand-story-image">
      {% if section.settings.image_url != blank %}
        <img src="{{ section.settings.image_url }}" alt="{{ section.settings.title }}">
      {% elsif section.settings.image != blank %}
        <img src="{{ section.settings.image | img_url: '800x' }}" alt="{{ section.settings.title }}">
      {% else %}
        <div class="sf-img-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Add Image</span>
        </div>
      {% endif %}
    </div>
    <div class="sf-brand-story-text">
      <h2>{{ section.settings.title }}</h2>
      <p>{{ section.settings.text }}</p>
      {% if section.settings.button_label != blank %}
        <a href="{{ section.settings.button_link }}" class="sf-btn-outline">{{ section.settings.button_label }}</a>
      {% endif %}
    </div>
  </div>
</section>
{% endif %}

{% schema %}
{
  "name": "Brand Story",
  "settings": [
    { "type": "checkbox", "id": "show_section", "label": "Show Section", "default": true },
    { "type": "image_picker", "id": "image", "label": "Image" },
    { "type": "text", "id": "image_url", "label": "Image URL (override)" },
    { "type": "text", "id": "title", "label": "Heading", "default": "Our Story" },
    { "type": "textarea", "id": "text", "label": "Text", "default": "DUSKYONDER was born from a desire to create activewear that bridges the gap between performance and everyday wear." },
    { "type": "text", "id": "button_label", "label": "Button Label", "default": "Read More" },
    { "type": "text", "id": "button_link", "label": "Button Link", "default": "/pages/about-us" }
  ],
  "presets": [{ "name": "Brand Story" }]
}
{% endschema %}`;
}

// ==================== sections/categories-slider.liquid ====================
export function generateCategoriesLiquid(_config: ThemeConfig): string {
  return `<section class="sf-section sf-categories">
  <div class="sf-categories-wrapper">
    <div class="sf-section-header">
      <h2>{{ section.settings.title }}</h2>
    </div>
    <button class="sf-cat-arrow prev" id="CatPrev">&#8249;</button>
    <div class="sf-categories-track-outer">
      <div class="sf-categories-track" id="CatTrack">
        {% for block in section.blocks %}
          <a href="{{ block.settings.link }}" class="sf-category-card" {{ block.shopify_attributes }}>
            {% if block.settings.image_url != blank %}
              <img src="{{ block.settings.image_url }}" alt="{{ block.settings.title }}">
            {% elsif block.settings.image != blank %}
              <img src="{{ block.settings.image | img_url: '600x' }}" alt="{{ block.settings.title }}">
            {% else %}
              <div class="sf-img-placeholder"></div>
            {% endif %}
            <div class="sf-category-overlay"><span>{{ block.settings.title }}</span></div>
          </a>
        {% endfor %}
      </div>
    </div>
    <button class="sf-cat-arrow next" id="CatNext">&#8250;</button>
  </div>
</section>

{% schema %}
{
  "name": "Categories Slider",
  "settings": [
    { "type": "text", "id": "title", "label": "Section Title", "default": "Shop by Category" }
  ],
  "blocks": [{
    "type": "category",
    "name": "Category",
    "settings": [
      { "type": "image_picker", "id": "image", "label": "Image" },
      { "type": "text", "id": "image_url", "label": "Image URL (override)" },
      { "type": "text", "id": "title", "label": "Category Name", "default": "Category" },
      { "type": "text", "id": "link", "label": "Link", "default": "/collections/all" }
    ]
  }],
  "presets": [{ "name": "Categories Slider" }]
}
{% endschema %}`;
}

// ==================== sections/influencer-videos.liquid ====================
export function generateVideosLiquid(_config: ThemeConfig): string {
  return `{% if section.settings.show_section %}
<section class="sf-section sf-videos">
  <div class="sf-section-header">
    <h2>{{ section.settings.title }}</h2>
  </div>
  <div class="sf-videos-grid">
    {% for block in section.blocks %}
      <div class="sf-video-card" {{ block.shopify_attributes }}>
        {% if block.settings.image_url != blank %}
          <img src="{{ block.settings.image_url }}" alt="{{ block.settings.influencer_name }}">
        {% elsif block.settings.image != blank %}
          <img src="{{ block.settings.image | img_url: '600x' }}" alt="{{ block.settings.influencer_name }}">
        {% else %}
          <div class="sf-img-placeholder"></div>
        {% endif %}
        <div class="sf-video-play">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <button class="sf-quick-add-btn" data-product-name="{{ block.settings.influencer_name }}" aria-label="Quick Add">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div class="sf-video-overlay">
          <div class="sf-video-info">
            <div class="sf-video-name">{{ block.settings.influencer_name }}</div>
            <div class="sf-video-caption">{{ block.settings.caption }}</div>
          </div>
        </div>
      </div>
    {% endfor %}
  </div>
</section>
{% endif %}

{% schema %}
{
  "name": "Influencer Videos",
  "settings": [
    { "type": "checkbox", "id": "show_section", "label": "Show Section", "default": true },
    { "type": "text", "id": "title", "label": "Section Title", "default": "Seen on Social" }
  ],
  "blocks": [{
    "type": "video",
    "name": "Video",
    "settings": [
      { "type": "image_picker", "id": "image", "label": "Cover Image" },
      { "type": "text", "id": "image_url", "label": "Image URL (override)" },
      { "type": "text", "id": "influencer_name", "label": "Influencer Name", "default": "@username" },
      { "type": "text", "id": "caption", "label": "Caption", "default": "Check out this look!" }
    ]
  }],
  "presets": [{ "name": "Influencer Videos" }]
}
{% endschema %}`;
}

// ==================== sections/featured-collection.liquid ====================
export function generateFeaturedLiquid(config: ThemeConfig): string {
  const productBlocks = config.products.map(p => {
    const imgTag = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.name}">`
      : `<div class="sf-img-placeholder" style="aspect-ratio:3/4;"></div>`;
    const badge = p.badge ? `<span class="sf-product-badge">${p.badge}</span>` : '';
    const swatches = p.colors.map(c => `<div class="sf-swatch" style="background:${c};"></div>`).join('');
    return `        <div class="sf-product-card">
          <div class="sf-product-image">
            ${imgTag}
            ${badge}
          </div>
          <div class="sf-product-info">
            <div class="sf-product-name">${p.name}</div>
            <div class="sf-product-price">${p.price}</div>
            <div class="sf-product-swatches">${swatches}</div>
          </div>
        </div>`;
  }).join('\n');

  return `{% if section.settings.show_section %}
<section class="sf-section sf-featured">
  <div class="sf-section-header">
    <h2>{{ section.settings.title }}</h2>
  </div>
  <div class="sf-products-grid">
    {% assign collection = collections[section.settings.collection] %}
    {% if collection != blank %}
      {% for product in collection.products limit: section.settings.limit %}
        <a href="{{ product.url }}" class="sf-product-card">
          <div class="sf-product-image">
            <img src="{{ product.featured_image | img_url: '600x' }}" alt="{{ product.title }}">
            {% if product.tags contains 'new' %}<span class="sf-product-badge">New</span>{% endif %}
          </div>
          <div class="sf-product-info">
            <div class="sf-product-name">{{ product.title }}</div>
            <div class="sf-product-price">{{ product.price | money }}</div>
          </div>
        </a>
      {% endfor %}
    {% else %}
      {# Preview products from theme editor (S3 URLs embedded) #}
${productBlocks}
    {% endif %}
  </div>
</section>
{% endif %}

{% schema %}
{
  "name": "Featured Collection",
  "settings": [
    { "type": "checkbox", "id": "show_section", "label": "Show Section", "default": true },
    { "type": "text", "id": "title", "label": "Section Title", "default": "Best Sellers" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "range", "id": "limit", "min": 2, "max": 12, "step": 2, "label": "Products to show", "default": 4 }
  ],
  "presets": [{ "name": "Featured Collection" }]
}
{% endschema %}`;
}

// ==================== sections/fabric-intro.liquid ====================
export function generateFabricLiquid(_config: ThemeConfig): string {
  return `{% if section.settings.show_section %}
<section class="sf-section sf-fabric">
  <div class="sf-section-header">
    <h2>{{ section.settings.title }}</h2>
    <p>{{ section.settings.subtitle }}</p>
  </div>
  <div class="sf-fabric-grid">
    {% for block in section.blocks %}
      <div class="sf-fabric-card" {{ block.shopify_attributes }}>
        <div class="sf-fabric-icon">{{ block.settings.icon }}</div>
        <h3>{{ block.settings.title }}</h3>
        <p>{{ block.settings.description }}</p>
      </div>
    {% endfor %}
  </div>
</section>
{% endif %}

{% schema %}
{
  "name": "Fabric Intro",
  "settings": [
    { "type": "checkbox", "id": "show_section", "label": "Show Section", "default": true },
    { "type": "text", "id": "title", "label": "Section Title", "default": "Our Premium Fabrics" },
    { "type": "text", "id": "subtitle", "label": "Subtitle" }
  ],
  "blocks": [{
    "type": "fabric",
    "name": "Fabric",
    "settings": [
      { "type": "text", "id": "icon", "label": "Icon (emoji)", "default": "✨" },
      { "type": "text", "id": "title", "label": "Fabric Name", "default": "EcoMove" },
      { "type": "textarea", "id": "description", "label": "Description", "default": "Premium sustainable fabric." }
    ]
  }],
  "presets": [{ "name": "Fabric Intro" }]
}
{% endschema %}`;
}

// ==================== sections/newsletter-popup.liquid ====================
export function generateNewsletterLiquid(_config: ThemeConfig): string {
  return `{% if section.settings.enable_popup %}
<div id="NewsletterPopup" class="sf-popup-overlay" style="display:none;" data-delay="{{ section.settings.delay }}">
  <div class="sf-popup">
    <div class="sf-popup-image-wrapper">
      <div class="sf-popup-image">🌿</div>
      <button class="sf-popup-close" id="PopupClose">&times;</button>
    </div>
    <div class="sf-popup-body">
      <h3>{{ section.settings.title }}</h3>
      <p>{{ section.settings.text }}</p>
      {% form 'customer' %}
        <input type="hidden" name="contact[tags]" value="newsletter">
        <div class="sf-popup-form">
          <input type="email" name="contact[email]" class="sf-popup-input" placeholder="Your email address" required>
          <button type="submit" class="sf-btn-primary" style="padding:12px 20px;">Subscribe</button>
        </div>
      {% endform %}
    </div>
  </div>
</div>
{% endif %}

{% schema %}
{
  "name": "Newsletter Popup",
  "settings": [
    { "type": "checkbox", "id": "enable_popup", "label": "Enable Popup", "default": true },
    { "type": "text", "id": "title", "label": "Heading", "default": "Join the Club" },
    { "type": "textarea", "id": "text", "label": "Text", "default": "Subscribe to receive updates on new arrivals and exclusive offers." },
    { "type": "range", "id": "delay", "min": 1, "max": 10, "step": 1, "unit": "s", "label": "Delay before popup", "default": 3 }
  ],
  "presets": [{ "name": "Newsletter Popup" }]
}
{% endschema %}`;
}
