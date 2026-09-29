// GZNSPORTS E-Commerce Store & Product Catalog
import { playPunchImpact, playMetallicClick } from './audio.js';

export const PRODUCTS = [
  {
    id: 'gzn-undisputed-belt',
    title: 'WWE Undisputed Championship Title Belt',
    category: 'striking',
    categoryName: 'CHAMPIONSHIP // TROPHY ARMOR',
    price: 499,
    tag: 'FLAGSHIP 24K DUAL-PLATED',
    rating: 5.0,
    reviewsCount: 312,
    sizes: ['OFFICIAL REPLICA', 'DELUXE CAST 24K'],
    defaultSize: 'OFFICIAL REPLICA',
    image: '/images/gear-macro.jpg',
    description: 'The pinnacle of sports entertainment glory. 8mm CNC deep-relief 24K dual-gold plates, hand-set cubic zirconia crystals, authentic globe side medallions, and full-grain saddle leather strap.',
    specs: [
      { label: 'Plate Metal', value: '8mm CNC Deep-Relief 24K Dual-Plated Gold' },
      { label: 'Strap', value: 'Full-Grain Handcrafted Saddle Leather (52")' },
      { label: 'Gemstones', value: '1,000+ Precision Hand-Set Cubic Zirconia' },
      { label: 'Closure', value: 'Dual-Row 8-Snap Heavy Brass Snaps' }
    ]
  },
  {
    id: 'gzn-x1',
    title: 'GZN-X1 Apex Pro Sparring Glove',
    category: 'striking',
    categoryName: 'STRIKING // BOXING',
    price: 185,
    tag: 'FLAGSHIP BIOMECHANICS',
    rating: 4.9,
    reviewsCount: 184,
    sizes: ['12-OZ', '14-OZ', '16-OZ'],
    defaultSize: '16-OZ',
    image: '/images/gear-macro.jpg',
    description: 'Engineered with hand-selected 1.2mm full-grain nappa cowhide, quad-density IMF core, and dual-spine carbon-composite wrist stabilization.',
    specs: [
      { label: 'Leather', value: '1.2mm Hand-Picked Full-Grain Nappa' },
      { label: 'Core', value: 'Quad-Layer Micro-Cellular IMF' },
      { label: 'Wrist Lock', value: 'Dual-Spine Carbon Exoskeleton' },
      { label: 'Lining', value: 'Silver-Ion Antimicrobial SilverThread™' }
    ]
  },
  {
    id: 'gzn-mitts',
    title: 'Precision Micro Target Mitts',
    category: 'striking',
    categoryName: 'STRIKING // COACHING',
    price: 95,
    tag: 'HIGH-VELOCITY REBOUND',
    rating: 4.8,
    reviewsCount: 92,
    sizes: ['STANDARD'],
    defaultSize: 'STANDARD',
    image: '/images/striking-hero.jpg',
    description: 'Curved anatomical palm ball design for flawless grip tension, reduced coach wrist fatigue, and satisfying high-decibel pop on impact.',
    specs: [
      { label: 'Design', value: 'Concave Micro-Impact Pocket' },
      { label: 'Padding', value: 'High-Density Layered EVA Foam' },
      { label: 'Grip', value: 'Ergonomic Spherical Palm Anchor' }
    ]
  },
  {
    id: 'gzn-headgear',
    title: 'Armored Full-Face Combat Headgear',
    category: 'striking',
    categoryName: 'STRIKING // DEFENSE',
    price: 145,
    tag: 'ZERO-BLINDSPOT CAGE',
    rating: 5.0,
    reviewsCount: 76,
    sizes: ['M', 'L', 'XL'],
    defaultSize: 'L',
    image: '/images/gear-macro.jpg',
    description: '360-degree cranial defense with reinforced cheek and chin deflection geometry, low-profile ear canals, and secure cross-lacing system.',
    specs: [
      { label: 'Field of View', value: '180° Panoramic Peripheral Sight' },
      { label: 'Protection', value: 'Molded Cheek & Mandible Shield' },
      { label: 'Weight', value: 'Ultra-lightweight 14.2oz' }
    ]
  },
  {
    id: 'gzn-mma-4oz',
    title: 'Stealth Grapple 4oz Hybrid Glove',
    category: 'mma',
    categoryName: 'MMA // GRAPPLING',
    price: 115,
    tag: 'UFC-GRADE METACARPAL',
    rating: 4.9,
    reviewsCount: 118,
    sizes: ['S/M', 'L/XL'],
    defaultSize: 'L/XL',
    image: '/images/mma-athlete.jpg',
    description: 'Segmented knuckle contour allows unrestricted finger flexion and transitions between heavy striking and submission grappling.',
    specs: [
      { label: 'Palm', value: 'Open-Palm Biomechanical Mobility' },
      { label: 'Foam', value: 'Gel-Infused 35mm Knuckle Shield' },
      { label: 'Closure', value: 'Dual-Directional Elastic Wrap' }
    ]
  },
  {
    id: 'gzn-shin',
    title: 'Carbon-Flex Combat Shin Armor',
    category: 'mma',
    categoryName: 'MMA // MUAY THAI',
    price: 130,
    tag: 'TIBIAL DEFLECTION',
    rating: 4.9,
    reviewsCount: 142,
    sizes: ['M', 'L', 'XL'],
    defaultSize: 'L',
    image: '/images/striking-hero.jpg',
    description: 'Anatomically molded tibia spine deflects bone-on-bone impact during checked kicks. Dual anti-slip neoprene straps guarantee zero mid-round shifting.',
    specs: [
      { label: 'Spine', value: 'Carbon-Reinforced High-Impact Ridge' },
      { label: 'Foot Shield', value: 'Articulated Metatarsal Hinge' },
      { label: 'Stability', value: 'Dual 50mm Silicon-Grip Neoprene Straps' }
    ]
  },
  {
    id: 'gzn-hydro-150',
    title: '150lb Hydro-Core Heavy Bag',
    category: 'bags',
    categoryName: 'IMPACT ARCHITECTURE',
    price: 285,
    tag: 'WATER DISPERSION CORE',
    rating: 5.0,
    reviewsCount: 64,
    sizes: ['150-LB'],
    defaultSize: '150-LB',
    image: '/images/striking-hero.jpg',
    description: 'Combines a dense pressurized water core with marine-grade vinyl and shock-dampening foam to recreate the authentic density of human muscle tissue.',
    specs: [
      { label: 'Capacity', value: '150 lbs Hydro-Fillable Mass' },
      { label: 'Shell', value: 'Reinforced 1000D Ballistic Vinyl' },
      { label: 'Swivel', value: '360° Industrial Anodized Steel Bearing' }
    ]
  },
  {
    id: 'gzn-speed',
    title: 'Italian Cowhide Speed Bag',
    category: 'bags',
    categoryName: 'BAGS // CADENCE',
    price: 75,
    tag: 'BALANCED CADENCE',
    rating: 4.7,
    reviewsCount: 53,
    sizes: ['8x5 PRO', '9x6 TRAINING'],
    defaultSize: '8x5 PRO',
    image: '/images/gear-macro.jpg',
    description: 'Precision balanced center of gravity with welded butyl rubber bladder for ultra-consistent rebound frequency and hand-eye cadence.',
    specs: [
      { label: 'Leather', value: 'Supple Italian Tanned Cowhide' },
      { label: 'Bladder', value: 'Air-Lock Welded Butyl Rubber' },
      { label: 'Seams', value: 'Heavy-Duty Waxed Cord Welting' }
    ]
  },
  {
    id: 'gzn-rashguard',
    title: 'Sub-Zero Thermal Rashguard',
    category: 'apparel',
    categoryName: 'TECHNICAL APPAREL',
    price: 68,
    tag: 'SECOND-SKIN COMPRESSION',
    rating: 4.8,
    reviewsCount: 89,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultSize: 'L',
    image: '/images/mma-athlete.jpg',
    description: 'Engineered with 4-way stretch moisture expulsion matrix, flatlock anti-chafing seams, and silicon waistband grip that will never ride up during sparring.',
    specs: [
      { label: 'Fabric', value: '82% Technical Polyester, 18% Elastane' },
      { label: 'Hem', value: 'Non-Slip Micro-Ribbed Silicon Grip' },
      { label: 'Protection', value: 'SPF 50+ / Mat Burn Shield' }
    ]
  }
];

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.listeners = [];
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

  getFreeShippingProgress() {
    const threshold = 150;
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

