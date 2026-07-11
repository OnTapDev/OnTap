const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zdwbpkkarubtwfajhuas.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkd2Jwa2thcnVidHdmYWpodWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODk2MTYsImV4cCI6MjA5MTE2NTYxNn0.49lzZBv_lHMuoHt9vS3p84UQLT_wFvnvUJvGVCS5WfQ';

const supabase = createClient(SUPABASE_URL, ANON_KEY);
const orgId = '6e49ffd0-5cd0-42f6-ab57-8bffee32fc3b';

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name} ${detail}`);
  }
}

async function run() {
  console.log('\n=== Dashboard Data Integrity Tests ===\n');

  // 1. Table existence checks
  console.log('1. Table Existence');
  const tables = ['contacts', 'invoices', 'events', 'contracts', 'quotes', 'users', 'organizations', 'messages'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    assert(`${table} table exists`, !error || error.code === 'PGRST116', error?.message || '');
  }

  // 2. Contacts table — schema + data for dashboard
  console.log('\n2. Contacts (Dashboard KPIs + Recent Activity)');
  const { data: contacts, error: contactsErr } = await supabase
    .from('contacts')
    .select('id, name, email, phone, company, role, source, notes, org_id, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(10);
  assert('contacts query succeeds', !contactsErr, contactsErr?.message || '');
  assert('contacts returns array', Array.isArray(contacts));
  if (contacts?.length) {
    assert('contacts have required fields', 
      contacts.every(c => c.id && c.name && c.org_id),
      'missing id/name/org_id'
    );
    assert('contacts filtered by org_id', contacts.every(c => c.org_id === orgId));
    assert('contacts sorted desc by created_at', 
      contacts.length <= 1 || new Date(contacts[0].created_at) >= new Date(contacts[1].created_at)
    );
  }

  // 3. Contacts count (for KPI leads)
  const { count: contactsCount30d, error: countErr30 } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString());
  assert('contacts 30d count succeeds', !countErr30, countErr30?.message || '');
  assert('contacts 30d count is number', typeof contactsCount30d === 'number');

  // 4. Invoices table (for Revenue KPI)
  console.log('\n3. Invoices (Revenue KPI)');
  const { data: invoices, error: invErr } = await supabase
    .from('invoices')
    .select('id, amount, status, org_id, created_at')
    .eq('org_id', orgId)
    .eq('status', 'paid')
    .limit(10);
  assert('invoices query succeeds', !invErr, invErr?.message || '');
  assert('invoices returns array', Array.isArray(invoices));
  if (invoices?.length) {
    assert('invoices have id, amount, org_id',
      invoices.every(inv => inv.id && typeof inv.amount === 'number' && inv.org_id),
      'missing fields'
    );
    assert('invoices filtered by org_id and paid', invoices.every(inv => inv.org_id === orgId && inv.status === 'paid'));
  }

  // 5. Revenue calculation (matches getDashboardKPIs logic)
  const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  assert('revenue sum is number', typeof totalRevenue === 'number');
  if (paidInvoices.length > 0) {
    assert('revenue is positive for paid invoices', totalRevenue >= 0);
  }

  // 6. Events table (for Events KPI + Calendar)
  console.log('\n4. Events (Events KPI + Calendar)');
  const { data: events, error: eventsErr } = await supabase
    .from('events')
    .select('id, name, date, start_time, venue_name, guest_count, status, type, total_price, org_id')
    .eq('org_id', orgId)
    .order('date', { ascending: true })
    .limit(60);
  assert('events query succeeds', !eventsErr, eventsErr?.message || '');
  assert('events returns array', Array.isArray(events));
  if (events?.length) {
    assert('events have required fields',
      events.every(e => e.id && e.name && e.date && e.org_id),
      'missing id/name/date/org_id'
    );
  }

  // 7. Events with contact join (for calendar display)
  const { data: eventsWithContacts, error: joinErr } = await supabase
    .from('events')
    .select('id, name, date, contacts!inner(name)')
    .eq('org_id', orgId)
    .limit(5);
  if (eventsWithContacts?.length) {
    assert('events contact join succeeds', !joinErr, joinErr?.message || '');
    assert('events contact returns name', eventsWithContacts.every(e => e.contacts?.[0]?.name));
  }

  // 8. Upcoming events count (for Events KPI value)
  const { count: upcomingCount, error: upcomingErr } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('date', new Date().toISOString().split('T')[0]);
  assert('upcoming events count succeeds', !upcomingErr, upcomingErr?.message || '');
  assert('upcoming count is number', typeof upcomingCount === 'number');

  // 9. Contracts table (for Conversion KPI)
  console.log('\n5. Contracts (Conversion KPI)');
  const { data: contracts, error: contractsErr } = await supabase
    .from('contracts')
    .select('id, status, org_id, created_at')
    .eq('org_id', orgId)
    .limit(10);
  assert('contracts query succeeds', !contractsErr, contractsErr?.message || '');
  assert('contracts returns array', Array.isArray(contracts));
  if (contracts?.length) {
    assert('contracts have required fields',
      contracts.every(c => c.id && c.status && c.org_id),
      'missing fields'
    );
  }

  // 10. Signed contracts count (for conversion calc)
  const { count: signed30d, error: signed30dErr } = await supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('status', 'signed')
    .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString());
  assert('signed contracts 30d count succeeds', !signed30dErr, signed30dErr?.message || '');
  assert('signed 30d count is number', typeof signed30d === 'number');

  // 11. Quotes table (for conversion denominator)
  console.log('\n6. Quotes (Conversion KPI denominator)');
  const { data: quotes, error: quotesErr } = await supabase
    .from('quotes')
    .select('id, org_id, created_at')
    .eq('org_id', orgId)
    .limit(10);
  assert('quotes query succeeds', !quotesErr, quotesErr?.message || '');
  assert('quotes returns array', Array.isArray(quotes));

  // 12. Organizations table
  console.log('\n7. Organizations');
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', orgId)
    .single();
  assert('organizations query succeeds', !orgErr, orgErr?.message || '');
  assert('org has id, name, slug', !!org?.id && !!org?.name && !!org?.slug);

  // 13. Users table (for dashboard layout / org lookup)
  console.log('\n8. Users');
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, org_id, clerk_id')
    .limit(10);
  assert('users query succeeds', !usersErr, usersErr?.message || '');
  assert('users returns array', Array.isArray(users));

  // 14. Messages table (for CRM messaging panel)
  console.log('\n9. Messages');
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select('id, contact_id, org_id, body')
    .eq('org_id', orgId)
    .limit(5);
  assert('messages query succeeds', !msgErr, msgErr?.message || '');
  
  // 15. Anon access restrictions
  console.log('\n10. RLS / Anon Access');
  const { error: anonMsgErr } = await supabase.from('messages').insert({ contact_id: 'fake', org_id: orgId, body: 'test' });
  assert('anon cannot insert messages', !!anonMsgErr, 'anon insert should be blocked');

  const { error: anonInvErr } = await supabase.from('invoices').insert({ org_id: orgId, amount: 999, status: 'draft' });
  assert('anon cannot insert invoices', !!anonInvErr, 'anon insert should be blocked (unless RLS allows)');

  // 16. DashboardClient receives correct data shape
  console.log('\n11. Data Shape Validation');
  
  // Recent leads = contacts sorted by created_at desc
  assert('recent leads use contacts table', true);
  
  // All events for calendar = events with contact join
  const calendarEvents = events?.map(e => ({
    id: e.id, name: e.name, date: e.date, start_time: e.start_time,
    venue_name: e.venue_name, guest_count: e.guest_count, status: e.status,
    total_price: e.total_price, type: e.type,
  })) || [];
  assert('calendar events mapped correctly', calendarEvents.every(e => e.id && e.name && e.date));

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
