-- GZNSPORTS // MASTER DATABASE SCHEMA & SEED SCRIPT
-- Execute via Supabase CLI

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  tag TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_size TEXT,
  image TEXT NOT NULL,
  description TEXT,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock_quantity INTEGER DEFAULT 100,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SITE SETTINGS TABLE (Powers full customization from Admin Panel)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_cost NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'PENDING',
  payment_status TEXT DEFAULT 'PAID',
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ENABLE REALTIME ON ALL CORE TABLES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- 5. ROW LEVEL SECURITY (Permissive for Storefront & Admin)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Modify Products" ON public.products;
CREATE POLICY "Public Modify Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Settings" ON public.site_settings;
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Modify Settings" ON public.site_settings;
CREATE POLICY "Public Modify Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Modify Orders" ON public.orders;
CREATE POLICY "Public Modify Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 6. SEED INITIAL PRODUCTS
INSERT INTO public.products (
  id, title, category, category_name, price, tag, rating, reviews_count, sizes, default_size, image, description, specs, stock_quantity, is_featured
) VALUES 
(
  'gzn-undisputed-belt',
  'WWE Undisputed Championship Title Belt',
  'striking',
  'CHAMPIONSHIP // TROPHY ARMOR',
  499.00,
  'FLAGSHIP 24K DUAL-PLATED',
  5.0,
  312,
  '["OFFICIAL REPLICA", "DELUXE CAST 24K"]'::jsonb,
  'OFFICIAL REPLICA',
  '/images/belt/belt-center.jpg',
  'The pinnacle of sports entertainment glory. 8mm CNC deep-relief 24K dual-gold plates, hand-set cubic zirconia crystals, authentic globe side medallions, and full-grain saddle leather strap.',
  '[
    {"label": "Plate Metal", "value": "8mm CNC Deep-Relief 24K Dual-Plated Gold"},
    {"label": "Strap", "value": "Full-Grain Handcrafted Saddle Leather (52\")"},
    {"label": "Gemstones", "value": "1,000+ Precision Hand-Set Cubic Zirconia"},
    {"label": "Closure", "value": "Dual-Row 8-Snap Heavy Brass Snaps"}
  ]'::jsonb,
  25,
  true
),
(
  'gzn-x1',
  'GZN-X1 Apex Pro Sparring Glove',
  'striking',
  'STRIKING // BOXING',
  185.00,
  'FLAGSHIP BIOMECHANICS',
  4.9,
  184,
  '["12-OZ", "14-OZ", "16-OZ"]'::jsonb,
  '16-OZ',
  '/images/gear-macro.jpg',
  'Engineered with hand-selected 1.2mm full-grain nappa cowhide, quad-density IMF core, and dual-spine carbon-composite wrist stabilization.',
  '[
    {"label": "Leather", "value": "1.2mm Hand-Picked Full-Grain Nappa"},
    {"label": "Core", "value": "Quad-Layer Micro-Cellular IMF"},
    {"label": "Wrist Lock", "value": "Dual-Spine Carbon Exoskeleton"},
    {"label": "Lining", "value": "Silver-Ion Antimicrobial SilverThread™"}
  ]'::jsonb,
  80,
  true
),
(
  'gzn-mitts',
  'Precision Micro Target Mitts',
  'striking',
  'STRIKING // COACHING',
  95.00,
  'HIGH-VELOCITY REBOUND',
  4.8,
  92,
  '["STANDARD"]'::jsonb,
  'STANDARD',
  '/images/striking-hero.jpg',
  'Curved anatomical palm ball design for flawless grip tension, reduced coach wrist fatigue, and satisfying high-decibel pop on impact.',
  '[
    {"label": "Design", "value": "Concave Micro-Impact Pocket"},
    {"label": "Padding", "value": "High-Density Layered EVA Foam"},
    {"label": "Grip", "value": "Ergonomic Spherical Palm Anchor"}
  ]'::jsonb,
  50,
  false
),
(
  'gzn-headgear',
  'Armored Full-Face Combat Headgear',
  'striking',
  'STRIKING // DEFENSE',
  145.00,
  'ZERO-BLINDSPOT CAGE',
  5.0,
  76,
  '["M", "L", "XL"]'::jsonb,
  'L',
  '/images/gear-macro.jpg',
  '360-degree cranial defense with reinforced cheek and chin deflection geometry, low-profile ear canals, and secure cross-lacing system.',
  '[
    {"label": "Field of View", "value": "180° Panoramic Peripheral Sight"},
    {"label": "Protection", "value": "Molded Cheek & Mandible Shield"},
    {"label": "Weight", "value": "Ultra-lightweight 14.2oz"}
  ]'::jsonb,
  40,
  false
),
(
  'gzn-mma-4oz',
  'Stealth Grapple 4oz Hybrid Glove',
  'mma',
  'MMA // GRAPPLING',
  115.00,
  'UFC-GRADE METACARPAL',
  4.9,
  118,
  '["S/M", "L/XL"]'::jsonb,
  'L/XL',
  '/images/mma-athlete.jpg',
  'Segmented knuckle contour allows unrestricted finger flexion and transitions between heavy striking and submission grappling.',
  '[
    {"label": "Palm", "value": "Open-Palm Biomechanical Mobility"},
    {"label": "Foam", "value": "Gel-Infused 35mm Knuckle Shield"},
    {"label": "Closure", "value": "Dual-Directional Elastic Wrap"}
  ]'::jsonb,
  65,
  true
),
(
  'gzn-shin',
  'Carbon-Flex Combat Shin Armor',
  'mma',
  'MMA // MUAY THAI',
  130.00,
  'TIBIAL DEFLECTION',
  4.9,
  142,
  '["M", "L", "XL"]'::jsonb,
  'L',
  '/images/striking-hero.jpg',
  'Anatomically molded tibia spine deflects bone-on-bone impact during checked kicks. Dual anti-slip neoprene straps guarantee zero mid-round shifting.',
  '[
    {"label": "Spine", "value": "Carbon-Reinforced High-Impact Ridge"},
    {"label": "Foot Shield", "value": "Articulated Metatarsal Hinge"},
    {"label": "Stability", "value": "Dual 50mm Silicon-Grip Neoprene Straps"}
  ]'::jsonb,
  55,
  false
),
(
  'gzn-hydro-150',
  '150lb Hydro-Core Heavy Bag',
  'bags',
  'IMPACT ARCHITECTURE',
  285.00,
  'WATER DISPERSION CORE',
  5.0,
  64,
  '["150-LB"]'::jsonb,
  '150-LB',
  '/images/striking-hero.jpg',
  'Combines a dense pressurized water core with marine-grade vinyl and shock-dampening foam to recreate the authentic density of human muscle tissue.',
  '[
    {"label": "Capacity", "value": "150 lbs Hydro-Fillable Mass"},
    {"label": "Shell", "value": "Reinforced 1000D Ballistic Vinyl"},
    {"label": "Swivel", "value": "360° Industrial Anodized Steel Bearing"}
  ]'::jsonb,
  20,
  false
),
(
  'gzn-speed',
  'Italian Cowhide Speed Bag',
  'bags',
  'BAGS // CADENCE',
  75.00,
  'BALANCED CADENCE',
  4.7,
  53,
  '["8x5 PRO", "9x6 TRAINING"]'::jsonb,
  '8x5 PRO',
  '/images/gear-macro.jpg',
  'Precision balanced center of gravity with welded butyl rubber bladder for ultra-consistent rebound frequency and hand-eye cadence.',
  '[
    {"label": "Leather", "value": "Supple Italian Tanned Cowhide"},
    {"label": "Bladder", "value": "Air-Lock Welded Butyl Rubber"},
    {"label": "Seams", "value": "Heavy-Duty Waxed Cord Welting"}
  ]'::jsonb,
  90,
  false
),
(
  'gzn-rashguard',
  'Sub-Zero Thermal Rashguard',
  'apparel',
  'TECHNICAL APPAREL',
  68.00,
  'SECOND-SKIN COMPRESSION',
  4.8,
  89,
  '["S", "M", "L", "XL", "2XL"]'::jsonb,
  'L',
  '/images/mma-athlete.jpg',
  'Engineered with 4-way stretch moisture expulsion matrix, flatlock anti-chafing seams, and silicon waistband grip that will never ride up during sparring.',
  '[
    {"label": "Fabric", "value": "82% Technical Polyester, 18% Elastane"},
    {"label": "Hem", "value": "Non-Slip Micro-Ribbed Silicon Grip"},
    {"label": "Protection", "value": "SPF 50+ / Mat Burn Shield"}
  ]'::jsonb,
  120,
  false
)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  stock_quantity = EXCLUDED.stock_quantity;

