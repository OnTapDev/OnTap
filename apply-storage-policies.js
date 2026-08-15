const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const policies = [
  `CREATE POLICY "Public read access on ontap bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ontap');`,
  `CREATE POLICY "Authenticated users can upload to ontap bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ontap');`,
  `CREATE POLICY "Authenticated users can update ontap bucket files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'ontap') WITH CHECK (bucket_id = 'ontap');`,
  `CREATE POLICY "Authenticated users can delete from ontap bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ontap');`,
];

async function run() {
  for (const sql of policies) {
    const { data, error } = await supabase.rpc('exec', { sql });
    if (error) {
      console.error('Error executing:', sql.substring(0, 50), '->', error.message);
    } else {
      console.log('Success:', sql.substring(0, 50));
    }
  }
  
  // Also verify with a test upload using anon key
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const testResult = await anonClient.storage.from('ontap').upload('public/test/verify.txt', Buffer.from('test'), { upsert: true });
  if (testResult.error) {
    console.error('Anon test upload failed:', testResult.error.message);
  } else {
    console.log('Anon test upload succeeded!');
  }
}

run();
