import type { ThemeConfig } from "@/contexts/ThemeConfigContext";

// ==================== assets/style.css ====================
export function generateStyleCss(_config: ThemeConfig): string {
  return `:root{--brand-primary:#175C40;--brand-secondary:#2D8B6F;--brand-light:#E8F3F0;--brand-dark:#0D3D2B;--brand-accent:#4CAF82}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#222;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{text-decoration:none;color:inherit}
.sf-header{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid rgba(23,92,64,.1);box-shadow:0 2px 12px rgba(23,92,64,.06);transition:all .3s ease}
.sf-header.scrolled{box-shadow:0 4px 20px rgba(23,92,64,.12)}
.sf-header-inner{display:flex;align-items:center;justify-content:space-between;height:64px;max-width:1280px;margin:0 auto;padding:0 24px}
.sf-logo{font-size:1.4rem;font-weight:800;color:#175C40;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}
.sf-nav{display:flex;gap:32px}
.sf-nav a{font-size:.875rem;font-weight:500;color:#333;text-decoration:none;letter-spacing:.04em;transition:color .2s}
.sf-nav a:hover{color:#175C40}
.sf-header-actions{display:flex;align-items:center;gap:16px}
.sf-icon-btn{background:none;border:none;cursor:pointer;color:#333;padding:6px;border-radius:6px;transition:all .2s;display:flex;align-items:center;justify-content:center;position:relative}
.sf-icon-btn:hover{color:#175C40;background:#E8F3F0}
.cart-badge{position:absolute;top:-2px;right:-2px;background:#175C40;color:white;font-size:.65rem;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
@media(max-width:768px){.sf-nav{display:none}}
.sf-hero{position:relative;overflow:hidden;background:#0D3D2B}
.sf-hero-track{display:flex;transition:transform .6s cubic-bezier(.23,1,.32,1)}
.sf-hero-slide{min-width:100%;position:relative;height:600px;display:flex;align-items:center;justify-content:center;overflow:hidden}
@media(max-width:768px){.sf-hero-slide{height:420px}}
.sf-hero-bg{position:absolute;inset:0;object-fit:cover;width:100%;height:100%}
.sf-hero-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(13,61,43,.75) 0%,rgba(23,92,64,.4) 100%)}
.sf-hero-content{position:relative;z-index:2;text-align:center;color:white;padding:0 24px;max-width:700px}
.sf-hero-content h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:.04em;margin-bottom:16px;line-height:1.15}
.sf-hero-content p{font-size:clamp(.95rem,2vw,1.15rem);opacity:.9;margin-bottom:32px;line-height:1.7}
.sf-btn-primary{display:inline-flex;align-items:center;gap:8px;background:#175C40;color:white;padding:14px 32px;border-radius:2px;font-weight:600;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border:2px solid #175C40;cursor:pointer;transition:all .25s cubic-bezier(.23,1,.32,1)}
.sf-btn-primary:hover{background:transparent;color:white;border-color:white;transform:translateY(-2px)}
.sf-hero-nav{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:3}
.sf-hero-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.4);border:none;cursor:pointer;transition:all .3s;padding:0}
.sf-hero-dot.active{background:white;width:24px;border-radius:4px}
.sf-hero-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:3;background:rgba(255,255,255,.15);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.3);color:white;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.sf-hero-arrow:hover{background:rgba(255,255,255,.3)}
.sf-hero-arrow.prev{left:20px}
.sf-hero-arrow.next{right:20px}
.sf-section{padding:80px 0}
.sf-section-header{text-align:center;margin-bottom:48px}
.sf-section-header h2{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;color:#175C40;letter-spacing:.04em;margin-bottom:12px}
.sf-section-header p{color:#666;font-size:1rem;max-width:500px;margin:0 auto;line-height:1.7}
.sf-brand-story{background:#E8F3F0}
.sf-brand-story-inner{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1280px;margin:0 auto;padding:0 24px}
@media(max-width:768px){.sf-brand-story-inner{grid-template-columns:1fr;gap:32px}}
.sf-brand-story-image{aspect-ratio:4/3;border-radius:4px;overflow:hidden;background:#c5ddd5;display:flex;align-items:center;justify-content:center;position:relative}
.sf-brand-story-image img{width:100%;height:100%;object-fit:cover}
.sf-brand-story-text h2{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:700;color:#175C40;margin-bottom:20px;letter-spacing:.04em}
.sf-brand-story-text p{color:#444;line-height:1.85;margin-bottom:28px;font-size:1rem}
.sf-btn-outline{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#175C40;padding:12px 28px;border-radius:2px;font-weight:600;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border:2px solid #175C40;cursor:pointer;transition:all .25s}
.sf-btn-outline:hover{background:#175C40;color:white;transform:translateY(-2px)}
.sf-categories{background:#fff}
.sf-categories-wrapper{position:relative;max-width:1280px;margin:0 auto;padding:0 24px}
.sf-categories-track-outer{overflow:hidden;margin:0 -8px}
.sf-categories-track{display:flex;gap:16px;cursor:grab;user-select:none;overflow-x:auto;scrollbar-width:none}
.sf-categories-track::-webkit-scrollbar{display:none}
.sf-categories-track:active{cursor:grabbing}
.sf-category-card{flex:0 0 calc(16.666% - 14px);min-width:160px;aspect-ratio:3/4;border-radius:4px;overflow:hidden;position:relative;background:#1a6b4a;cursor:pointer;transition:transform .3s;text-decoration:none}
.sf-category-card:hover{transform:translateY(-4px)}
@media(max-width:1024px){.sf-category-card{flex:0 0 calc(25% - 12px)}}
@media(max-width:768px){.sf-category-card{flex:0 0 calc(40% - 8px);min-width:140px}}
.sf-category-card img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.sf-category-card:hover img{transform:scale(1.05)}
.sf-category-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(13,61,43,.85) 0%,transparent 60%);display:flex;align-items:flex-end;padding:16px}
.sf-category-overlay span{color:white;font-weight:700;font-size:.9rem;letter-spacing:.06em;text-transform:uppercase}
.sf-cat-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:3;background:white;border:1px solid #e0e0e0;color:#175C40;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12);transition:all .2s}
.sf-cat-arrow:hover{background:#175C40;color:white}
.sf-cat-arrow.prev{left:-8px}
.sf-cat-arrow.next{right:-8px}
.sf-videos{background:#f9f9f9}
.sf-videos-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1280px;margin:0 auto;padding:0 24px}
@media(max-width:1024px){.sf-videos-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.sf-videos-grid{grid-template-columns:1fr}}
.sf-video-card{position:relative;border-radius:8px;overflow:hidden;background:#1a6b4a;aspect-ratio:9/16;cursor:pointer}
.sf-video-card img{width:100%;height:100%;object-fit:cover}
.sf-video-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 50%);display:flex;flex-direction:column;justify-content:flex-end;padding:16px}
.sf-video-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;background:rgba(255,255,255,.2);backdrop-filter:blur(4px);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;transition:all .2s}
.sf-video-card:hover .sf-video-play{background:rgba(255,255,255,.35);transform:translate(-50%,-50%) scale(1.1)}
.sf-video-info{color:white}
.sf-video-name{font-size:.8rem;opacity:.8;margin-bottom:4px}
.sf-video-caption{font-size:.9rem;font-weight:600;line-height:1.3}
.sf-quick-add-btn{position:absolute;top:12px;right:12px;background:white;color:#175C40;border:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2);transition:all .2s;z-index:2}
.sf-quick-add-btn:hover{background:#175C40;color:white;transform:scale(1.1)}
.sf-featured{background:#fff}
.sf-products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:1280px;margin:0 auto;padding:0 24px}
@media(max-width:1024px){.sf-products-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.sf-products-grid{grid-template-columns:repeat(2,1fr);gap:12px}}
.sf-product-card{border-radius:4px;overflow:hidden;background:#fff;transition:transform .3s,box-shadow .3s;cursor:pointer;text-decoration:none;display:block}
.sf-product-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(23,92,64,.12)}
.sf-product-image{aspect-ratio:3/4;background:#E8F3F0;overflow:hidden;position:relative}
.sf-product-image img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.sf-product-card:hover .sf-product-image img{transform:scale(1.04)}
.sf-product-badge{position:absolute;top:12px;left:12px;background:#175C40;color:white;font-size:.7rem;font-weight:700;padding:4px 10px;border-radius:2px;letter-spacing:.06em;text-transform:uppercase}
.sf-product-info{padding:14px 0 0}
.sf-product-name{font-size:.9rem;font-weight:600;color:#222;margin-bottom:6px}
.sf-product-price{font-size:.95rem;font-weight:700;color:#175C40}
.sf-product-swatches{display:flex;gap:6px;margin-top:8px}
.sf-swatch{width:18px;height:18px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:border-color .2s}
.sf-swatch:hover{border-color:#175C40}
.sf-fabric{background:#0D3D2B;color:white}
.sf-fabric .sf-section-header h2{color:white}
.sf-fabric .sf-section-header p{color:rgba(255,255,255,.7)}
.sf-fabric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1280px;margin:0 auto;padding:0 24px}
@media(max-width:768px){.sf-fabric-grid{grid-template-columns:1fr}}
.sf-fabric-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:32px;transition:all .3s}
.sf-fabric-card:hover{background:rgba(255,255,255,.12);transform:translateY(-4px)}
.sf-fabric-icon{width:48px;height:48px;background:rgba(23,92,64,.6);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:1.5rem}
.sf-fabric-card h3{font-size:1.2rem;font-weight:700;margin-bottom:12px;color:#4CAF82}
.sf-fabric-card p{color:rgba(255,255,255,.75);line-height:1.75;font-size:.9rem}
.sf-footer{background:#0a2e1e;color:rgba(255,255,255,.8);padding:60px 0 32px}
.sf-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;max-width:1280px;margin:0 auto;padding:0 24px;margin-bottom:48px}
@media(max-width:1024px){.sf-footer-grid{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.sf-footer-grid{grid-template-columns:1fr}}
.sf-footer-brand .sf-logo{color:#4CAF82;font-size:1.3rem;display:block;margin-bottom:16px}
.sf-footer-brand p{font-size:.875rem;line-height:1.8;color:rgba(255,255,255,.6);max-width:260px}
.sf-footer-col h4{color:white;font-weight:700;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:16px}
.sf-footer-links{list-style:none;padding:0;margin:0}
.sf-footer-links li{margin-bottom:10px}
.sf-footer-links a{color:rgba(255,255,255,.6);text-decoration:none;font-size:.875rem;transition:color .2s}
.sf-footer-links a:hover{color:#4CAF82}
.sf-social-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px}
.sf-social-link{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7);text-decoration:none;font-size:.75rem;font-weight:700;transition:all .2s}
.sf-social-link:hover{background:#175C40;color:white;transform:translateY(-2px)}
.sf-footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:24px;max-width:1280px;margin:0 auto;padding-left:24px;padding-right:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:.8rem;color:rgba(255,255,255,.4)}
.sf-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px}
.sf-popup{background:white;border-radius:8px;max-width:480px;width:100%;overflow:hidden}
.sf-popup-image{height:180px;background:linear-gradient(135deg,#175C40,#2D8B6F);display:flex;align-items:center;justify-content:center;font-size:3rem}
.sf-popup-body{padding:32px}
.sf-popup-body h3{font-size:1.5rem;font-weight:700;color:#175C40;margin-bottom:8px}
.sf-popup-body p{color:#666;font-size:.9rem;line-height:1.6;margin-bottom:20px}
.sf-popup-form{display:flex;gap:8px}
.sf-popup-input{flex:1;padding:12px 16px;border:1.5px solid #e0e0e0;border-radius:2px;font-size:.9rem;outline:none;transition:border-color .2s}
.sf-popup-input:focus{border-color:#175C40}
.sf-popup-close{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.2);border:none;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2rem;transition:background .2s}
.sf-popup-close:hover{background:rgba(255,255,255,.35)}
.sf-popup-image-wrapper{position:relative}
.sf-drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:500}
.sf-drawer{position:fixed;right:0;top:0;bottom:0;width:400px;max-width:100vw;background:white;z-index:501;display:flex;flex-direction:column;box-shadow:-8px 0 32px rgba(0,0,0,.15)}
.sf-drawer-header{padding:20px 24px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between}
.sf-drawer-header h3{font-weight:700;font-size:1.1rem;color:#175C40}
.sf-drawer-close{background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all .2s}
.sf-drawer-close:hover{background:#f0f0f0;color:#333}
.sf-drawer-body{flex:1;overflow-y:auto;padding:24px}
.sf-drawer-product{display:flex;gap:16px;margin-bottom:24px}
.sf-drawer-product-img{width:80px;height:80px;border-radius:4px;background:#E8F3F0;object-fit:cover;flex-shrink:0}
.sf-drawer-product-name{font-weight:600;font-size:.95rem;color:#222;margin-bottom:4px}
.sf-drawer-product-price{font-weight:700;color:#175C40}
.sf-option-label{font-size:.8rem;font-weight:700;color:#888;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px;margin-top:20px}
.sf-color-swatches{display:flex;gap:10px;flex-wrap:wrap}
.sf-color-swatch{width:32px;height:32px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:border-color .2s;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.sf-color-swatch.active{border-color:#175C40}
.sf-size-btns{display:flex;gap:8px;flex-wrap:wrap}
.sf-size-btn{padding:8px 16px;border:1.5px solid #ddd;border-radius:2px;background:white;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;color:#333}
.sf-size-btn:hover{border-color:#175C40;color:#175C40}
.sf-size-btn.active{background:#175C40;color:white;border-color:#175C40}
.sf-drawer-footer{padding:20px 24px;border-top:1px solid #eee}
.sf-drawer-add-btn{width:100%;background:#175C40;color:white;border:none;padding:16px;border-radius:2px;font-size:.95rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .25s}
.sf-drawer-add-btn:hover{background:#0D3D2B;transform:translateY(-1px)}
.sf-img-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:rgba(255,255,255,.5);font-size:.8rem;background:linear-gradient(135deg,#1a6b4a 0%,#0D3D2B 100%)}
`;
}

