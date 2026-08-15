const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
lines.forEach(l => {
  const m = l.match(/^([^=]+)=(.*)/);
  if (m) process.env[m[1]] = m[2];
});

const fetch = require('node-fetch');

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const policies = [
    `CREATE POLICY "Public read access on ontap bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ontap');`,
    `CREATE POLICY "Authenticated users can upload to ontap bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ontap');`,
    `CREATE POLICY "Authenticated users can update ontap bucket files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'ontap') WITH CHECK (bucket_id = 'ontap');`,
    `CREATE POLICY "Authenticated users can delete from ontap bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ontap');`,
  ];

  for (const sql of policies) {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({ query: sql })
    });
    const text = await res.text();
    if (!res.ok) {
      console.error('Error:', sql.substring(0, 50), '->', text);
    } else {
      console.log('Success:', sql.substring(0, 50));
    }
  }
}

run().catch(console.error);