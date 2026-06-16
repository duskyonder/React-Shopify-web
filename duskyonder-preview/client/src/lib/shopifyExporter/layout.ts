import type { ThemeConfig } from "@/contexts/ThemeConfigContext";

// ==================== layout/theme.liquid ====================
export function generateThemeLiquid(_config: ThemeConfig): string {
  return `<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#175C40">
    <link rel="canonical" href="{{ canonical_url }}">
    <title>{{ page_title }}{% if page_title != shop.name %} – {{ shop.name }}{% endif %}</title>
    {% if page_description %}
      <meta name="description" content="{{ page_description | escape }}">
    {% endif %}
    {{ content_for_header }}
    {{ 'style.css' | asset_url | stylesheet_tag }}
  </head>
  <body>
    {% section 'header' %}
    <main id="MainContent" role="main">
      {{ content_for_layout }}
    </main>
    {% section 'footer' %}
    <div id="DrawerOverlay" class="sf-drawer-overlay" style="display:none;"></div>
    <div id="QuickAddDrawer" class="sf-drawer" style="display:none;">
      <div class="sf-drawer-header">
        <h3>Quick Add</h3>
        <button class="sf-drawer-close" id="DrawerClose">&times;</button>
      </div>
      <div class="sf-drawer-body">
        <div class="sf-drawer-product">
          <img class="sf-drawer-product-img" id="DrawerImg" src="" alt="">
          <div>
            <div class="sf-drawer-product-name" id="DrawerName"></div>
            <div class="sf-drawer-product-price" id="DrawerPrice"></div>
          </div>
        </div>
        <div class="sf-option-label">Color</div>
        <div class="sf-color-swatches" id="DrawerColors"></div>
        <div class="sf-option-label">Size</div>
        <div class="sf-size-btns" id="DrawerSizes">
          <button class="sf-size-btn active">XS</button>
          <button class="sf-size-btn">S</button>
          <button class="sf-size-btn">M</button>
          <button class="sf-size-btn">L</button>
          <button class="sf-size-btn">XL</button>
        </div>
      </div>
      <div class="sf-drawer-footer">
        <button class="sf-drawer-add-btn">Add to Cart</button>
      </div>
    </div>
    <script src="{{ 'script.js' | asset_url }}" defer="defer"></script>
  </body>
</html>`;
}

// ==================== sections/header.liquid ====================
export function generateHeaderLiquid(config: ThemeConfig): string {
  const promoBarHtml = config.showPromoBar && config.promoBarItems?.length
    ? `<div class="sf-promo-bar" style="background:${config.promoBarBg || '#175C40'};color:${config.promoBarColor || '#fff'}">
  <div class="sf-promo-text">${config.promoBarItems[0]?.text || ''}</div>
</div>`
    : '';

  const logoHtml = config.logoImageUrl
    ? `<a href="/" class="sf-logo sf-logo-center"><img src="${config.logoImageUrl}" alt="${config.logoText}" style="height:40px;max-width:160px;object-fit:contain;"></a>`
    : `<a href="/" class="sf-logo sf-logo-center">{{ section.settings.logo_text | default: shop.name }}</a>`;

  const navLeft = (config.navItems || []).slice(0, Math.ceil((config.navItems || []).length / 2));
  const navRight = (config.navItems || []).slice(Math.ceil((config.navItems || []).length / 2));

  const renderNavGroup = (items: typeof config.navItems) => items.map(item => {
    const hasChildren = item.children && item.children.length > 0;
    const childrenHtml = hasChildren
      ? `<div class="sf-nav-dropdown">${item.children!.map(c => `<a href="${c.link}" class="sf-nav-dropdown-item">${c.label}</a>`).join('')}</div>`
      : '';
    return `<div class="sf-nav-item-wrapper"><a href="${item.link}" class="sf-nav-link">${item.label}${hasChildren ? ' ▾' : ''}</a>${childrenHtml}</div>`;
  }).join('');

  return `${promoBarHtml}<header class="sf-header sf-header-v2" id="SiteHeader">
  <div class="sf-header-inner sf-header-desktop">
    <nav class="sf-nav sf-nav-left">${renderNavGroup(navLeft)}</nav>
    ${logoHtml}
    <div class="sf-header-right">
      <nav class="sf-nav sf-nav-right">${renderNavGroup(navRight)}</nav>
      <div class="sf-header-actions">
        <button class="sf-icon-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <a href="/account" class="sf-icon-btn" aria-label="Account">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
        <a href="/cart" class="sf-icon-btn" aria-label="Cart" style="position:relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span class="cart-badge">{{ cart.item_count }}</span>
        </a>
      </div>
    </div>
  </div>
</header>

{% schema %}
{
  "name": "Header",
  "settings": [
    { "type": "text", "id": "logo_text", "label": "Logo Text", "default": "${config.logoText}" },
    { "type": "image_picker", "id": "logo_image", "label": "Logo Image" },
    { "type": "link_list", "id": "menu", "label": "Navigation Menu", "default": "main-menu" }
  ]
}
{% endschema %}`;
}

