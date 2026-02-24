/**
 * Namo — Capture MISSING screenshots for chapters 2 & 3
 * Run: node docs/screenshots_for_manual/take-missing-screenshots.mjs
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = __dirname;

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'stefano.pollastri25@gmail.com';
const ADMIN_PASSWORD = '15October!';

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 812 };

const captured = [];
const missing = [];

async function screenshot(page, label, opts = {}) {
  const { fullPage = false } = opts;
  try {
    await page.setViewportSize(DESKTOP);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${label}.png`), fullPage, type: 'png' });

    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${label}-mobile.png`), fullPage, type: 'png' });

    await page.setViewportSize(DESKTOP);
    await page.waitForTimeout(300);
    captured.push(label);
    console.log(`  ✓ ${label}`);
    return true;
  } catch (err) {
    missing.push({ label, reason: err.message });
    console.warn(`  ✗ ${label}: ${err.message}`);
    return false;
  }
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/accedi`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('input#email', { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.includes('/accedi'), { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  console.log(`  Logged in as ${email} → ${page.url()}`);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Namo — Missing Screenshots (Chapters 2 & 3)           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  try {
    // ── Chapter 2: Auth pages (unauthenticated) ──
    console.log('── Chapter 2: Auth Pages ──');

    const authCtx = await browser.newContext({ viewport: DESKTOP, locale: 'it-IT', colorScheme: 'light' });
    const authPage = await authCtx.newPage();

    // 1. Login page (empty)
    await authPage.goto(`${BASE_URL}/accedi`, { waitUntil: 'networkidle', timeout: 60000 });
    await authPage.waitForTimeout(2000);
    await screenshot(authPage, 'login-page');

    // 2. Login page with filled credentials
    await authPage.goto(`${BASE_URL}/accedi`, { waitUntil: 'networkidle', timeout: 30000 });
    await authPage.waitForSelector('input#email', { timeout: 10000 });
    await authPage.waitForTimeout(500);
    await authPage.fill('input#email', 'mario.rossi@email.it');
    await authPage.fill('input#password', 'password123');
    await authPage.waitForTimeout(500);
    await screenshot(authPage, 'login-filled');

    // 3. Registration form filled
    await authPage.goto(`${BASE_URL}/registrati`, { waitUntil: 'networkidle', timeout: 30000 });
    await authPage.waitForTimeout(2000);
    try {
      await authPage.fill('input#firstName', 'Mario');
      await authPage.fill('input#lastName', 'Rossi');
      await authPage.fill('input#email', 'mario.rossi@email.it');
      await authPage.fill('input#password', 'Password123!');
      const phoneInput = authPage.locator('input#phone');
      if (await phoneInput.count() > 0) await phoneInput.fill('333 1234567');
      const nicknameInput = authPage.locator('input#nickname');
      if (await nicknameInput.count() > 0) await nicknameInput.fill('SuperMario');

      // Select 2 sectors (checkbox buttons)
      const checkboxes = authPage.locator('button[role="checkbox"]');
      const checkCount = await checkboxes.count();
      console.log(`  Found ${checkCount} checkboxes`);
      if (checkCount >= 2) {
        await checkboxes.nth(0).click(); // Clown Terapia
        await authPage.waitForTimeout(200);
        await checkboxes.nth(4 < checkCount ? 4 : checkCount - 1).click(); // Eventi Speciali or last
        await authPage.waitForTimeout(200);
      }

      const notesArea = authPage.locator('textarea#notes');
      if (await notesArea.count() > 0) await notesArea.fill('Disponibile il sabato pomeriggio');

      // GDPR checkbox is the one with id="privacy"
      const privacyCheck = authPage.locator('#privacy');
      if (await privacyCheck.count() > 0) {
        await privacyCheck.click();
        await authPage.waitForTimeout(200);
      }

      await authPage.waitForTimeout(500);
    } catch (err) {
      console.warn(`  Form fill partial: ${err.message}`);
    }
    await screenshot(authPage, 'registration-form', { fullPage: true });

    // 4. Registration success - actually submit the form with a unique email
    try {
      await authPage.goto(`${BASE_URL}/registrati`, { waitUntil: 'networkidle', timeout: 30000 });
      await authPage.waitForTimeout(1500);

      const uniqueEmail = `screenshot-${Date.now()}@namo-test.invalid`;
      await authPage.fill('input#firstName', 'Mario');
      await authPage.fill('input#lastName', 'Rossi');
      await authPage.fill('input#email', uniqueEmail);
      await authPage.fill('input#password', 'TestPassword123!');

      // Check GDPR/privacy
      const privacyCheck = authPage.locator('#privacy');
      if (await privacyCheck.count() > 0) {
        await privacyCheck.click();
        await authPage.waitForTimeout(300);
      }

      // Submit
      const submitBtn = authPage.locator('button[type="submit"]');
      console.log(`  Submit button count: ${await submitBtn.count()}`);
      await submitBtn.click();
      await authPage.waitForTimeout(8000);

      const bodyText = await authPage.textContent('body');
      console.log(`  Page contains 'Registrazione completata': ${bodyText.includes('Registrazione completata')}`);
      if (bodyText.includes('Registrazione completata')) {
        await screenshot(authPage, 'registration-success');
      } else {
        console.log(`  Page text snippet: ${bodyText.substring(0, 200)}`);
        missing.push({ label: 'registration-success', reason: 'Success page not shown' });
      }
    } catch (err) {
      missing.push({ label: 'registration-success', reason: err.message });
    }

    // 5. In-attesa page — need a pending account session
    // The /in-attesa page redirects if not authenticated. Let's try logging in with the account we just created.
    try {
      // Navigate directly — this page might be server-rendered with a redirect
      // Try just visiting it without auth — may show auth layout
      await authPage.goto(`${BASE_URL}/in-attesa`, { waitUntil: 'networkidle', timeout: 30000 });
      await authPage.waitForTimeout(2000);
      const pageText = await authPage.textContent('body');
      if (pageText.includes('attesa') || pageText.includes('approvazione') || pageText.includes('Account in attesa')) {
        await screenshot(authPage, 'waiting-approval');
      } else {
        console.log(`  /in-attesa redirected to: ${authPage.url()}`);
        missing.push({ label: 'waiting-approval', reason: `Redirected to ${authPage.url()}` });
      }
    } catch (err) {
      missing.push({ label: 'waiting-approval', reason: err.message });
    }

    // 6. Password recovery page
    await authPage.goto(`${BASE_URL}/recupera-password`, { waitUntil: 'networkidle', timeout: 30000 });
    await authPage.waitForTimeout(2000);
    const recEmail = authPage.locator('input#email, input[type="email"]').first();
    if (await recEmail.count() > 0) {
      await recEmail.fill('mario.rossi@email.it');
    }
    await screenshot(authPage, 'password-recovery');

    // 7. Password reset page
    await authPage.goto(`${BASE_URL}/reimposta-password`, { waitUntil: 'networkidle', timeout: 30000 });
    await authPage.waitForTimeout(2000);
    await screenshot(authPage, 'password-reset');

    await authCtx.close();

    // ── Chapter 2: Navigation layout (needs login) ──
    console.log('\n── Chapter 2: Navigation Layout ──');

    const navCtx = await browser.newContext({ viewport: DESKTOP, locale: 'it-IT', colorScheme: 'light' });
    const navPage = await navCtx.newPage();
    await login(navPage, ADMIN_EMAIL, ADMIN_PASSWORD);

    await navPage.goto(`${BASE_URL}/calendario`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await navPage.waitForTimeout(3000);
    await screenshot(navPage, 'desktop-layout');

    // Explicit mobile layout
    await navPage.setViewportSize(MOBILE);
    await navPage.waitForTimeout(800);
    await navPage.screenshot({ path: path.join(OUTPUT_DIR, 'mobile-layout.png'), fullPage: false, type: 'png' });
    await navPage.setViewportSize(DESKTOP);
    captured.push('mobile-layout');
    console.log('  ✓ mobile-layout');

    await navCtx.close();

    // ── Chapter 3: Public events (unauthenticated) ──
    console.log('\n── Chapter 3: Public Events ──');

    const pubCtx = await browser.newContext({ viewport: DESKTOP, locale: 'it-IT', colorScheme: 'light' });
    const pubPage = await pubCtx.newPage();

    // 10. Public events page
    await pubPage.goto(`${BASE_URL}/eventi`, { waitUntil: 'networkidle', timeout: 60000 });
    await pubPage.waitForTimeout(3000);
    await screenshot(pubPage, 'public-events', { fullPage: true });

    // 11. External registration dialog
    try {
      // Re-navigate to fresh state
      await pubPage.goto(`${BASE_URL}/eventi`, { waitUntil: 'networkidle', timeout: 30000 });
      await pubPage.waitForTimeout(2000);

      // Find Iscriviti button (not disabled "Completo")
      const iscrivitiButtons = pubPage.locator('button:not([disabled])').filter({ hasText: /^Iscriviti$/ });
      const btnCount = await iscrivitiButtons.count();
      console.log(`  Iscriviti buttons on /eventi: ${btnCount}`);

      if (btnCount > 0) {
        await iscrivitiButtons.first().click();
        await pubPage.waitForTimeout(2000);

        const dialog = pubPage.getByRole('dialog');
        if (await dialog.count() > 0) {
          console.log('  Dialog opened');

          // Fill using react-hook-form field names (they render as name attributes)
          const firstNameInput = dialog.locator('input[name="firstName"]');
          const lastNameInput = dialog.locator('input[name="lastName"]');
          const emailInput = dialog.locator('input[name="email"]');

          if (await firstNameInput.count() > 0) await firstNameInput.fill('Laura');
          if (await lastNameInput.count() > 0) await lastNameInput.fill('Bianchi');
          if (await emailInput.count() > 0) await emailInput.fill(`laura-${Date.now()}@email.com`);

          // Check privacy checkbox
          const privacyCheck = dialog.locator('button[role="checkbox"]');
          if (await privacyCheck.count() > 0) {
            await privacyCheck.click();
            await pubPage.waitForTimeout(300);
          }

          await pubPage.waitForTimeout(500);
          await screenshot(pubPage, 'external-registration-form');

          // 12. Submit to get success
          const submitBtn = dialog.locator('button[type="submit"]');
          console.log(`  Submit buttons in dialog: ${await submitBtn.count()}`);
          if (await submitBtn.count() > 0) {
            await submitBtn.click();
            await pubPage.waitForTimeout(8000);

            // Check if dialog still exists and shows success
            const dialogStill = pubPage.getByRole('dialog');
            if (await dialogStill.count() > 0) {
              const dialogText = await dialogStill.textContent();
              console.log(`  Dialog text after submit: ${dialogText.substring(0, 100)}`);
              if (dialogText.includes('confermata') || dialogText.includes('Iscrizione confermata')) {
                await screenshot(pubPage, 'external-registration-success');
              } else {
                missing.push({ label: 'external-registration-success', reason: `Dialog text: ${dialogText.substring(0, 80)}` });
              }
            } else {
              // Maybe dialog closed — check page
              const pageText = await pubPage.textContent('body');
              if (pageText.includes('confermata')) {
                await screenshot(pubPage, 'external-registration-success');
              } else {
                missing.push({ label: 'external-registration-success', reason: 'Dialog disappeared without success' });
              }
            }
          }

          await pubPage.keyboard.press('Escape').catch(() => {});
          await pubPage.waitForTimeout(500);
        } else {
          missing.push({ label: 'external-registration-form', reason: 'Dialog did not appear' });
        }
      } else {
        missing.push({ label: 'external-registration-form', reason: 'No Iscriviti button found on /eventi' });
      }
    } catch (err) {
      console.error(`  External reg error: ${err.message}`);
      missing.push({ label: 'external-registration-form', reason: err.message });
    }

    await pubCtx.close();

  } catch (err) {
    console.error(`FATAL: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log(`\n── Summary ──`);
  console.log(`  Captured: ${captured.length}`);
  console.log(`  Missing: ${missing.length}`);
  for (const m of missing) {
    console.log(`    ✗ ${m.label}: ${m.reason.substring(0, 80)}`);
  }
}

main().catch(console.error);
