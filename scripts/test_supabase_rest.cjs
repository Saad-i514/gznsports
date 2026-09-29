const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xoizeqnphqtjjyodcfwk.supabase.co';
const supabaseKey = 'sb_publishable_IijJ_4VjjFEgHOOb2PGDzQ_iwHMV5iO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase REST API connection...');
  const { data: products, error: prodErr } = await supabase.from('products').select('*');
  if (prodErr) {
    console.error('Products fetch error:', prodErr);
  } else {
    console.log(`Successfully fetched ${products.length} products from Supabase:`);
    products.forEach(p => console.log(` - [${p.category}] ${p.title} ($${p.price})`));
  }

  const { data: settings, error: setErr } = await supabase.from('site_settings').select('*');
  if (setErr) {
    console.error('Settings fetch error:', setErr);
  } else {
    console.log(`Successfully fetched ${settings.length} site settings rows.`);
    settings.forEach(s => console.log(` - ${s.key}`));
  }
}

testSupabase().catch(console.error);
