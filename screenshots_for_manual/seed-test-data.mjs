/**
 * Seed comprehensive test data for Namo screenshot automation.
 * Run: node screenshots_for_manual/seed-test-data.mjs
 *
 * Creates: users, events, registrations, audit log entries
 * needed to capture all 39 manual screenshots.
 */

const SUPABASE_URL = 'https://tymcwazwivrevbrjnchm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

// Existing IDs
const ADMIN_ID = '30f183a8-a109-4071-a0ff-d9e656ee4c96'; // stefano.pollastri25@gmail.com
const VOLUNTEER_MARIO_ID = '1c62f865-a67e-42dd-a7b1-fe9027df8c91'; // Mario Rossi
const VOLUNTEER_TEST_ID = '520d8bb2-56c4-421e-9cc8-e16995bc8fd6'; // Test Volunteer

async function api(endpoint, options = {}) {
  const resp = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': options.prefer || 'return=representation',
      ...options.headers,
    },
  });
  if (!resp.ok) {
    const body = await resp.text();
    console.error(`  ERROR ${resp.status}: ${body}`);
    return null;
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

async function createAuthUser(email, password, firstName, lastName) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    if (data.msg?.includes('already been registered') || data.message?.includes('already been registered')) {
      console.log(`  User ${email} already exists, looking up...`);
      // Look up existing user
      const listResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      });
      const listData = await listResp.json();
      const existing = listData.users?.find(u => u.email === email);
      return existing?.id;
    }
    console.error(`  Failed to create ${email}:`, data);
    return null;
  }
  // Wait for trigger to create users row
  await new Promise(r => setTimeout(r, 1500));
  return data.id;
}

