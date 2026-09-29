// GENZ SPORTS E-Commerce Store & Product Catalog
import { playPunchImpact, playMetallicClick } from './audio.js';

export const PRODUCTS = [
  {
    id: 'genz-undisputed-belt',
    title: 'WWE Undisputed Championship Title Belt',
    category: 'belts',
    categoryName: 'CHAMPIONSHIP // TROPHY ARMOR',
    price: 499,
    tag: 'FLAGSHIP 24K DUAL-PLATED',
    rating: 5.0,
    reviewsCount: 312,
    sizes: ['OFFICIAL REPLICA (52")', 'DELUXE CAST 24K'],
    defaultSize: 'OFFICIAL REPLICA (52")',
    image: '/images/hero-dual-showcase.jpg',
    description: 'The pinnacle of sports entertainment glory. 8mm CNC deep-relief 24K dual-gold plates, hand-set cubic zirconia crystals, authentic globe side medallions, and full-grain saddle leather strap.',
    specs: [
      { label: 'Plate Metal', value: '8mm CNC Deep-Relief 24K Dual-Plated Gold' },
      { label: 'Strap', value: 'Full-Grain Handcrafted Saddle Leather (52")' },
      { label: 'Gemstones', value: '1,000+ Precision Hand-Set Cubic Zirconia' },
      { label: 'Closure', value: 'Dual-Row 8-Snap Heavy Brass Snaps' }
    ]
  },
  {
    id: 'genz-world-heavyweight',
    title: 'World Heavyweight Championship "Big Gold" Belt',
    category: 'belts',
    categoryName: 'HISTORIC // HEAVYWEIGHT CROWN',
    price: 479,
    tag: '8MM DEEP FLORAL RELIEF',
    rating: 4.9,
    reviewsCount: 248,
    sizes: ['STANDARD REPLICA (54")', 'PRO HEAVY BRASS CAST'],
    defaultSize: 'STANDARD REPLICA (54")',
    image: '/images/belts/world-heavyweight-belt.jpg',
    description: 'The legendary Big Gold standard. Meticulously cast with intricate floral filigree engraving, faceted ruby cabochons, crowned globe medallion, and midnight saddle leather.',
    specs: [
      { label: 'Plate Relief', value: '8mm Deep-Relief Hand-Chiseled Filigree' },
      { label: 'Finish', value: '24K Dual-Dip Mirror & Stippled Gold' },
      { label: 'Crystals', value: 'Faceted Ruby Cabochon Accents' },
      { label: 'Leather', value: '4mm Beveled Obsidian Saddle Hide' }
    ]
  },
  {
    id: 'genz-intercontinental',
    title: 'Classic Intercontinental Championship Belt',
    category: 'belts',
    categoryName: 'WORKHORSE // TITLE LEGEND',
    price: 399,
    tag: 'PRISTINE WHITE LEATHER',
    rating: 4.9,
    reviewsCount: 195,
    sizes: ['WHITE SADDLE LEATHER', 'OBSIDIAN BLACK LEATHER'],
    defaultSize: 'WHITE SADDLE LEATHER',
    image: '/images/belts/intercontinental-belt.jpg',
    description: 'The title that forged legends. Features brilliant 24K mirror-polished gold plates on hand-selected pristine white saddle leather with dual globe sideplates and ornate gold tip.',
    specs: [
      { label: 'Leather Strap', value: 'Pristine White Handcrafted Cowhide (50")' },
      { label: 'Medallions', value: 'Triple Globe Cartography in 24K Gold' },
      { label: 'Plates', value: '6mm Solid Cast Mirror Finished Brass' },
      { label: 'Accents', value: 'Sapphire & Ruby Micro-Prism Crystals' }
    ]
  },
  {
    id: 'genz-hoodie-heavyweight-450',
    title: 'GENZ Apex 450GSM French Terry Heavyweight Hoodie',
    category: 'hoodies',
    categoryName: 'STREETWEAR // 450GSM FLEECE',
    price: 125,
    tag: '450GSM COMBAT FLEECE',
    rating: 5.0,
    reviewsCount: 420,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultSize: 'L',
    image: '/images/hoodies/genz-heavyweight-hoodie.jpg',
    description: 'Built like combat armor for streetwear champions. Cut from 450GSM ultra-dense combed cotton French Terry with custom 3D chrome & orange GENZ hardware, thick double-layered hood, and 24K gold dipped aglets.',
    specs: [
      { label: 'Weight', value: '450 GSM Ultra-Heavy French Terry Cotton' },
      { label: 'Hardware', value: '24K Gold Dipped Metal Drawstring Aglets' },
      { label: 'Emblem', value: 'High-Density 3D Molded Chrome & Orange' },
      { label: 'Fit', value: 'Custom Drop-Shoulder Relaxed Streetwear Cut' }
    ]
  },
  {
    id: 'genz-hoodie-raw-cut',
    title: 'GENZ Raw-Cut Vintage Combat Hoodie',
    category: 'hoodies',
    categoryName: 'COMBAT // RAW-CUT HEAVY',
    price: 115,
    tag: 'VINTAGE ENZYME WASH',
    rating: 4.8,
    reviewsCount: 167,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultSize: 'L',
    image: '/images/hoodies/genz-raw-cut-hoodie.jpg',
    description: 'An aggressive silhouette featuring raw-cut distressed hem, vintage mineral enzyme wash, and heavyweight 420GSM fleece. Reinforced side gussets allow maximum mobility.',
    specs: [
      { label: 'Fleece', value: '420 GSM Mineral Enzyme Washed Cotton' },
      { label: 'Hem', value: 'Hand-Distressed Raw Combat Cut' },
      { label: 'Gussets', value: 'Ribbed Biomechanical Mobility Panels' },
      { label: 'Crest', value: 'Tonal Matte Silicone Chevron Chest Seal' }
    ]
  },
  {
    id: 'genz-hoodie-zip-championship',
    title: 'GENZ Championship Full-Zip Gold Aglet Hoodie',
    category: 'hoodies',
    categoryName: 'CHAMPIONSHIP // DUAL ZIP',
    price: 135,
    tag: '24K GOLD ZIP HARDWARE',
    rating: 4.9,
    reviewsCount: 215,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultSize: 'L',
    image: '/images/hoodies/genz-zip-hoodie.jpg',
    description: 'The athlete walkout essential. Premium heavy fleece equipped with two-way heavy brass zipper, 24K gold hardware accents, tonal GENZ wrist embroidery, and fleece-lined kangaroo pockets.',
    specs: [
      { label: 'Zipper', value: 'Two-Way Heavy-Duty Solid Brass Hardware' },
      { label: 'Weight', value: '440 GSM Dense Brushed Cotton Fleece' },
      { label: 'Embroidery', value: 'Metallic Gold Thread Capped Monogram' },
      { label: 'Pockets', value: 'Concealed Interior Tech Security Pockets' }
    ]
  },
  {
    id: 'genz-belt-wall-mount',
    title: 'Heavy-Duty Championship Title Belt Wall Mount',
    category: 'accessories',
    categoryName: 'DISPLAY // ARMORY HARDWARE',
    price: 45,
    tag: 'LASER-CUT STEEL',
    rating: 5.0,
    reviewsCount: 94,
    sizes: ['STANDARD SINGLE MOUNT', 'DUAL BELT PACK'],
    defaultSize: 'STANDARD SINGLE MOUNT',
    image: '/images/gear-macro.jpg',
    description: 'Showcase your championship gold with museum-grade strength. Precision laser-cut 4mm cold-rolled steel coated in obsidian black powder coat with heavy brass snap anchors.',
    specs: [
      { label: 'Material', value: '4mm Cold-Rolled Laser-Cut Steel' },
      { label: 'Coating', value: 'Matte Obsidian Anti-Scratch Powder Coat' },
      { label: 'Capacity', value: 'Holds Belts up to 25 lbs (11.3 kg)' },
      { label: 'Hardware', value: 'Heavy Drywall & Stud Anchors Included' }
    ]
  },
  {
    id: 'genz-belt-velvet-case',
    title: 'Luxury Velvet & Leather Belt Travel Armor Case',
    category: 'accessories',
    categoryName: 'TRANSIT // COMBAT ARMOR',
    price: 65,
    tag: 'PLUSH VELVET LINING',
    rating: 4.8,
    reviewsCount: 73,
    sizes: ['54" PRO CASE'],
    defaultSize: '54" PRO CASE',
    image: '/images/gear-macro.jpg',
    description: 'Engineered for champions on tour. 1680D ballistic nylon exterior lined with deep crush velvet and 10mm high-density impact foam to ensure zero gold plate scratching.',
    specs: [
      { label: 'Shell', value: '1680D Water-Resistant Ballistic Nylon' },
      { label: 'Lining', value: 'Crush Royal Velvet with 10mm Foam Core' },
      { label: 'Length', value: '56" Overall Length (Fits All Pro Belts)' },
      { label: 'Zipper', value: 'Heavy Duty Self-Healing YKK Zippers' }
    ]
  }
];

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.listeners = [];
    this.currency = 'USD';
    this.rates = {
      USD: 1.0,
      GBP: 0.79,
      EUR: 0.92,
      CAD: 1.36,
      AUD: 1.52
    };
    this.symbols = {
      USD: '$',
      GBP: '£',
      EUR: '€',
      CAD: 'CA$',
      AUD: 'A$'
    };
    this.discountCode = null;
    this.discountPercent = 0;
    this.discountAmount = 0;
  }

  setCurrency(cur) {
    if (this.rates[cur]) {
      this.currency = cur;
      this.notify();
    }
  }

  getCurrency() {
    return this.currency;
  }

  getCurrencySymbol() {
    return this.symbols[this.currency] || '$';
  }

  formatPrice(amountInUSD) {
    const rate = this.rates[this.currency] || 1.0;
    const symbol = this.getCurrencySymbol();
    const converted = amountInUSD * rate;
    return `${symbol}${converted.toFixed(2)}`;
  }

  applyPromoCode(code) {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'CHAMPION10') {
      this.discountCode = clean;
      this.discountPercent = 10;
      this.discountAmount = 0;
      this.notify();
      return { success: true, message: '10% Champion Discount Applied!' };
    } else if (clean === 'GENZVIP') {
      this.discountCode = clean;
      this.discountPercent = 0;
      this.discountAmount = 50;
      this.notify();
      return { success: true, message: '$50 VIP Combat Credit Applied!' };
    }
    return { success: false, message: 'Invalid or expired promotional code.' };
  }

  removePromoCode() {
    this.discountCode = null;
    this.discountPercent = 0;
    this.discountAmount = 0;
    this.notify();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('gzn_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('gzn_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.cart));
  }

  addToCart(productId, size = null, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const chosenSize = size || product.defaultSize || 'STANDARD';
    const existingIndex = this.cart.findIndex(item => item.id === productId && item.size === chosenSize);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        size: chosenSize,
        image: product.image,
        quantity: quantity
      });
    }

    playPunchImpact();
    this.saveCart();
  }

  removeFromCart(id, size) {
    this.cart = this.cart.filter(item => !(item.id === id && item.size === size));
    playMetallicClick();
    this.saveCart();
  }

  updateQuantity(id, size, delta) {
    const item = this.cart.find(item => item.id === id && item.size === size);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(id, size);
    } else {
      playMetallicClick();
      this.saveCart();
    }
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartDiscount() {
    const subtotal = this.getCartSubtotal();
    if (this.discountPercent > 0) {
      return (subtotal * this.discountPercent) / 100;
    }
    if (this.discountAmount > 0) {
      return Math.min(subtotal, this.discountAmount);
    }
    return 0;
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    const discount = this.getCartDiscount();
    return Math.max(0, subtotal - discount);
  }

  getFreeShippingProgress() {
    const threshold = 100;
    const subtotal = this.getCartSubtotal();
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
    const remaining = Math.max(0, threshold - subtotal);
    return { threshold, subtotal, percent, remaining, unlocked: remaining === 0 };
  }

  setProducts(newProducts) {
    if (!Array.isArray(newProducts) || newProducts.length === 0) return;
    PRODUCTS.splice(0, PRODUCTS.length, ...newProducts);
    this.notify();
  }

  getProducts() {
    return PRODUCTS;
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }
}

export const store = new Store();

