const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.xoizeqnphqtjjyodcfwk:Z32VxAQ9G91tCIIN@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function updateStore() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  // 1. Clear old products
  await client.query('DELETE FROM public.products;');

  // 2. Insert new belts and hoodies
  const products = [
    {
      id: 'genz-undisputed-belt',
      title: 'WWE Undisputed Championship Title Belt',
      category: 'belts',
      category_name: 'CHAMPIONSHIP // TROPHY ARMOR',
      price: 499.00,
      tag: 'FLAGSHIP 24K DUAL-PLATED',
      rating: 5.0,
      reviews_count: 312,
      sizes: JSON.stringify(['OFFICIAL REPLICA (52")', 'DELUXE CAST 24K']),
      default_size: 'OFFICIAL REPLICA (52")',
      image: '/images/hero-dual-showcase.jpg',
      description: 'The pinnacle of sports entertainment glory. 8mm CNC deep-relief 24K dual-gold plates, hand-set cubic zirconia crystals, authentic globe side medallions, and full-grain saddle leather strap.',
      specs: JSON.stringify([
        { label: 'Plate Metal', value: '8mm CNC Deep-Relief 24K Dual-Plated Gold' },
        { label: 'Strap', value: 'Full-Grain Handcrafted Saddle Leather (52")' },
        { label: 'Gemstones', value: '1,000+ Precision Hand-Set Cubic Zirconia' },
        { label: 'Closure', value: 'Dual-Row 8-Snap Heavy Brass Snaps' }
      ]),
      stock_quantity: 45,
      is_featured: true
    },
    {
      id: 'genz-world-heavyweight',
      title: 'World Heavyweight Championship "Big Gold" Belt',
      category: 'belts',
      category_name: 'HISTORIC // HEAVYWEIGHT CROWN',
      price: 479.00,
      tag: '8MM DEEP FLORAL RELIEF',
      rating: 4.9,
      reviews_count: 248,
      sizes: JSON.stringify(['STANDARD REPLICA (54")', 'PRO HEAVY BRASS CAST']),
      default_size: 'STANDARD REPLICA (54")',
      image: '/images/belts/world-heavyweight-belt.jpg',
      description: 'The legendary Big Gold standard. Meticulously cast with intricate floral filigree engraving, faceted ruby cabochons, crowned globe medallion, and midnight saddle leather.',
      specs: JSON.stringify([
        { label: 'Plate Relief', value: '8mm Deep-Relief Hand-Chiseled Filigree' },
        { label: 'Finish', value: '24K Dual-Dip Mirror & Stippled Gold' },
        { label: 'Crystals', value: 'Faceted Ruby Cabochon Accents' },
        { label: 'Leather', value: '4mm Beveled Obsidian Saddle Hide' }
      ]),
      stock_quantity: 38,
      is_featured: true
    },
    {
      id: 'genz-intercontinental',
      title: 'Classic Intercontinental Championship Belt',
      category: 'belts',
      category_name: 'WORKHORSE // TITLE LEGEND',
      price: 399.00,
      tag: 'PRISTINE WHITE LEATHER',
      rating: 4.9,
      reviews_count: 195,
      sizes: JSON.stringify(['WHITE SADDLE LEATHER', 'OBSIDIAN BLACK LEATHER']),
      default_size: 'WHITE SADDLE LEATHER',
      image: '/images/belts/intercontinental-belt.jpg',
      description: 'The title that forged legends. Features brilliant 24K mirror-polished gold plates on hand-selected pristine white saddle leather with dual globe sideplates and ornate gold tip.',
      specs: JSON.stringify([
        { label: 'Leather Strap', value: 'Pristine White Handcrafted Cowhide (50")' },
        { label: 'Medallions', value: 'Triple Globe Cartography in 24K Gold' },
        { label: 'Plates', value: '6mm Solid Cast Mirror Finished Brass' },
        { label: 'Accents', value: 'Sapphire & Ruby Micro-Prism Crystals' }
      ]),
      stock_quantity: 30,
      is_featured: true
    },
    {
      id: 'genz-hoodie-heavyweight-450',
      title: 'GENZ Apex 450GSM French Terry Heavyweight Hoodie',
      category: 'hoodies',
      category_name: 'STREETWEAR // 450GSM FLEECE',
      price: 125.00,
      tag: '450GSM COMBAT FLEECE',
      rating: 5.0,
      reviews_count: 420,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
      default_size: 'L',
      image: '/images/hoodies/genz-heavyweight-hoodie.jpg',
      description: 'Built like combat armor for streetwear champions. Cut from 450GSM ultra-dense combed cotton French Terry with custom 3D chrome & orange GENZ hardware, thick double-layered hood, and 24K gold dipped aglets.',
      specs: JSON.stringify([
        { label: 'Weight', value: '450 GSM Ultra-Heavy French Terry Cotton' },
        { label: 'Hardware', value: '24K Gold Dipped Metal Drawstring Aglets' },
        { label: 'Emblem', value: 'High-Density 3D Molded Chrome & Orange' },
        { label: 'Fit', value: 'Custom Drop-Shoulder Relaxed Streetwear Cut' }
      ]),
      stock_quantity: 85,
      is_featured: true
    },
    {
      id: 'genz-hoodie-raw-cut',
      title: 'GENZ Raw-Cut Vintage Combat Hoodie',
      category: 'hoodies',
      category_name: 'COMBAT // RAW-CUT HEAVY',
      price: 115.00,
      tag: 'VINTAGE ENZYME WASH',
      rating: 4.8,
      reviews_count: 167,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
      default_size: 'L',
      image: '/images/hoodies/genz-raw-cut-hoodie.jpg',
      description: 'An aggressive silhouette featuring raw-cut distressed hem, vintage mineral enzyme wash, and heavyweight 420GSM fleece. Reinforced side gussets allow maximum mobility.',
      specs: JSON.stringify([
        { label: 'Fleece', value: '420 GSM Mineral Enzyme Washed Cotton' },
        { label: 'Hem', value: 'Hand-Distressed Raw Combat Cut' },
        { label: 'Gussets', value: 'Ribbed Biomechanical Mobility Panels' },
        { label: 'Crest', value: 'Tonal Matte Silicone Chevron Chest Seal' }
      ]),
      stock_quantity: 60,
      is_featured: true
    },
    {
      id: 'genz-hoodie-zip-championship',
      title: 'GENZ Championship Full-Zip Gold Aglet Hoodie',
      category: 'hoodies',
      category_name: 'CHAMPIONSHIP // DUAL ZIP',
      price: 135.00,
      tag: '24K GOLD ZIP HARDWARE',
      rating: 4.9,
      reviews_count: 215,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
      default_size: 'L',
      image: '/images/hoodies/genz-zip-hoodie.jpg',
      description: 'The athlete walkout essential. Premium heavy fleece equipped with two-way heavy brass zipper, 24K gold hardware accents, tonal GENZ wrist embroidery, and fleece-lined kangaroo pockets.',
      specs: JSON.stringify([
        { label: 'Zipper', value: 'Two-Way Heavy-Duty Solid Brass Hardware' },
        { label: 'Weight', value: '440 GSM Dense Brushed Cotton Fleece' },
        { label: 'Embroidery', value: 'Metallic Gold Thread Capped Monogram' },
        { label: 'Pockets', value: 'Concealed Interior Tech Security Pockets' }
      ]),
      stock_quantity: 52,
      is_featured: true
    },
    {
      id: 'genz-belt-wall-mount',
      title: 'Heavy-Duty Championship Title Belt Wall Mount',
      category: 'accessories',
      category_name: 'DISPLAY // ARMORY HARDWARE',
      price: 45.00,
      tag: 'LASER-CUT STEEL',
      rating: 5.0,
      reviews_count: 94,
      sizes: JSON.stringify(['STANDARD SINGLE MOUNT', 'DUAL BELT PACK']),
      default_size: 'STANDARD SINGLE MOUNT',
      image: '/images/gear-macro.jpg',
      description: 'Showcase your championship gold with museum-grade strength. Precision laser-cut 4mm cold-rolled steel coated in obsidian black powder coat with heavy brass snap anchors.',
      specs: JSON.stringify([
        { label: 'Material', value: '4mm Cold-Rolled Laser-Cut Steel' },
        { label: 'Coating', value: 'Matte Obsidian Anti-Scratch Powder Coat' },
        { label: 'Capacity', value: 'Holds Belts up to 25 lbs (11.3 kg)' },
        { label: 'Hardware', value: 'Heavy Drywall & Stud Anchors Included' }
      ]),
      stock_quantity: 110,
      is_featured: false
    },
    {
      id: 'genz-belt-velvet-case',
      title: 'Luxury Velvet & Leather Belt Travel Armor Case',
      category: 'accessories',
      category_name: 'TRANSIT // COMBAT ARMOR',
      price: 65.00,
      tag: 'PLUSH VELVET LINING',
      rating: 4.8,
      reviews_count: 73,
      sizes: JSON.stringify(['54" PRO CASE']),
      default_size: '54" PRO CASE',
      image: '/images/gear-macro.jpg',
      description: 'Engineered for champions on tour. 1680D ballistic nylon exterior lined with deep crush velvet and 10mm high-density impact foam to ensure zero gold plate scratching.',
      specs: JSON.stringify([
        { label: 'Shell', value: '1680D Water-Resistant Ballistic Nylon' },
        { label: 'Lining', value: 'Crush Royal Velvet with 10mm Foam Core' },
        { label: 'Length', value: '56" Overall Length (Fits All Pro Belts)' },
        { label: 'Zipper', value: 'Heavy Duty Self-Healing YKK Zippers' }
      ]),
      stock_quantity: 75,
      is_featured: false
    }
  ];

  for (const p of products) {
    await client.query(`
      INSERT INTO public.products (
        id, title, category, category_name, price, tag, rating, reviews_count, sizes, default_size, image, description, specs, stock_quantity, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
    `, [
      p.id, p.title, p.category, p.category_name, p.price, p.tag, p.rating, p.reviews_count,
      p.sizes, p.default_size, p.image, p.description, p.specs, p.stock_quantity, p.is_featured
    ]);
  }
  console.log('Seeded 8 new wrestling belts and hoodies products!');

  // 3. Update Site Settings for Belts & Hoodies
  const newHeroConfig = {
    badge_primary: "GENZ CHAMPIONSHIP WEAPONRY",
    badge_secondary: "24K DUAL-PLATED BELTS & 450GSM FLEECE HOODIES",
    headline_top: "ARMOR OF",
    headline_bottom: "CHAMPIONS",
    subhead: "The undisputed apex of combat glory and luxury streetwear. Handcrafted 8mm CNC 24K gold championship belts and ultra-heavyweight 450GSM combat hoodies forged for modern royalty.",
    cta_primary_text: "EXPLORE THE ARMORY",
    cta_secondary_text: "INSPECT BELTS & HOODIES (STUDIO)",
    pin_top_text: "24K CNC DEEP RELIEF GOLD // SADDLE LEATHER",
    pin_bottom_text: "450GSM HEAVYWEIGHT FLEECE // GOLD AGLETS"
  };

  const newAnnouncements = {
    banner_text: "⚡ GENZ SPORTS: WRESTLING TITLE BELTS & HEAVYWEIGHT HOODIES",
    shipping_text: "FREE EXPRESS SHIPPING OVER $100",
    warranty_text: "365-DAY STRIKE & SNAP WARRANTY",
    shipping_threshold: 100
  };

  const newManifesto = {
    quote: "THE TITLE DOES NOT BELONG TO PRETENDERS. THE STREETS DO NOT RESPECT FLIMSY FABRIC. WE DO NOT BUILD SPORTING GOODS. WE FORGE CHAMPIONSHIP GOLD & HEAVYWEIGHT COMBAT HOODIES.",
    body: "Mass-market brands sell cheap zinc alloy belts that bend under pressure and thin 280GSM polyester blends that pill after two washes. GENZ SPORTS builds for warriors and champions who demand 8mm solid brass 24K gold plates, full-grain saddle leather, and 450GSM combed cotton fleece engineered to last a lifetime."
  };

  await client.query(`
    UPDATE public.site_settings SET value = $1 WHERE key = 'hero_config';
    UPDATE public.site_settings SET value = $2 WHERE key = 'announcements';
    UPDATE public.site_settings SET value = $3 WHERE key = 'manifesto';
  `, [JSON.stringify(newHeroConfig), JSON.stringify(newAnnouncements), JSON.stringify(newManifesto)]);
  console.log('Updated site settings for wrestling belts and hoodies!');

  await client.end();
}

updateStore().catch(console.error);
