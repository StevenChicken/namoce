/**
 * Namo — Automated Screenshot Capture for User Manual
 *
 * Captures 39 screenshots (desktop + mobile = 78 total) from the running dev server.
 * Run: node screenshots_for_manual/take-screenshots.mjs
 *
 * Prerequisites:
 * - Dev server running on localhost:3000 (pnpm dev)
 * - Supabase database with test data
 * - Playwright chromium installed (npx playwright install chromium)
 */

import { chromium } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = __dirname;
const MISSING_DATA_FILE = path.join(OUTPUT_DIR, 'MISSING_DATA.md');
const ACCOUNTS_FILE = path.join(OUTPUT_DIR, 'TEST_ACCOUNTS.txt');

// ── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = 'https://tymcwazwivrevbrjnchm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const ADMIN_EMAIL = 'stefano.pollastri25@gmail.com';
const ADMIN_PASSWORD = '15October!';
const VOLUNTEER_EMAIL = 'volontario.test@namo-screenshots.test';
const VOLUNTEER_PASSWORD = 'ScreenshotTest2026!';
const VOLUNTEER_FIRST_NAME = 'Mario';
const VOLUNTEER_LAST_NAME = 'Rossi';

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 812 };

// ── State ───────────────────────────────────────────────────────────────────
const missingData = [];
const capturedScreenshots = [];

// ── Helpers ─────────────────────────────────────────────────────────────────

function logMissing(label, reason, suggestion) {
  const entry = { label, reason, suggestion };
  missingData.push(entry);
  console.warn(`  ⚠ MISSING: [${label}] ${reason}`);
}

function logCapture(label) {
  capturedScreenshots.push(label);
  console.log(`  ✓ Captured: ${label}`);
}

async function takeScreenshots(page, label, options = {}) {
  const { fullPage = false } = options;
  try {
    // Desktop
    await page.setViewportSize(DESKTOP);
    await page.waitForTimeout(500);
    const desktopPath = path.join(OUTPUT_DIR, `${label}.png`);
    await page.screenshot({ path: desktopPath, fullPage, type: 'png' });

    // Mobile
    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(500);
    const mobilePath = path.join(OUTPUT_DIR, `${label}-mobile.png`);
    await page.screenshot({ path: mobilePath, fullPage, type: 'png' });

    // Reset to desktop for further interactions
    await page.setViewportSize(DESKTOP);
    await page.waitForTimeout(300);

    logCapture(label);
    return true;
  } catch (err) {
    logMissing(label, `Screenshot failed: ${err.message}`, 'Check page state and retry');
    return false;
  }
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/accedi`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('input#email', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button:has-text("Accedi")');
  await page.waitForTimeout(5000);
  // Check if we landed on a valid page
  const url = page.url();
  if (url.includes('/accedi')) {
    const bodyText = await page.textContent('body');
    throw new Error(`Login failed for ${email} — still on /accedi. Body: ${bodyText.substring(0, 200)}`);
  }
  console.log(`  Logged in as ${email} → ${url}`);
}

async function logout(page) {
  // Use Supabase signOut by navigating with a cookie clear
  await page.evaluate(() => {
    document.cookie.split(';').forEach(c => {
      const name = c.trim().split('=')[0];
      if (name.includes('supabase') || name.includes('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  });
  await page.goto(`${BASE_URL}/accedi`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('  Logged out');
}

async function supabaseAdminFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}${endpoint}`;
  const resp = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...options.headers,
    },
  });
  return resp;
}

async function ensureVolunteerAccount() {
  console.log('\n── Creating/verifying test volunteer account ──');

  // Check if user exists
  const listResp = await supabaseAdminFetch('/auth/v1/admin/users?page=1&per_page=100');
  const listData = await listResp.json();
  const existingUser = listData.users?.find(u => u.email === VOLUNTEER_EMAIL);

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`  Found existing volunteer: ${userId}`);
  } else {
    // Create user via Supabase Admin API
    const createResp = await supabaseAdminFetch('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: VOLUNTEER_EMAIL,
        password: VOLUNTEER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: VOLUNTEER_FIRST_NAME,
          last_name: VOLUNTEER_LAST_NAME,
        },
      }),
    });
    const createData = await createResp.json();
    if (!createResp.ok) {
      console.error('  Failed to create volunteer:', createData);
      throw new Error('Cannot create volunteer account');
    }
    userId = createData.id;
    console.log(`  Created volunteer: ${userId}`);

    // Wait for trigger to populate users table
    await new Promise(r => setTimeout(r, 2000));
  }

  // Update user status to active and add sectors using REST API
  const updateResp = await supabaseAdminFetch('/rest/v1/users?id=eq.' + userId, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'active',
      role: 'volontario',
      first_name: VOLUNTEER_FIRST_NAME,
      last_name: VOLUNTEER_LAST_NAME,
      sectors: ['Clown Terapia', 'Laboratori Scuole'],
    }),
    headers: { 'Prefer': 'return=minimal' },
  });

  if (!updateResp.ok) {
    const errText = await updateResp.text();
    console.warn(`  Warning: could not update volunteer status: ${errText}`);
  } else {
    console.log('  Volunteer status set to active with sectors');
  }

  // Save account info
  writeFileSync(ACCOUNTS_FILE, `Test Accounts Created for Screenshots
===================================

Volunteer Account:
  Email: ${VOLUNTEER_EMAIL}
  Password: ${VOLUNTEER_PASSWORD}
  Name: ${VOLUNTEER_FIRST_NAME} ${VOLUNTEER_LAST_NAME}
  Role: volontario
  Status: active
  Sectors: Clown Terapia, Laboratori Scuole

Admin Account (existing):
  Email: ${ADMIN_EMAIL}
  (password not stored)

Created: ${new Date().toISOString()}
`);

  return userId;
}

