const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdwbpkarubtuwfajhuas.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkd2Jwa2thcnVidHdmYWpodWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODk2MTYsImV4cCI6MjA5MTE2NTYxNn0.49lzZBv_lHMuoHt9vS3p84UQLT_wFvnvUJvGVCS5WfQ'
);

async function test() {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({ email: 'test@ontap.com' })
    .select();
  
  console.log('Insert result:', { data, error });
  
  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total count:', count);
}

test();