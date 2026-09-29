const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xoizeqnphqtjjyodcfwk.supabase.co', 'sb_publishable_IijJ_4VjjFEgHOOb2PGDzQ_iwHMV5iO');

async function fixAnnouncements() {
  const { error } = await supabase.from('site_settings').update({
    value: {
      banner_text: "⚡ GENZ SPORTS: WRESTLING TITLE BELTS & HEAVYWEIGHT HOODIES",
      shipping_text: "FREE WORLDWIDE AIR DISPATCH OVER $100",
      warranty_text: "365-DAY STRIKE & SNAP WARRANTY",
      shipping_threshold: 100,
      items: [
        "⚡ GENZ SPORTS: WRESTLING TITLE BELTS & HEAVYWEIGHT HOODIES",
        "FREE WORLDWIDE AIR DISPATCH OVER $100",
        "365-DAY STRIKE & SNAP WARRANTY"
      ]
    },
    updated_at: new Date().toISOString()
  }).eq('key', 'announcements');

  if (error) console.error('Error updating announcements:', error);
  else console.log('Announcements fixed in Supabase successfully!');
}

fixAnnouncements();
