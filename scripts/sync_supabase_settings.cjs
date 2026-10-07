require('node:process').loadEnvFile('.env.backend');
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function sync() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  // Remove obsolete boxing/MMA products
  const delRes = await client.query("DELETE FROM public.products WHERE id NOT LIKE 'genz-%'");
  console.log(`Cleaned up obsolete products: ${delRes.rowCount} rows removed.`);

  // Site settings
  const newHeroConfig = {
    badge_primary: "OFFICIAL CHAMPIONSHIP ARMOR",
    badge_secondary: "24K GOLD TITLE BELTS // 450GSM COMBAT HOODIES",
    headline_top: "ARMOR OF",
    headline_bottom: "CHAMPIONS",
    subhead: "The apex of wrestling title belts and heavyweight combat streetwear. Featuring CNC 8mm deep-relief 24K dual-plated gold, handcrafted saddle leather, and 450GSM ultra-dense French Terry fleece.",
    cta_primary_text: "EXPLORE TITLE BELTS & HOODIES",
    cta_secondary_text: "THE CRAFTSMANSHIP LAB (SPEC ARCHIVE)",
    pin_top_text: "8MM 24K GOLD MAIN PLATE // CNC RELIEF",
    pin_bottom_text: "450GSM FRENCH TERRY // COMBED LONG-STAPLE COTTON"
  };

  const newAnnouncements = {
    banner_text: "⚡ MOVE. IMPROVE. EVOLVE.",
    shipping_text: "FREE WORLDWIDE AIR DISPATCH OVER $100",
    warranty_text: "365-DAY STRIKE & SNAP WARRANTY",
    shipping_threshold: 100,
    items: [
      "⚡ MOVE. IMPROVE. EVOLVE.",
      "FREE WORLDWIDE AIR DISPATCH OVER $100",
      "365-DAY STRIKE & SNAP WARRANTY"
    ]
  };

  const newManifesto = {
    quote: "THE MAT DOES NOT FORGIVE COMPROMISE. WE DO NOT BUILD PLASTIC REPLICAS. WE FORGE CHAMPIONSHIP GOLD & HEAVYWEIGHT COMBAT HOODIES.",
    body: "Mass-market companies cut corners with hollow zinc plates, cracking vinyl leatherette, and flimsy 260GSM polyester hoodies that lose their shape in three washes. GENZ SPORTS is forged for champions and dedicated combat athletes who demand authentic 8mm 24K gold relief plates, vegetable-tanned saddle leather, and 450GSM combed cotton with lifetime structural integrity."
  };

  await client.query("UPDATE public.site_settings SET value = $1 WHERE key = 'hero_config'", [JSON.stringify(newHeroConfig)]);
  await client.query("UPDATE public.site_settings SET value = $1 WHERE key = 'announcements'", [JSON.stringify(newAnnouncements)]);
  await client.query("UPDATE public.site_settings SET value = $1 WHERE key = 'manifesto'", [JSON.stringify(newManifesto)]);
  console.log('Site settings updated successfully in Supabase!');

  const prods = await client.query("SELECT id, title, category, price FROM public.products ORDER BY price DESC");
  console.log(`Active Supabase Products (${prods.rows.length}):`);
  prods.rows.forEach(r => console.log(` - [${r.category}] ${r.title}: $${r.price}`));

  await client.end();
  console.log('Sync finished successfully.');
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