-- 7. SEED SITE SETTINGS (Dynamic Content configurable via Admin Panel)
INSERT INTO public.site_settings (key, value) VALUES
(
  'hero_config',
  '{
    "badge_primary": "[ UNDISPUTED CHAMPIONSHIP ARMOR ]",
    "badge_secondary": "SPEC: 24K DUAL-PLATED // FULL-GRAIN LEATHER",
    "headline_top": "ARMOR OF",
    "headline_bottom": "CHAMPIONS",
    "subhead": "Forged for the apex of combat glory. Featuring CNC 8mm deep-relief 24K gold plates, hand-set cubic zirconia diamond crystals, and authentic dual globe side medallions on handcrafted saddle leather.",
    "cta_primary_text": "EXPLORE THE ARMORY",
    "cta_secondary_text": "DECONSTRUCT TITLE BELT (3D LAB)",
    "pin_top_text": "24K GOLD MAIN PLATE // 8MM CNC RELIEF",
    "pin_bottom_text": "DUAL-ROW HEAVY SNAP BOX & SADDLE LEATHER"
  }'::jsonb
),
(
  'announcements',
  '{
    "banner_text": "⚡ MOVE. IMPROVE. EVOLVE.",
    "shipping_threshold": 150,
    "shipping_text": "FREE US SHIPPING OVER $50",
    "warranty_text": "365-DAY STRIKE WARRANTY"
  }'::jsonb
),
(
  'manifesto',
  '{
    "quote": "\"THE BAG DOES NOT CARE ABOUT EXCUSES. THE RING DOES NOT FORGIVE WEAK WRISTS. WE DO NOT BUILD SPORTING GOODS. WE FORGE COMBAT ARMOR.\"",
    "body": "Mass-market combat brands rely on synthetic split-leather, single-foam molds, and flimsy velcro that collapses within six months. GZNSPORTS was built for fighters who spar five days a week and demand equipment that protects their metacarpals and wrist ligaments at maximum velocity.",
    "stats": [
      {"num": "99.4%", "label": "FORCE DISSIPATION", "sub": "Tested across 10,000 concussive strikes"},
      {"num": "1.2mm", "label": "FULL-GRAIN NAPPA", "sub": "Hand-selected top-tier cowhide"},
      {"num": "365D", "label": "STRIKE GUARANTEE", "sub": "Zero-risk replacement pledge"},
      {"num": "0.04s", "label": "RECOIL RECOVERY", "sub": "Instant kinetic memory foam"}
    ]
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();