// ==================== assets/script.js ====================
export function generateScriptJs(): string {
  return `// DUSKYONDER Theme - script.js
document.addEventListener('DOMContentLoaded', function() {
  // Header scroll effect
  const header = document.getElementById('SiteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // Hero Slideshow
  const track = document.getElementById('HeroTrack');
  const dotsContainer = document.getElementById('HeroDots');
  if (track) {
    const slides = track.querySelectorAll('.sf-hero-slide');
    let current = 0;
    const total = slides.length;
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'sf-hero-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }
    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsContainer && dotsContainer.querySelectorAll('.sf-hero-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
    document.getElementById('HeroPrev')?.addEventListener('click', () => goTo(current - 1));
    document.getElementById('HeroNext')?.addEventListener('click', () => goTo(current + 1));
    const heroEl = track.closest('.sf-hero');
    const autoplay = heroEl?.dataset.autoplay === 'true';
    const speed = parseInt(heroEl?.dataset.speed || '5000');
    if (autoplay && total > 1) setInterval(() => goTo(current + 1), speed);
  }

  // Categories slider — infinite loop (triple-clone)
  const catTrack = document.getElementById('CatTrack');
  if (catTrack) {
    const origItems = Array.from(catTrack.children);
    if (origItems.length > 0) {
      origItems.forEach(item => catTrack.appendChild(item.cloneNode(true)));
      origItems.forEach(item => catTrack.insertBefore(item.cloneNode(true), catTrack.firstChild));
      const oneSetWidth = catTrack.scrollWidth / 3;
      catTrack.scrollLeft = oneSetWidth;
      catTrack.addEventListener('scroll', () => {
        const w = catTrack.scrollWidth / 3;
        if (catTrack.scrollLeft >= w * 2) catTrack.scrollLeft -= w;
        else if (catTrack.scrollLeft < w * 0.05) catTrack.scrollLeft += w;
      }, { passive: true });
    }
    let isDragging = false, startX = 0, scrollLeft = 0;
    catTrack.addEventListener('mousedown', e => { isDragging = true; startX = e.pageX - catTrack.offsetLeft; scrollLeft = catTrack.scrollLeft; catTrack.style.cursor = 'grabbing'; });
    catTrack.addEventListener('mouseleave', () => { isDragging = false; catTrack.style.cursor = 'grab'; });
    catTrack.addEventListener('mouseup', () => { isDragging = false; catTrack.style.cursor = 'grab'; });
    catTrack.addEventListener('mousemove', e => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - catTrack.offsetLeft; catTrack.scrollLeft = scrollLeft - (x - startX); });
    document.getElementById('CatPrev')?.addEventListener('click', () => { catTrack.scrollBy({ left: -280, behavior: 'smooth' }); });
    document.getElementById('CatNext')?.addEventListener('click', () => { catTrack.scrollBy({ left: 280, behavior: 'smooth' }); });
  }

  // Nav dropdown hover
  document.querySelectorAll('.sf-nav-item-wrapper').forEach(wrapper => {
    const dropdown = wrapper.querySelector('.sf-nav-dropdown');
    if (!dropdown) return;
    let timer;
    wrapper.addEventListener('mouseenter', () => { clearTimeout(timer); dropdown.style.display = 'block'; });
    wrapper.addEventListener('mouseleave', () => { timer = setTimeout(() => { dropdown.style.display = 'none'; }, 150); });
  });

  // Quick View Modal
  document.querySelectorAll('.sf-quickview-btn, .sf-quickadd-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const card = btn.closest('.sf-product-card');
      if (!card) return;
      const name = card.querySelector('.sf-product-name')?.textContent || '';
      const price = card.querySelector('.sf-product-price')?.textContent || '';
      const img = card.querySelector('.sf-product-image img')?.src || '';
      let modal = document.getElementById('QuickViewModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'QuickViewModal';
        modal.className = 'sf-quickview-overlay';
        modal.innerHTML = '<div class="sf-quickview-modal"><button class="sf-quickview-close" id="QVClose"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="sf-quickview-inner"><div class="sf-quickview-gallery"><div class="sf-quickview-main-img" id="QVImg"></div></div><div class="sf-quickview-info"><h2 class="sf-quickview-name" id="QVName"></h2><div class="sf-quickview-price" id="QVPrice"></div><div class="sf-option-label" style="margin-top:16px">Size</div><div class="sf-size-btns" style="margin-top:8px"><button class="sf-size-btn active">XS</button><button class="sf-size-btn">S</button><button class="sf-size-btn">M</button><button class="sf-size-btn">L</button><button class="sf-size-btn">XL</button></div><div style="margin-top:24px"><button class="sf-drawer-add-btn" style="width:100%">Add to Cart</button></div></div></div></div>';
        document.body.appendChild(modal);
        document.getElementById('QVClose')?.addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        modal.querySelectorAll('.sf-size-btn').forEach(b => b.addEventListener('click', () => {
          modal.querySelectorAll('.sf-size-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        }));
      }
      document.getElementById('QVName').textContent = name;
      document.getElementById('QVPrice').textContent = price;
      const imgEl = document.getElementById('QVImg');
      imgEl.innerHTML = img ? '<img src="' + img + '" alt="' + name + '" style="width:100%;height:100%;object-fit:cover">' : '';
      modal.style.display = 'flex';
    });
  });

  // Quick Add Drawer (video section)
  const overlay = document.getElementById('DrawerOverlay');
  const drawer = document.getElementById('QuickAddDrawer');
  document.querySelectorAll('.sf-quick-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (overlay) overlay.style.display = 'block';
      if (drawer) drawer.style.display = 'flex';
    });
  });
  function closeDrawer() {
    if (overlay) overlay.style.display = 'none';
    if (drawer) drawer.style.display = 'none';
  }
  document.getElementById('DrawerClose')?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Newsletter Popup
  const popup = document.getElementById('NewsletterPopup');
  if (popup) {
    const delay = parseInt(popup.dataset.delay || '3') * 1000;
    setTimeout(() => { popup.style.display = 'flex'; }, delay);
    document.getElementById('PopupClose')?.addEventListener('click', () => { popup.style.display = 'none'; });
    popup.addEventListener('click', e => { if (e.target === popup) popup.style.display = 'none'; });
  }
});
`;
}