// Close any open dialog by pressing Escape
async function closeDialog(page) {
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } catch { /* ignore */ }
}

// ── Screenshot Capture Functions ────────────────────────────────────────────

async function captureVolunteerScreenshots(page) {
  console.log('\n══ VOLONTARIO SESSION ══════════════════════════════════════');

  try {
    await login(page, VOLUNTEER_EMAIL, VOLUNTEER_PASSWORD);
  } catch (err) {
    console.error(`Login failed for volunteer: ${err.message}`);
    logMissing('volunteer-session', 'Cannot log in as volunteer', 'Check volunteer credentials');
    return;
  }

  // ── 1. calendario-page ──
  console.log('\n── Calendar Screenshots ──');
  try {
    await page.goto(`${BASE_URL}/calendario`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if there are events
    const hasEvents = await page.locator('.space-y-6 >> text=/\\d{4}/').count() > 0 ||
      await page.locator('[class*="event"]').count() > 0 ||
      await page.getByText('Calendario eventi').count() > 0;

    await takeScreenshots(page, 'calendario-page', { fullPage: true });
  } catch (err) {
    logMissing('calendario-page', err.message, 'Ensure published events exist');
  }

  // ── 2. calendario-filtro ──
  try {
    await page.goto(`${BASE_URL}/calendario`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Try to click a sector filter pill
    const clownFilter = page.getByRole('button', { name: /Clown Terapia/i });
    if (await clownFilter.count() > 0) {
      await clownFilter.click();
      await page.waitForTimeout(1000);
      await takeScreenshots(page, 'calendario-filtro', { fullPage: true });
    } else {
      // Try any sector filter
      const anyFilter = page.locator('button').filter({ hasText: /Clown|Laboratori|Eventi|Sostegno/i }).first();
      if (await anyFilter.count() > 0) {
        await anyFilter.click();
        await page.waitForTimeout(1000);
        await takeScreenshots(page, 'calendario-filtro', { fullPage: true });
      } else {
        logMissing('calendario-filtro', 'No sector filter buttons found', 'Ensure events with sectors exist');
      }
    }
  } catch (err) {
    logMissing('calendario-filtro', err.message, 'Check calendar page');
  }

  // ── 3-4. Event detail pages ──
  console.log('\n── Event Detail Screenshots ──');

  // Find events from the calendar page
  try {
    await page.goto(`${BASE_URL}/calendario`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Collect all event hrefs FIRST (before navigating away, which detaches locators)
    const eventLinkElements = await page.locator('a[href*="/calendario/"]').all();
    const eventHrefs = [];
    for (const link of eventLinkElements) {
      const href = await link.getAttribute('href');
      if (href && href.match(/\/calendario\/[a-f0-9-]+/)) {
        eventHrefs.push(href);
      }
    }
    // Deduplicate
    const uniqueHrefs = [...new Set(eventHrefs)];
    console.log(`  Found ${uniqueHrefs.length} unique event links`);

    let availableEventUrl = null;
    let fullEventUrl = null;

    for (const href of uniqueHrefs) {
      // Visit each event to check capacity
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const pageText = await page.textContent('body');

      if (pageText.includes('Evento al completo') || pageText.includes('lista d\'attesa')) {
        if (!fullEventUrl) {
          fullEventUrl = href;
          console.log(`  Found full event: ${href}`);
        }
      } else if (pageText.includes('Iscriviti') && !pageText.includes('Iscritto')) {
        if (!availableEventUrl) {
          availableEventUrl = href;
          console.log(`  Found available event: ${href}`);
        }
      }

      if (availableEventUrl && fullEventUrl) break;
    }

    // 3. dettaglio-evento-disponibile
    if (availableEventUrl) {
      await page.goto(`${BASE_URL}${availableEventUrl}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await takeScreenshots(page, 'dettaglio-evento-disponibile', { fullPage: true });
    } else {
      logMissing('dettaglio-evento-disponibile', 'No event with available spots found', 'Create a published event with available capacity');
    }

    // 4. dettaglio-evento-completo
    if (fullEventUrl) {
      await page.goto(`${BASE_URL}${fullEventUrl}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await takeScreenshots(page, 'dettaglio-evento-completo', { fullPage: true });
    } else {
      logMissing('dettaglio-evento-completo', 'No full event with waitlist found', 'Create a published event at full capacity with waitlist enabled');
    }

    // ── 5-9. Registration dialogs ──
    console.log('\n── Registration Dialog Screenshots ──');

    // 5. dialog-conferma-iscrizione
    if (availableEventUrl) {
      await page.goto(`${BASE_URL}${availableEventUrl}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Look for "Iscriviti" button (exact or with text)
      const iscrivitiBtn = page.locator('button').filter({ hasText: /^Iscriviti$/ }).first();
      const iscrivitiCount = await iscrivitiBtn.count();
      console.log(`  "Iscriviti" button count: ${iscrivitiCount}`);

      if (iscrivitiCount > 0) {
        await iscrivitiBtn.click();
        await page.waitForTimeout(2000);

        // Check if dialog appeared
        const dialog = page.getByRole('dialog');
        if (await dialog.count() > 0) {
          await takeScreenshots(page, 'dialog-conferma-iscrizione');

          // 8. dialog-iscrizione-successo — actually complete the registration
          const confermaBtn = dialog.getByRole('button', { name: /Conferma iscrizione/i });
          if (await confermaBtn.count() > 0) {
            await confermaBtn.click();
            await page.waitForTimeout(4000);

            // Check for success or overlap step
            const dialogText = await dialog.textContent();
            if (dialogText.includes('Iscrizione confermata') || dialogText.includes('confermata')) {
              await takeScreenshots(page, 'dialog-iscrizione-successo');
            } else if (dialogText.includes('Sovrapposizione') || dialogText.includes('sovrapposizione')) {
              // We hit an overlap — capture it as screenshot 6
              await takeScreenshots(page, 'dialog-overlap');
              // Try to proceed to complete registration
              const iscrivitiAnywayBtn = dialog.getByRole('button', { name: /Iscriviti comunque/i });
              if (await iscrivitiAnywayBtn.count() > 0) {
                await iscrivitiAnywayBtn.click();
                await page.waitForTimeout(4000);
                const newDialogText = await dialog.textContent();
                if (newDialogText.includes('confermata')) {
                  await takeScreenshots(page, 'dialog-iscrizione-successo');
                }
              }
            }
          }

          await closeDialog(page);
        } else {
          logMissing('dialog-conferma-iscrizione', 'Dialog did not appear', 'Check registration dialog component');
        }
      } else {
        logMissing('dialog-conferma-iscrizione', 'No "Iscriviti" button found', 'User may already be registered');
      }
    } else {
      logMissing('dialog-conferma-iscrizione', 'No available event found', 'Create a published event with available capacity');
    }

    // 6. dialog-overlap (if not already captured above)
    if (!capturedScreenshots.includes('dialog-overlap')) {
      logMissing('dialog-overlap', 'Need two overlapping events where volunteer is registered for one', 'Create overlapping events and register for one');
    }

    // 7. dialog-waitlist-offer
    if (fullEventUrl) {
      await page.goto(`${BASE_URL}${fullEventUrl}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // The button could say "Iscriviti" even on full events (the dialog handles showing waitlist)
      const waitlistPageBtn = page.locator('button').filter({ hasText: /Iscriviti/ }).first();
      if (await waitlistPageBtn.count() > 0) {
        await waitlistPageBtn.click();
        await page.waitForTimeout(2000);

        const dialog = page.getByRole('dialog');
        if (await dialog.count() > 0) {
          const dialogText = await dialog.textContent();
          // Check if dialog is showing confirm step (need to click to get to waitlist step)
          const confermaBtn = dialog.getByRole('button', { name: /Conferma iscrizione/i });
          if (await confermaBtn.count() > 0) {
            await confermaBtn.click();
            await page.waitForTimeout(3000);
          }

          const updatedDialogText = await dialog.textContent();
          if (updatedDialogText.includes('lista d\'attesa') || updatedDialogText.includes('Evento al completo') ||
            updatedDialogText.includes('Posizione') || updatedDialogText.includes('Unisciti')) {
            await takeScreenshots(page, 'dialog-waitlist-offer');

            // Also try clicking "Unisciti alla lista d'attesa" to get the success state
            const joinWaitlistBtn = dialog.getByRole('button', { name: /Unisciti alla lista/i });
            if (await joinWaitlistBtn.count() > 0) {
              // Don't actually join — just capture the offer step
            }
          } else {
            logMissing('dialog-waitlist-offer', 'Dialog did not show waitlist offer step', 'Event may not be full');
          }
          await closeDialog(page);
        }
      } else {
        logMissing('dialog-waitlist-offer', 'No "Iscriviti" button found on full event', 'Event may not be full or waitlist not enabled');
      }
    }

    // 9. dialog-iscrizione-errore — need a tag-restricted event
    if (!capturedScreenshots.includes('dialog-iscrizione-errore')) {
      logMissing('dialog-iscrizione-errore', 'Need a tag-restricted event that the volunteer lacks qualifications for', 'Create an event with required tags that the test volunteer does not have');
    }

    // ── 10-11. Cancel dialogs ──
    console.log('\n── Cancel Dialog Screenshots ──');

    // Find events where user IS registered — collect hrefs first
    await page.goto(`${BASE_URL}/calendario`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    let registeredEventFar = null;
    let registeredEventSoon = null;

    // Collect all event card hrefs and texts before navigating
    const allCardElements = await page.locator('a[href*="/calendario/"]').all();
    const cardData = [];
    for (const link of allCardElements) {
      const linkText = await link.textContent();
      const href = await link.getAttribute('href');
      if (linkText && href) {
        cardData.push({ text: linkText, href });
      }
    }

    // Look for events where the user is registered (has "Iscritto" badge)
    const registeredCards = cardData.filter(c => c.text.includes('Iscritto'));
    console.log(`  Found ${registeredCards.length} registered event cards`);

    for (const card of registeredCards) {
      await page.goto(`${BASE_URL}${card.href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const bodyText = await page.textContent('body');
      const hasAnnullaBtn = await page.getByRole('button', { name: /Annulla iscrizione/i }).count() > 0;

      if (hasAnnullaBtn) {
        if (!registeredEventFar) {
          registeredEventFar = card.href;
        }
        if (!registeredEventSoon) {
          registeredEventSoon = card.href;
        }
      }

      if (registeredEventFar) break;
    }

    // 10. dialog-cancel-normal
    if (registeredEventFar) {
      await page.goto(`${BASE_URL}${registeredEventFar}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const cancelBtn = page.getByRole('button', { name: /Annulla iscrizione/i });
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(1500);

        const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
        if (await dialog.count() > 0) {
          await takeScreenshots(page, 'dialog-cancel-normal');
          await closeDialog(page);
        }
      }
    } else {
      logMissing('dialog-cancel-normal', 'No registered event found for normal cancellation', 'Register volunteer for a future event (>48h away)');
    }

    // 11. dialog-cancel-late
    if (registeredEventSoon && registeredEventSoon !== registeredEventFar) {
      await page.goto(`${BASE_URL}${registeredEventSoon}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const cancelBtn = page.getByRole('button', { name: /Annulla iscrizione/i });
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(1500);

        const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
        if (await dialog.count() > 0) {
          const dialogText = await dialog.textContent();
          if (dialogText.includes('tardiva') || dialogText.includes('24 ore')) {
            await takeScreenshots(page, 'dialog-cancel-late');
          } else {
            logMissing('dialog-cancel-late', 'Cancel dialog did not show late warning', 'Need an event starting within cancellation deadline hours');
          }
          await closeDialog(page);
        }
      }
    } else {
      logMissing('dialog-cancel-late', 'No event starting soon enough for late cancellation', 'Register volunteer for an event starting within 24h');
    }

  } catch (err) {
    console.error(`Error in event detail section: ${err.message}`);
  }

  // ── 12-13. Dashboard ──
  console.log('\n── Dashboard Screenshots ──');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 12. dashboard-prossimi
    await takeScreenshots(page, 'dashboard-prossimi', { fullPage: true });

    // 13. dashboard-riepilogo-presenze — scroll to the section
    const presenzeSection = page.getByText('Riepilogo presenze');
    if (await presenzeSection.count() > 0) {
      await presenzeSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await takeScreenshots(page, 'dashboard-riepilogo-presenze', { fullPage: true });
    } else {
      logMissing('dashboard-riepilogo-presenze', 'Attendance summary section not found', 'Volunteer needs past attendance records');
    }
  } catch (err) {
    logMissing('dashboard-prossimi', err.message, 'Check dashboard page');
  }

  // ── 14-15. Profile ──
  console.log('\n── Profile Screenshots ──');
  try {
    await page.goto(`${BASE_URL}/profilo`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 14. profilo-page
    await takeScreenshots(page, 'profilo-page', { fullPage: true });

    // 15. dialog-eliminazione-account
    const deleteBtn = page.locator('button:has-text("Richiedi eliminazione account")');
    if (await deleteBtn.count() > 0) {
      await deleteBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await deleteBtn.click();
      await page.waitForTimeout(1500);

      const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
      if (await dialog.count() > 0) {
        await takeScreenshots(page, 'dialog-eliminazione-account');
        await closeDialog(page);
      }
    } else {
      logMissing('dialog-eliminazione-account', 'Delete account button not found', 'Check profile page layout');
    }
  } catch (err) {
    logMissing('profilo-page', err.message, 'Check profile page');
  }
}

async function captureAdminScreenshots(page) {
  console.log('\n══ SUPER ADMIN SESSION ═════════════════════════════════════');

  try {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  } catch (err) {
    console.error(`Login failed for admin: ${err.message}`);
    logMissing('admin-session', 'Cannot log in as admin', 'Check admin credentials');
    return;
  }

  // ── 16-23. Admin Events ──
  console.log('\n── Admin Events Screenshots ──');

  // 16. admin-eventi-page
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshots(page, 'admin-eventi-page', { fullPage: true });
  } catch (err) {
    logMissing('admin-eventi-page', err.message, 'Check admin events page');
  }

  // 17. admin-eventi-dropdown
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find a row with "Bozza" badge and click its action button
    const rows = await page.locator('table tbody tr').all();
    let foundDraft = false;

    for (const row of rows) {
      const rowText = await row.textContent();
      if (rowText && rowText.includes('Bozza')) {
        const actionBtn = row.locator('button').last();
        if (await actionBtn.count() > 0) {
          await actionBtn.click();
          await page.waitForTimeout(1000);

          // Check for dropdown menu
          const menu = page.locator('[role="menu"]');
          if (await menu.count() > 0) {
            await takeScreenshots(page, 'admin-eventi-dropdown');
            foundDraft = true;
            await closeDialog(page);
          }
        }
        break;
      }
    }

    if (!foundDraft) {
      // Try with any event if no draft found
      const firstActionBtn = page.locator('table tbody tr').first().locator('button').last();
      if (await firstActionBtn.count() > 0) {
        await firstActionBtn.click();
        await page.waitForTimeout(1000);
        const menu = page.locator('[role="menu"]');
        if (await menu.count() > 0) {
          await takeScreenshots(page, 'admin-eventi-dropdown');
          await closeDialog(page);
        } else {
          logMissing('admin-eventi-dropdown', 'No action dropdown appeared', 'Check event table action buttons');
        }
      } else {
        logMissing('admin-eventi-dropdown', 'No draft event found and no events in table', 'Create a draft event');
      }
    }
  } catch (err) {
    logMissing('admin-eventi-dropdown', err.message, 'Check admin events page');
  }

  // 18. admin-crea-evento
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const newEventBtn = page.getByRole('button', { name: /Nuovo evento/i });
    if (await newEventBtn.count() > 0) {
      await newEventBtn.click();
      await page.waitForTimeout(2000);

      const dialog = page.getByRole('dialog');
      if (await dialog.count() > 0) {
        // Fill in form fields
        try {
          await page.fill('input[name="title"]', 'Laboratorio creativo per bambini');
          await page.fill('input[name="location"]', 'Scuola Primaria Don Bosco, Via Roma 15');
          await page.fill('input[name="capacity"]', '12');
          await page.fill('input[name="minVolunteers"]', '4');

          // Try to fill notes
          const notesField = page.locator('textarea[name="notes"]');
          if (await notesField.count() > 0) {
            await notesField.fill('Portare materiali per il laboratorio creativo. Si raccomanda puntualità.');
          }
        } catch { /* some fields may not match, that's ok */ }

        await page.waitForTimeout(500);
        await takeScreenshots(page, 'admin-crea-evento');
        await closeDialog(page);
      }
    } else {
      logMissing('admin-crea-evento', 'No "Nuovo evento" button found', 'Check admin events page');
    }
  } catch (err) {
    logMissing('admin-crea-evento', err.message, 'Check event creation form');
  }

  // 19. admin-pubblica-evento
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find a draft event and click Pubblica
    const rows = await page.locator('table tbody tr').all();
    let foundPublishDialog = false;

    for (const row of rows) {
      const rowText = await row.textContent();
      if (rowText && rowText.includes('Bozza')) {
        const actionBtn = row.locator('button').last();
        await actionBtn.click();
        await page.waitForTimeout(800);

        const publishItem = page.getByRole('menuitem', { name: /Pubblica/i });
        if (await publishItem.count() > 0) {
          await publishItem.click();
          await page.waitForTimeout(1500);

          const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
          if (await dialog.count() > 0) {
            await takeScreenshots(page, 'admin-pubblica-evento');
            foundPublishDialog = true;
            await closeDialog(page);
          }
        }
        break;
      }
    }

    if (!foundPublishDialog) {
      logMissing('admin-pubblica-evento', 'No draft event found for publish dialog', 'Create a draft event');
    }
  } catch (err) {
    logMissing('admin-pubblica-evento', err.message, 'Check publish flow');
  }

  // 20-21. admin-clona-singola & admin-clona-multipla
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find any event and click Clone
    const firstActionBtn = page.locator('table tbody tr').first().locator('button').last();
    if (await firstActionBtn.count() > 0) {
      await firstActionBtn.click();
      await page.waitForTimeout(800);

      const cloneItem = page.getByRole('menuitem', { name: /Clona/i });
      if (await cloneItem.count() > 0) {
        await cloneItem.click();
        await page.waitForTimeout(2000);

        const dialog = page.getByRole('dialog');
        if (await dialog.count() > 0) {
          // 20. Single date tab should be active by default
          // Try to click a future date in the calendar
          const calendarDays = page.locator('button[name="day"]');
          const dayButtons = await calendarDays.all();
          if (dayButtons.length > 0) {
            // Click a day that is not disabled
            for (const dayBtn of dayButtons) {
              if (!(await dayBtn.isDisabled())) {
                await dayBtn.click();
                await page.waitForTimeout(500);
                break;
              }
            }
          }

          await takeScreenshots(page, 'admin-clona-singola');

          // 21. Switch to "Date multiple" tab
          const multiTab = page.getByRole('tab', { name: /Date multiple/i });
          if (await multiTab.count() > 0) {
            await multiTab.click();
            await page.waitForTimeout(1000);

            // Select 3 dates
            const calDays = await page.locator('button[name="day"]:not([disabled])').all();
            let selected = 0;
            for (const dayBtn of calDays) {
              if (selected >= 3) break;
              await dayBtn.click();
              await page.waitForTimeout(300);
              selected++;
            }

            if (selected >= 3) {
              await page.waitForTimeout(500);
              await takeScreenshots(page, 'admin-clona-multipla');
            } else {
              logMissing('admin-clona-multipla', 'Could not select 3 dates', 'Check calendar date picker');
            }
          } else {
            logMissing('admin-clona-multipla', 'No "Date multiple" tab found', 'Check clone dialog');
          }

          await closeDialog(page);
        }
      } else {
        logMissing('admin-clona-singola', 'No "Clona" option in dropdown', 'Check event action dropdown');
      }
    }
  } catch (err) {
    logMissing('admin-clona-singola', err.message, 'Check clone flow');
  }

  // 22. admin-serie-ambito
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find a series event — look for events and try editing them
    const rows = await page.locator('table tbody tr').all();
    let foundSeries = false;

    for (const row of rows) {
      const actionBtn = row.locator('button').last();
      if (await actionBtn.count() > 0) {
        await actionBtn.click();
        await page.waitForTimeout(800);

        const editItem = page.getByRole('menuitem', { name: /Modifica/i });
        if (await editItem.count() > 0) {
          await editItem.click();
          await page.waitForTimeout(2000);

          // Check if the series scope dialog appeared
          const bodyText = await page.textContent('body');
          if (bodyText.includes('serie') || bodyText.includes('Solo questo evento')) {
            await takeScreenshots(page, 'admin-serie-ambito');
            foundSeries = true;
            await closeDialog(page);
            break;
          }

          // Not a series event, close and try next
          await closeDialog(page);
        } else {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }
    }

    if (!foundSeries) {
      logMissing('admin-serie-ambito', 'No series event found', 'Clone an event to create a series');
    }
  } catch (err) {
    logMissing('admin-serie-ambito', err.message, 'Check series edit flow');
  }

  // 23. admin-evento-dettaglio (+ 24-30 depend on finding the right events)
  try {
    await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Navigate to a published event detail
    const rows = await page.locator('table tbody tr').all();
    let publishedEventUrl = null;
    let pastEventRecentUrl = null;
    let pastEventOldUrl = null;
    let apertoEventUrl = null;

    for (const row of rows) {
      const rowText = await row.textContent();
      const actionBtn = row.locator('button').last();

      if (await actionBtn.count() > 0) {
        await actionBtn.click();
        await page.waitForTimeout(600);

        const viewItem = page.getByRole('menuitem', { name: /Vedi iscrizioni/i });
        if (await viewItem.count() > 0) {
          const href = await viewItem.getAttribute('href') || '';
          // Close menu
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          // Determine event type from row text
          if (rowText && rowText.includes('Pubblicato')) {
            if (!publishedEventUrl) {
              // Extract event ID from the "Vedi iscrizioni" link
              // Navigate via clicking instead
              publishedEventUrl = row;
            }
            if (rowText.includes('Aperto') && !apertoEventUrl) {
              apertoEventUrl = row;
            }
          }
        } else {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }
    }

    // 23. Admin event detail — click "Vedi iscrizioni" on a published event
    if (publishedEventUrl || rows.length > 0) {
      const targetRow = publishedEventUrl || rows[0];
      const actionBtn = targetRow.locator('button').last();
      await actionBtn.click();
      await page.waitForTimeout(600);

      const viewItem = page.getByRole('menuitem', { name: /Vedi iscrizioni/i });
      if (await viewItem.count() > 0) {
        await viewItem.click();
        await page.waitForTimeout(3000);
        await takeScreenshots(page, 'admin-evento-dettaglio', { fullPage: true });

        // While on the detail page, check for attendance and registration sections
        const bodyText = await page.textContent('body');

        // Check if this is a past event with attendance
        if (bodyText.includes('Presenti') || bodyText.includes('Assenti')) {
          // Try to capture attendance screenshots if applicable
          if (bodyText.includes('Puoi correggere') || bodyText.includes('entro')) {
            await takeScreenshots(page, 'admin-riepilogo-presenze-attivo', { fullPage: true });
          }
          if (bodyText.includes('scaduto') || bodyText.includes('Il periodo di correzione')) {
            await takeScreenshots(page, 'admin-riepilogo-presenze-scaduto', { fullPage: true });
          }
        }

        // 26. admin-iscrizioni-tabella (if there are registrations)
        if (bodyText.includes('Iscrizioni')) {
          const iscrizioniSection = page.getByText('Iscrizioni').first();
          if (await iscrizioniSection.count() > 0) {
            await iscrizioniSection.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await takeScreenshots(page, 'admin-iscrizioni-tabella', { fullPage: true });
          }
        }

        // 27. admin-aggiungi-ricerca
        const addVolBtn = page.getByRole('button', { name: /Aggiungi volontario/i });
        if (await addVolBtn.count() > 0) {
          await addVolBtn.click();
          await page.waitForTimeout(2000);

          const dialog = page.getByRole('dialog');
          if (await dialog.count() > 0) {
            // Type search term using correct placeholder
            const searchInput = dialog.locator('input[placeholder*="Cerca"]').first();
            if (await searchInput.count() > 0) {
              await searchInput.fill('Mar');
              await page.waitForTimeout(1500);
            }

            await takeScreenshots(page, 'admin-aggiungi-ricerca');

            // 28. admin-aggiungi-conferma — try to select a volunteer from the list
            // Volunteers show as buttons in a ScrollArea
            const volunteerItem = dialog.locator('button').filter({ hasText: /Mario|Marco|Maria/ }).first();
            if (await volunteerItem.count() > 0) {
              await volunteerItem.click();
              await page.waitForTimeout(2000);

              // Take screenshot of confirm/override step
              await takeScreenshots(page, 'admin-aggiungi-conferma');
            } else {
              logMissing('admin-aggiungi-conferma', 'No volunteer found in search results', 'Search for a name that exists');
            }

            await closeDialog(page);
          }
        }

        // 29. admin-correzione-attiva — attendance correction dropdown (Select trigger with text "Correggi")
        const correggiBtn = page.getByRole('combobox').first();
        const correggiCount = await correggiBtn.count();
        console.log(`  Attendance correction combobox count: ${correggiCount}`);
        if (correggiCount > 0) {
          await correggiBtn.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await correggiBtn.click();
          await page.waitForTimeout(1000);
          await takeScreenshots(page, 'admin-correzione-attiva');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }
    } else {
      logMissing('admin-evento-dettaglio', 'No events in table', 'Create published events with registrations');
    }
  } catch (err) {
    logMissing('admin-evento-dettaglio', err.message, 'Check admin event detail');
  }

  // ── 24-25. Try to find past events for attendance screenshots ──
  console.log('\n── Attendance Screenshots ──');

  if (!capturedScreenshots.includes('admin-riepilogo-presenze-attivo') ||
    !capturedScreenshots.includes('admin-riepilogo-presenze-scaduto')) {
    try {
      await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      // Look through all events for past ones
      const rows = await page.locator('table tbody tr').all();

      for (const row of rows) {
        const actionBtn = row.locator('button').last();
        if (await actionBtn.count() > 0) {
          await actionBtn.click();
          await page.waitForTimeout(600);

          const viewItem = page.getByRole('menuitem', { name: /Vedi iscrizioni/i });
          if (await viewItem.count() > 0) {
            await viewItem.click();
            await page.waitForTimeout(2000);

            const bodyText = await page.textContent('body');

            if (bodyText.includes('Presenti') || bodyText.includes('Assenti') || bodyText.includes('presenze')) {
              if (!capturedScreenshots.includes('admin-riepilogo-presenze-attivo') &&
                (bodyText.includes('Puoi correggere') || bodyText.includes('correggere le presenze entro'))) {
                await takeScreenshots(page, 'admin-riepilogo-presenze-attivo', { fullPage: true });
              }

              if (!capturedScreenshots.includes('admin-riepilogo-presenze-scaduto') &&
                bodyText.includes('scaduto')) {
                await takeScreenshots(page, 'admin-riepilogo-presenze-scaduto', { fullPage: true });
              }

              // 29-30. Attendance correction
              if (!capturedScreenshots.includes('admin-correzione-attiva') &&
                bodyText.includes('Puoi correggere')) {
                // Look for attendance correction dropdown (Select trigger)
                const correggiTriggers = page.getByRole('combobox');
                if (await correggiTriggers.count() > 0) {
                  await correggiTriggers.first().scrollIntoViewIfNeeded();
                  await page.waitForTimeout(300);
                  await correggiTriggers.first().click();
                  await page.waitForTimeout(800);
                  await takeScreenshots(page, 'admin-correzione-attiva');
                  await page.keyboard.press('Escape');
                  await page.waitForTimeout(300);
                }
              }

              if (!capturedScreenshots.includes('admin-correzione-scaduta') &&
                bodyText.includes('scaduto')) {
                await takeScreenshots(page, 'admin-correzione-scaduta', { fullPage: true });
              }
            }

            await page.goto(`${BASE_URL}/admin/eventi`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
          } else {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        }
      }

      // Log missing ones
      if (!capturedScreenshots.includes('admin-riepilogo-presenze-attivo')) {
        logMissing('admin-riepilogo-presenze-attivo', 'No past event within grace period found', 'Create an event that ended within 48h with registrations');
      }
      if (!capturedScreenshots.includes('admin-riepilogo-presenze-scaduto')) {
        logMissing('admin-riepilogo-presenze-scaduto', 'No past event beyond grace period found', 'Create an event that ended more than 48h ago');
      }
      if (!capturedScreenshots.includes('admin-correzione-attiva')) {
        logMissing('admin-correzione-attiva', 'No attendance correction dropdown available', 'Need past event within grace period');
      }
      if (!capturedScreenshots.includes('admin-correzione-scaduta')) {
        logMissing('admin-correzione-scaduta', 'No expired grace period event found', 'Need past event beyond 48h');
      }
    } catch (err) {
      console.error(`Attendance screenshots error: ${err.message}`);
    }
  }

  // ── 31-34. Admin Users ──
  console.log('\n── Admin Users Screenshots ──');

  // 31. admin-utenti-page
  try {
    await page.goto(`${BASE_URL}/admin/utenti`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshots(page, 'admin-utenti-page', { fullPage: true });
  } catch (err) {
    logMissing('admin-utenti-page', err.message, 'Check admin users page');
  }

  // 32. admin-richieste-attesa
  try {
    await page.goto(`${BASE_URL}/admin/utenti`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const pendingSection = page.getByText('Richieste in attesa');
    if (await pendingSection.count() > 0) {
      await takeScreenshots(page, 'admin-richieste-attesa', { fullPage: true });
    } else {
      logMissing('admin-richieste-attesa', 'No "Richieste in attesa" section found', 'Create pending user accounts');
    }
  } catch (err) {
    logMissing('admin-richieste-attesa', err.message, 'Check admin users page');
  }

  // 33. admin-utenti-filtrati
  try {
    await page.goto(`${BASE_URL}/admin/utenti`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find search input by placeholder
    const searchInput = page.locator('input[placeholder="Cerca per nome o email..."]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Mar');
      await page.waitForTimeout(1000);

      // Try to select "Attivo" from the status filter (Select component)
      const statusTrigger = page.locator('[role="combobox"]').first();
      if (await statusTrigger.count() > 0) {
        await statusTrigger.click();
        await page.waitForTimeout(500);
        const attivoOption = page.getByRole('option', { name: /Attivo/i });
        if (await attivoOption.count() > 0) {
          await attivoOption.click();
          await page.waitForTimeout(1000);
        } else {
          await page.keyboard.press('Escape');
        }
      }

      await takeScreenshots(page, 'admin-utenti-filtrati', { fullPage: true });
    } else {
      // Fallback: try any input
      const anyInput = page.locator('input').first();
      if (await anyInput.count() > 0) {
        await anyInput.fill('Mar');
        await page.waitForTimeout(1000);
        await takeScreenshots(page, 'admin-utenti-filtrati', { fullPage: true });
      } else {
        logMissing('admin-utenti-filtrati', 'No search input found', 'Check admin users page layout');
      }
    }
  } catch (err) {
    logMissing('admin-utenti-filtrati', err.message, 'Check admin users filtering');
  }

  // 34. admin-gdpr-conferma
  try {
    await page.goto(`${BASE_URL}/admin/utenti`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find a deactivated user
    const rows = await page.locator('table tbody tr').all();
    let foundGdpr = false;

    // Look through all users for a deactivated one
    for (const row of rows) {
      const rowText = await row.textContent();
      if (rowText && (rowText.includes('Disattivato') || rowText.includes('deactivated'))) {
        const actionBtn = row.locator('button').last();
        if (await actionBtn.count() > 0) {
          await actionBtn.click();
          await page.waitForTimeout(800);

          const gdprItem = page.getByRole('menuitem', { name: /GDPR|Elimina dati/i });
          if (await gdprItem.count() > 0) {
            await gdprItem.click();
            await page.waitForTimeout(1500);

            const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
            if (await dialog.count() > 0) {
              await takeScreenshots(page, 'admin-gdpr-conferma');
              foundGdpr = true;
              await closeDialog(page);
            }
          } else {
            await page.keyboard.press('Escape');
          }
        }
        break;
      }
    }

    if (!foundGdpr) {
      logMissing('admin-gdpr-conferma', 'No deactivated user found for GDPR dialog', 'Deactivate a test user first');
    }
  } catch (err) {
    logMissing('admin-gdpr-conferma', err.message, 'Check GDPR dialog');
  }

  // ── 35-37. Audit Log ──
  console.log('\n── Audit Log Screenshots ──');

  // 36. admin-audit-tabella (capture first without filters)
  try {
    await page.goto(`${BASE_URL}/admin/audit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshots(page, 'admin-audit-tabella', { fullPage: true });
  } catch (err) {
    logMissing('admin-audit-tabella', err.message, 'Check audit page');
  }

  // 35. admin-audit-filtri
  try {
    await page.goto(`${BASE_URL}/admin/audit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Try to set filters
    const selects = page.locator('select, [role="combobox"]');
    const selectCount = await selects.count();

    if (selectCount >= 2) {
      // Set actor filter (first dropdown)
      try {
        await selects.nth(0).click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.count() > 0) {
          await firstOption.click();
          await page.waitForTimeout(500);
        }
      } catch { /* skip if it fails */ }

      // Set action type filter (second dropdown)
      try {
        await selects.nth(1).click();
        await page.waitForTimeout(500);
        const approvedOption = page.locator('[role="option"]').filter({ hasText: /approvato|Utente/i }).first();
        if (await approvedOption.count() > 0) {
          await approvedOption.click();
          await page.waitForTimeout(500);
        } else {
          const firstOpt = page.locator('[role="option"]').first();
          if (await firstOpt.count() > 0) await firstOpt.click();
        }
      } catch { /* skip */ }
    }

    // Set date range if date inputs exist
    const dateInputs = page.locator('input[type="date"]');
    if (await dateInputs.count() >= 2) {
      await dateInputs.nth(0).fill('2026-01-01');
      await dateInputs.nth(1).fill('2026-02-28');
      await page.waitForTimeout(1000);
    }

    await takeScreenshots(page, 'admin-audit-filtri', { fullPage: true });
  } catch (err) {
    logMissing('admin-audit-filtri', err.message, 'Check audit filters');
  }

  // 37. admin-audit-dettaglio
  try {
    await page.goto(`${BASE_URL}/admin/audit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Click the eye/detail button (has sr-only text "Dettagli")
    const detailBtns = page.getByRole('button', { name: 'Dettagli' });
    const detailCount = await detailBtns.count();
    console.log(`  Audit detail buttons found: ${detailCount}`);
    if (detailCount > 0) {
      await detailBtns.first().click();
      await page.waitForTimeout(1500);

      const dialog = page.getByRole('dialog');
      if (await dialog.count() > 0) {
        await takeScreenshots(page, 'admin-audit-dettaglio');
        await closeDialog(page);
      } else {
        logMissing('admin-audit-dettaglio', 'Audit detail dialog did not appear', 'Check audit detail button');
      }
    } else {
      // Fallback: try any button with an SVG icon in table rows
      const fallbackBtns = page.locator('table tbody tr button').filter({ has: page.locator('svg') });
      if (await fallbackBtns.count() > 0) {
        await fallbackBtns.first().click();
        await page.waitForTimeout(1500);
        const dialog = page.getByRole('dialog');
        if (await dialog.count() > 0) {
          await takeScreenshots(page, 'admin-audit-dettaglio');
          await closeDialog(page);
        }
      } else {
        logMissing('admin-audit-dettaglio', 'No detail buttons found in audit table', 'Ensure audit entries have before/after state');
      }
    }
  } catch (err) {
    logMissing('admin-audit-dettaglio', err.message, 'Check audit detail');
  }

  // ── 38-39. Export ──
  console.log('\n── Export Screenshots ──');

  // 38. admin-export-page (empty state)
  try {
    await page.goto(`${BASE_URL}/admin/export`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshots(page, 'admin-export-page', { fullPage: true });
  } catch (err) {
    logMissing('admin-export-page', err.message, 'Check export page');
  }

  // 39. admin-export-compilato
  try {
    await page.goto(`${BASE_URL}/admin/export`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Fill date fields
    const dateInputs = page.locator('input[type="date"]');
    if (await dateInputs.count() >= 2) {
      await dateInputs.nth(0).fill('2026-01-01');
      await dateInputs.nth(1).fill('2026-02-28');
      await page.waitForTimeout(1000);
      await takeScreenshots(page, 'admin-export-compilato', { fullPage: true });
    } else {
      // Try other date input patterns
      const inputs = page.locator('input').filter({ hasText: /Da|A|data/i });
      if (await inputs.count() >= 2) {
        await inputs.nth(0).fill('01/01/2026');
        await inputs.nth(1).fill('28/02/2026');
        await page.waitForTimeout(1000);
        await takeScreenshots(page, 'admin-export-compilato', { fullPage: true });
      } else {
        logMissing('admin-export-compilato', 'Could not find date inputs', 'Check export page date fields');
      }
    }
  } catch (err) {
    logMissing('admin-export-compilato', err.message, 'Check export form');
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Namo Screenshot Automation                            ║');
  console.log('║  39 screenshots × 2 viewports = 78 PNGs               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Server: ${BASE_URL}`);

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    // Use SEPARATE browser contexts for each user (avoids logout issues)

    // Volunteer context
    const volContext = await browser.newContext({
      viewport: DESKTOP,
      locale: 'it-IT',
      colorScheme: 'light',
    });
    const volPage = await volContext.newPage();
    await captureVolunteerScreenshots(volPage);
    await volContext.close();

    // Admin context
    const adminContext = await browser.newContext({
      viewport: DESKTOP,
      locale: 'it-IT',
      colorScheme: 'light',
    });
    const adminPage = await adminContext.newPage();
    await captureAdminScreenshots(adminPage);
    await adminContext.close();

  } catch (err) {
    console.error(`\nFATAL ERROR: ${err.message}`);
    console.error(err.stack);
  } finally {
    await browser.close();
  }

  // Write MISSING_DATA.md
  let missingReport = `# Missing Data / Failed Screenshots\n\nGenerated: ${new Date().toISOString()}\n\n`;

  if (missingData.length === 0) {
    missingReport += 'All 39 screenshots captured successfully!\n';
  } else {
    missingReport += `${missingData.length} screenshot(s) could not be captured:\n\n`;
    for (const entry of missingData) {
      missingReport += `## ${entry.label}\n`;
      missingReport += `- **Reason:** ${entry.reason}\n`;
      missingReport += `- **Suggestion:** ${entry.suggestion}\n\n`;
    }
  }

  writeFileSync(MISSING_DATA_FILE, missingReport);

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Captured: ${capturedScreenshots.length} / 39 screenshots`);
  console.log(`  Missing:  ${missingData.length} screenshots`);
  console.log(`  Files:    ${capturedScreenshots.length * 2} PNGs (desktop + mobile)`);

  if (missingData.length > 0) {
    console.log(`\n  See ${MISSING_DATA_FILE} for details on missing screenshots.`);
  }
}

main().catch(console.error);