// ── Helper to format dates ──
function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 3600000).toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Namo Test Data Seeder                      ║');
  console.log('╚══════════════════════════════════════════════╝');

  // ── 1. CREATE ADDITIONAL USERS ──
  console.log('\n── Creating users ──');

  const newUsers = [
    { email: 'anna.bianchi@namo-test.it', pw: 'Test2026!', fn: 'Anna', ln: 'Bianchi', status: 'active', sectors: ['Clown Terapia', 'Laboratori Scuole'] },
    { email: 'luca.verdi@namo-test.it', pw: 'Test2026!', fn: 'Luca', ln: 'Verdi', status: 'active', sectors: ['Laboratori Scuole'] },
    { email: 'giulia.ferrari@namo-test.it', pw: 'Test2026!', fn: 'Giulia', ln: 'Ferrari', status: 'active', sectors: ['Clown Terapia', 'Eventi Speciali'] },
    { email: 'marco.romano@namo-test.it', pw: 'Test2026!', fn: 'Marco', ln: 'Romano', status: 'active', sectors: ['Riunioni', 'Eventi Speciali'] },
    { email: 'sara.colombo@namo-test.it', pw: 'Test2026!', fn: 'Sara', ln: 'Colombo', status: 'active', sectors: ['Clown Terapia'] },
    { email: 'paolo.rizzo@namo-test.it', pw: 'Test2026!', fn: 'Paolo', ln: 'Rizzo', status: 'suspended', sectors: ['Laboratori Scuole'] },
    { email: 'elena.costa@namo-test.it', pw: 'Test2026!', fn: 'Elena', ln: 'Costa', status: 'deactivated', sectors: ['Clown Terapia'] },
    { email: 'pending.maria@namo-test.it', pw: 'Test2026!', fn: 'Maria', ln: 'Russo', status: 'pending', sectors: ['Clown Terapia', 'Laboratori Scuole'] },
    { email: 'pending.giuseppe@namo-test.it', pw: 'Test2026!', fn: 'Giuseppe', ln: 'Esposito', status: 'pending', sectors: ['Eventi Speciali'] },
    { email: 'pending.francesca@namo-test.it', pw: 'Test2026!', fn: 'Francesca', ln: 'Moretti', status: 'pending', sectors: null },
  ];

  const userIds = {};
  for (const u of newUsers) {
    const id = await createAuthUser(u.email, u.pw, u.fn, u.ln);
    if (id) {
      userIds[u.email] = id;
      console.log(`  Created auth user: ${u.fn} ${u.ln} (${id})`);

      // Update users table
      await api(`/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: u.status,
          first_name: u.fn,
          last_name: u.ln,
          sectors_of_interest: u.sectors,
          ...(u.status === 'active' ? { approved_at: new Date().toISOString(), approved_by: ADMIN_ID } : {}),
        }),
      });
      console.log(`  Updated ${u.fn} ${u.ln} → status: ${u.status}`);
    }
  }

  // Also update Mario Rossi with proper name
  await api(`/rest/v1/users?id=eq.${VOLUNTEER_MARIO_ID}`, {
    method: 'PATCH',
    body: JSON.stringify({
      first_name: 'Mario',
      last_name: 'Rossi',
      sectors_of_interest: ['Clown Terapia', 'Laboratori Scuole'],
      status: 'active',
      approved_at: new Date().toISOString(),
      approved_by: ADMIN_ID,
    }),
  });
  console.log('  Updated Mario Rossi');

  // Update admin name
  await api(`/rest/v1/users?id=eq.${ADMIN_ID}`, {
    method: 'PATCH',
    body: JSON.stringify({
      first_name: 'Stefano',
      last_name: 'Pollastri',
    }),
  });
  console.log('  Updated Stefano Pollastri');

  // ── 2. CREATE EVENTS ──
  console.log('\n── Creating events ──');

  const SERIES_ID = uuid();

  const events = [
    // Future events with available spots (for registration screenshots)
    {
      id: uuid(),
      title: 'Visita ospedaliera bambini',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(5),
      end_at: new Date(Date.now() + 5 * 86400000 + 3 * 3600000).toISOString(),
      capacity: 15,
      sectors: ['Clown Terapia'],
      location: 'Ospedale Pediatrico Regina Margherita, Torino',
      notes: 'Portare il naso rosso e i costumi. Ritrovo 30 minuti prima all\'ingresso principale.',
      cancellation_deadline_hours: 24,
      waitlist_limit: 5,
      reminder_hours: 48,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'available-clown',
    },
    {
      id: uuid(),
      title: 'Laboratorio creativo scuola primaria',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(7),
      end_at: new Date(Date.now() + 7 * 86400000 + 3 * 3600000).toISOString(),
      capacity: 12,
      sectors: ['Laboratori Scuole'],
      location: 'Scuola Primaria Don Bosco, Via Roma 15',
      notes: 'Portare materiali per il laboratorio creativo. Si raccomanda puntualità.',
      cancellation_deadline_hours: 24,
      waitlist_limit: 3,
      reminder_hours: 24,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'available-lab',
    },
    // Overlapping event (same time as first one above, for overlap screenshot)
    {
      id: uuid(),
      title: 'Riunione settore Clown Terapia',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(5), // same day as 'Visita ospedaliera'
      end_at: new Date(Date.now() + 5 * 86400000 + 2 * 3600000).toISOString(),
      capacity: 20,
      sectors: ['Riunioni'],
      location: 'Sede Namo APS, Via Garibaldi 42',
      cancellation_deadline_hours: 12,
      waitlist_limit: null,
      reminder_hours: 24,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'overlap-riunione',
    },
    // Full capacity event with waitlist (for waitlist screenshots)
    {
      id: uuid(),
      title: 'Evento speciale beneficenza',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(10),
      end_at: new Date(Date.now() + 10 * 86400000 + 4 * 3600000).toISOString(),
      capacity: 3,
      sectors: ['Eventi Speciali'],
      location: 'Teatro Carignano, Piazza Carignano 6',
      notes: 'Dress code: elegante. Ingresso dal retro.',
      cancellation_deadline_hours: 48,
      waitlist_limit: 5,
      reminder_hours: 72,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'full-with-waitlist',
    },
    // Event starting soon (within 24h, for late cancellation screenshot)
    {
      id: uuid(),
      title: 'Animazione festa di quartiere',
      type: 'aperto',
      status: 'published',
      start_at: hoursFromNow(6),
      end_at: hoursFromNow(10),
      capacity: 10,
      sectors: ['Clown Terapia', 'Eventi Speciali'],
      location: 'Piazza Vittorio Veneto, Torino',
      cancellation_deadline_hours: 24,
      waitlist_limit: null,
      reminder_hours: 12,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'soon-aperto',
    },
    // Past event within 48h grace period
    {
      id: uuid(),
      title: 'Clown in corsia - turno mattutino',
      type: 'interno',
      status: 'published',
      start_at: hoursAgo(26),
      end_at: hoursAgo(23),
      capacity: 8,
      sectors: ['Clown Terapia'],
      location: 'Ospedale Molinette, reparto pediatria',
      cancellation_deadline_hours: 24,
      waitlist_limit: null,
      reminder_hours: 24,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'past-recent',
    },
    // Past event beyond 48h grace period
    {
      id: uuid(),
      title: 'Workshop formazione nuovi volontari',
      type: 'interno',
      status: 'published',
      start_at: hoursAgo(96),
      end_at: hoursAgo(92),
      capacity: 10,
      sectors: ['Laboratori Scuole'],
      location: 'Sede Namo APS, Via Garibaldi 42',
      cancellation_deadline_hours: 24,
      waitlist_limit: null,
      reminder_hours: 48,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'past-old',
    },
    // Draft event (for admin publish/edit screenshots)
    {
      id: uuid(),
      title: 'Giornata ecologica al parco',
      type: 'interno',
      status: 'draft',
      start_at: daysFromNow(14),
      end_at: new Date(Date.now() + 14 * 86400000 + 5 * 3600000).toISOString(),
      capacity: 25,
      sectors: ['Eventi Speciali'],
      location: 'Parco del Valentino, Torino',
      notes: 'Evento in fase di organizzazione. Confermare la disponibilità dei sacchi.',
      cancellation_deadline_hours: 24,
      waitlist_limit: 8,
      reminder_hours: 48,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'draft',
    },
    // Series events (cloned)
    {
      id: uuid(),
      title: 'Clown in corsia - turno settimanale',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(3),
      end_at: new Date(Date.now() + 3 * 86400000 + 3 * 3600000).toISOString(),
      capacity: 6,
      sectors: ['Clown Terapia'],
      location: 'Ospedale Molinette, reparto pediatria',
      cancellation_deadline_hours: 24,
      waitlist_limit: 3,
      reminder_hours: 24,
      attendance_grace_period_hours: 48,
      clone_series_id: SERIES_ID,
      created_by: ADMIN_ID,
      _label: 'series-1',
    },
    {
      id: uuid(),
      title: 'Clown in corsia - turno settimanale',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(10),
      end_at: new Date(Date.now() + 10 * 86400000 + 3 * 3600000).toISOString(),
      capacity: 6,
      sectors: ['Clown Terapia'],
      location: 'Ospedale Molinette, reparto pediatria',
      cancellation_deadline_hours: 24,
      waitlist_limit: 3,
      reminder_hours: 24,
      attendance_grace_period_hours: 48,
      clone_series_id: SERIES_ID,
      created_by: ADMIN_ID,
      _label: 'series-2',
    },
    {
      id: uuid(),
      title: 'Clown in corsia - turno settimanale',
      type: 'interno',
      status: 'published',
      start_at: daysFromNow(17),
      end_at: new Date(Date.now() + 17 * 86400000 + 3 * 3600000).toISOString(),
      capacity: 6,
      sectors: ['Clown Terapia'],
      location: 'Ospedale Molinette, reparto pediatria',
      cancellation_deadline_hours: 24,
      waitlist_limit: 3,
      reminder_hours: 24,
      attendance_grace_period_hours: 48,
      clone_series_id: SERIES_ID,
      created_by: ADMIN_ID,
      _label: 'series-3',
    },
    // Far future event (for normal cancellation)
    {
      id: uuid(),
      title: 'Festa di primavera',
      type: 'aperto',
      status: 'published',
      start_at: daysFromNow(30),
      end_at: new Date(Date.now() + 30 * 86400000 + 6 * 3600000).toISOString(),
      capacity: 50,
      sectors: ['Eventi Speciali', 'Clown Terapia'],
      location: 'Parco Ruffini, Torino',
      notes: 'Grande evento aperto al pubblico. Necessari almeno 15 volontari.',
      cancellation_deadline_hours: 48,
      waitlist_limit: 10,
      reminder_hours: 72,
      attendance_grace_period_hours: 48,
      created_by: ADMIN_ID,
      _label: 'far-future-aperto',
    },
  ];

  const eventMap = {};
  for (const e of events) {
    const label = e._label;
    delete e._label;
    const result = await api('/rest/v1/events', {
      method: 'POST',
      body: JSON.stringify(e),
    });
    if (result) {
      eventMap[label] = result[0] || e;
      console.log(`  Created event: ${e.title} (${label}) → ${e.id}`);
    }
  }

  // ── 3. CREATE REGISTRATIONS ──
  console.log('\n── Creating registrations ──');

  // Helper to get user IDs
  const annaId = userIds['anna.bianchi@namo-test.it'];
  const lucaId = userIds['luca.verdi@namo-test.it'];
  const giuliaId = userIds['giulia.ferrari@namo-test.it'];
  const marcoId = userIds['marco.romano@namo-test.it'];
  const saraId = userIds['sara.colombo@namo-test.it'];

  const availableClownId = eventMap['available-clown']?.id;
  const availableLabId = eventMap['available-lab']?.id;
  const fullEventId = eventMap['full-with-waitlist']?.id;
  const soonEventId = eventMap['soon-aperto']?.id;
  const pastRecentId = eventMap['past-recent']?.id;
  const pastOldId = eventMap['past-old']?.id;
  const overlapId = eventMap['overlap-riunione']?.id;
  const farFutureId = eventMap['far-future-aperto']?.id;
  const series1Id = eventMap['series-1']?.id;

  const registrations = [];

  // Mario Rossi registrations (the test volunteer)
  if (availableClownId) {
    registrations.push({ user_id: VOLUNTEER_MARIO_ID, event_id: availableClownId, status: 'confirmed' });
  }
  if (farFutureId) {
    registrations.push({ user_id: VOLUNTEER_MARIO_ID, event_id: farFutureId, status: 'confirmed' });
  }
  if (soonEventId) {
    registrations.push({ user_id: VOLUNTEER_MARIO_ID, event_id: soonEventId, status: 'confirmed' });
  }
  if (series1Id) {
    registrations.push({ user_id: VOLUNTEER_MARIO_ID, event_id: series1Id, status: 'confirmed' });
  }

  // Fill up the "full" event to capacity (3 spots)
  if (fullEventId && annaId) {
    registrations.push({ user_id: annaId, event_id: fullEventId, status: 'confirmed' });
  }
  if (fullEventId && lucaId) {
    registrations.push({ user_id: lucaId, event_id: fullEventId, status: 'confirmed' });
  }
  if (fullEventId && giuliaId) {
    registrations.push({ user_id: giuliaId, event_id: fullEventId, status: 'confirmed' });
  }
  // Waitlisted users for the full event
  if (fullEventId && marcoId) {
    registrations.push({ user_id: marcoId, event_id: fullEventId, status: 'waitlist' });
  }
  if (fullEventId && saraId) {
    registrations.push({ user_id: saraId, event_id: fullEventId, status: 'waitlist' });
  }

  // Registrations for past recent event (within grace period)
  if (pastRecentId) {
    if (annaId) registrations.push({ user_id: annaId, event_id: pastRecentId, status: 'confirmed', attendance_status: 'present' });
    if (lucaId) registrations.push({ user_id: lucaId, event_id: pastRecentId, status: 'confirmed', attendance_status: 'present' });
    if (giuliaId) registrations.push({ user_id: giuliaId, event_id: pastRecentId, status: 'confirmed', attendance_status: 'present' });
    if (marcoId) registrations.push({ user_id: marcoId, event_id: pastRecentId, status: 'confirmed', attendance_status: 'absent' });
    if (saraId) registrations.push({ user_id: saraId, event_id: pastRecentId, status: 'confirmed', attendance_status: 'no_show' });
    registrations.push({ user_id: VOLUNTEER_MARIO_ID, event_id: pastRecentId, status: 'confirmed', attendance_status: null });
  }

  // Registrations for past old event (beyond grace period)
  if (pastOldId) {
    if (annaId) registrations.push({ user_id: annaId, event_id: pastOldId, status: 'confirmed', attendance_status: 'present' });
    if (lucaId) registrations.push({ user_id: lucaId, event_id: pastOldId, status: 'confirmed', attendance_status: 'present' });
    if (giuliaId) registrations.push({ user_id: giuliaId, event_id: pastOldId, status: 'confirmed', attendance_status: 'absent' });
    if (marcoId) registrations.push({ user_id: marcoId, event_id: pastOldId, status: 'confirmed', attendance_status: 'no_show' });
    registrations.push({ user_id: VOLUNTEER_MARIO_ID, event_id: pastOldId, status: 'confirmed', attendance_status: 'present' });
  }

  // More registrations for the available events (other volunteers)
  if (availableClownId && annaId) {
    registrations.push({ user_id: annaId, event_id: availableClownId, status: 'confirmed' });
  }
  if (availableClownId && giuliaId) {
    registrations.push({ user_id: giuliaId, event_id: availableClownId, status: 'confirmed' });
  }
  if (availableLabId && lucaId) {
    registrations.push({ user_id: lucaId, event_id: availableLabId, status: 'confirmed' });
  }
  if (availableLabId && saraId) {
    registrations.push({ user_id: saraId, event_id: availableLabId, status: 'confirmed' });
  }

  // Some cancelled registrations
  if (availableClownId && marcoId) {
    registrations.push({ user_id: marcoId, event_id: availableClownId, status: 'cancelled', cancellation_type: 'normal' });
  }

  // Soon event registrations (other volunteers)
  if (soonEventId && annaId) {
    registrations.push({ user_id: annaId, event_id: soonEventId, status: 'confirmed' });
  }
  if (soonEventId && giuliaId) {
    registrations.push({ user_id: giuliaId, event_id: soonEventId, status: 'confirmed' });
  }

  for (const reg of registrations) {
    const result = await api('/rest/v1/registrations', {
      method: 'POST',
      body: JSON.stringify({
        id: uuid(),
        ...reg,
        registered_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        ...(reg.status === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
        is_admin_override: false,
      }),
    });
    if (result) {
      console.log(`  Registration: ${reg.user_id?.substring(0, 8)} → ${reg.event_id?.substring(0, 8)} (${reg.status})`);
    }
  }

  // Admin override registration for the soon event
  if (soonEventId && VOLUNTEER_TEST_ID) {
    await api('/rest/v1/registrations', {
      method: 'POST',
      body: JSON.stringify({
        id: uuid(),
        user_id: VOLUNTEER_TEST_ID,
        event_id: soonEventId,
        status: 'confirmed',
        registered_at: new Date().toISOString(),
        is_admin_override: true,
      }),
    });
    console.log('  Admin override registration created');
  }

  // ── 4. EXTERNAL REGISTRATIONS for Aperto events ──
  console.log('\n── Creating external registrations ──');
  if (soonEventId) {
    await api('/rest/v1/external_registrations', {
      method: 'POST',
      body: JSON.stringify({
        id: uuid(),
        event_id: soonEventId,
        first_name: 'Lucia',
        last_name: 'Fontana',
        email: 'lucia.fontana@esempio.it',
        status: 'confirmed',
        cancel_token: uuid(),
        registered_at: new Date().toISOString(),
      }),
    });
    console.log('  External registration: Lucia Fontana');

    await api('/rest/v1/external_registrations', {
      method: 'POST',
      body: JSON.stringify({
        id: uuid(),
        event_id: soonEventId,
        first_name: 'Roberto',
        last_name: 'Galli',
        email: 'roberto.galli@esempio.it',
        status: 'confirmed',
        cancel_token: uuid(),
        registered_at: new Date().toISOString(),
      }),
    });
    console.log('  External registration: Roberto Galli');
  }

  if (farFutureId) {
    await api('/rest/v1/external_registrations', {
      method: 'POST',
      body: JSON.stringify({
        id: uuid(),
        event_id: farFutureId,
        first_name: 'Chiara',
        last_name: 'Marchetti',
        email: 'chiara.marchetti@esempio.it',
        status: 'confirmed',
        cancel_token: uuid(),
        registered_at: new Date().toISOString(),
      }),
    });
    console.log('  External registration: Chiara Marchetti');
  }

  // ── 5. AUDIT LOG ENTRIES ──
  console.log('\n── Creating audit log entries ──');

  const auditEntries = [
    { action_type: 'USER_APPROVED', entity_type: 'user', entity_id: annaId, before_state: { status: 'pending' }, after_state: { status: 'active' } },
    { action_type: 'USER_APPROVED', entity_type: 'user', entity_id: lucaId, before_state: { status: 'pending' }, after_state: { status: 'active' } },
    { action_type: 'USER_APPROVED', entity_type: 'user', entity_id: giuliaId, before_state: { status: 'pending' }, after_state: { status: 'active' } },
    { action_type: 'USER_SUSPENDED', entity_type: 'user', entity_id: userIds['paolo.rizzo@namo-test.it'], before_state: { status: 'active', role: 'volontario' }, after_state: { status: 'suspended' } },
    { action_type: 'EVENT_CREATED', entity_type: 'event', entity_id: availableClownId, before_state: null, after_state: { title: 'Visita ospedaliera bambini', status: 'draft' } },
    { action_type: 'EVENT_UPDATED', entity_type: 'event', entity_id: availableClownId, before_state: { status: 'draft' }, after_state: { status: 'published' } },
    { action_type: 'EVENT_CREATED', entity_type: 'event', entity_id: availableLabId, before_state: null, after_state: { title: 'Laboratorio creativo scuola primaria', status: 'draft' } },
    { action_type: 'EVENT_CREATED', entity_type: 'event', entity_id: fullEventId, before_state: null, after_state: { title: 'Evento speciale beneficenza', status: 'draft' } },
    { action_type: 'REGISTRATION_CANCELLED_BY_ADMIN', entity_type: 'registration', entity_id: uuid(), before_state: { status: 'confirmed' }, after_state: { status: 'cancelled' } },
    { action_type: 'ATTENDANCE_CORRECTED', entity_type: 'registration', entity_id: uuid(), before_state: { attendance_status: 'present' }, after_state: { attendance_status: 'absent' } },
    { action_type: 'CAPACITY_OVERRIDE', entity_type: 'registration', entity_id: uuid(), before_state: { capacity: 3 }, after_state: { registration_added: true } },
    { action_type: 'USER_DEACTIVATED', entity_type: 'user', entity_id: userIds['elena.costa@namo-test.it'], before_state: { status: 'active' }, after_state: { status: 'deactivated' } },
    { action_type: 'EVENT_CANCELLED', entity_type: 'event', entity_id: uuid(), before_state: { status: 'published' }, after_state: { status: 'cancelled' } },
    { action_type: 'ROLE_CHANGED', entity_type: 'user', entity_id: ADMIN_ID, before_state: { role: 'volontario' }, after_state: { role: 'super_admin' } },
  ];

  for (let i = 0; i < auditEntries.length; i++) {
    const entry = auditEntries[i];
    await api('/rest/v1/audit_log', {
      method: 'POST',
      body: JSON.stringify({
        id: uuid(),
        actor_id: ADMIN_ID,
        action_type: entry.action_type,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || uuid(),
        before_state: entry.before_state ? JSON.stringify(entry.before_state) : null,
        after_state: entry.after_state ? JSON.stringify(entry.after_state) : null,
        created_at: new Date(Date.now() - (auditEntries.length - i) * 3600000).toISOString(),
      }),
    });
    console.log(`  Audit: ${entry.action_type}`);
  }

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  Seeding complete!                           ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  Users created: ${Object.keys(userIds).length}`);
  console.log(`  Events created: ${Object.keys(eventMap).length}`);
  console.log(`  Registrations created: ${registrations.length}`);
  console.log(`  Audit entries: ${auditEntries.length}`);
}

main().catch(console.error);
