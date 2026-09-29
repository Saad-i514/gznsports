const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xoizeqnphqtjjyodcfwk.supabase.co', 'sb_publishable_IijJ_4VjjFEgHOOb2PGDzQ_iwHMV5iO');

async function inspectSettings() {
  const { data } = await supabase.from('site_settings').select('*');
  console.log(JSON.stringify(data, null, 2));
}

inspectSettings();