// ==================== sections/footer.liquid ====================
export function generateFooterLiquid(config: ThemeConfig): string {
  return `<footer class="sf-footer">
  <div class="sf-footer-grid">
    <div class="sf-footer-brand">
      <a href="/" class="sf-logo">{{ section.settings.logo_text | default: shop.name }}</a>
      <p>{{ section.settings.about_text }}</p>
      <div class="sf-social-links" style="margin-top:16px;">
        {% if section.settings.social_youtube != blank %}<a href="{{ section.settings.social_youtube }}" class="sf-social-link" target="_blank">YT</a>{% endif %}
        {% if section.settings.social_facebook != blank %}<a href="{{ section.settings.social_facebook }}" class="sf-social-link" target="_blank">FB</a>{% endif %}
        {% if section.settings.social_instagram != blank %}<a href="{{ section.settings.social_instagram }}" class="sf-social-link" target="_blank">IG</a>{% endif %}
        {% if section.settings.social_pinterest != blank %}<a href="{{ section.settings.social_pinterest }}" class="sf-social-link" target="_blank">PT</a>{% endif %}
        {% if section.settings.social_twitter != blank %}<a href="{{ section.settings.social_twitter }}" class="sf-social-link" target="_blank">TW</a>{% endif %}
        {% if section.settings.social_tiktok != blank %}<a href="{{ section.settings.social_tiktok }}" class="sf-social-link" target="_blank">TK</a>{% endif %}
      </div>
    </div>
    <div class="sf-footer-col">
      <h4>Shop</h4>
      <ul class="sf-footer-links">
        <li><a href="/collections/all">Shop All</a></li>
        <li><a href="/collections/new">New Arrivals</a></li>
        <li><a href="/collections/sale">Sale</a></li>
      </ul>
    </div>
    <div class="sf-footer-col">
      <h4>Company</h4>
      <ul class="sf-footer-links">
        <li><a href="/pages/about-us">Our Story</a></li>
        <li><a href="/blogs/news">Blog</a></li>
        <li><a href="/pages/sustainability">Sustainability</a></li>
      </ul>
    </div>
    <div class="sf-footer-col">
      <h4>Help</h4>
      <ul class="sf-footer-links">
        <li><a href="/pages/contact">Contact Us</a></li>
        <li><a href="/pages/shipping-returns">Shipping & Returns</a></li>
        <li><a href="/pages/size-guide">Size Guide</a></li>
      </ul>
    </div>
  </div>
  <div class="sf-footer-bottom">
    <p>&copy; {{ 'now' | date: '%Y' }} {{ shop.name }}. All rights reserved.</p>
    <p>Powered by Shopify</p>
  </div>
</footer>

{% schema %}
{
  "name": "Footer",
  "settings": [
    { "type": "text", "id": "logo_text", "label": "Logo Text" },
    { "type": "textarea", "id": "about_text", "label": "About Text", "default": "${config.footerAbout}" },
    { "type": "url", "id": "social_youtube", "label": "YouTube URL" },
    { "type": "url", "id": "social_facebook", "label": "Facebook URL" },
    { "type": "url", "id": "social_instagram", "label": "Instagram URL" },
    { "type": "url", "id": "social_pinterest", "label": "Pinterest URL" },
    { "type": "url", "id": "social_twitter", "label": "Twitter URL" },
    { "type": "url", "id": "social_tiktok", "label": "TikTok URL" }
  ]
}
{% endschema %}`;
}
