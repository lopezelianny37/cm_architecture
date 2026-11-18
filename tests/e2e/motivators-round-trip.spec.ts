import { test, expect } from '@playwright/test';

const BACKEND = 'http://localhost:3000';
const RUN_ID = Date.now();
const FACILITATOR_EMAIL = `phasei-facilitator-${RUN_ID}@example.com`;
const FACILITATOR_PASSWORD = 'Test1234!';
const ARCHITECT_NAME = `Phase I E2E ${RUN_ID}`;
const ARCHITECT_EMAIL = `phasei-architect-${RUN_ID}@example.com`;
const MACRODOMAIN = 'Business Line';

test.describe('Moving Motivators — round trip end-to-end', () => {
  test('public submission reaches Preparar and Home, and a repeat submission overwrites (not duplicates)', async ({
    page,
    context,
    request,
    browser,
  }) => {
    // --- Setup via API: facilitator account + record with architect_email/macrodomain set ---
    const signupRes = await request.post(`${BACKEND}/auth/signup`, {
      data: { email: FACILITATOR_EMAIL, password: FACILITATOR_PASSWORD },
    });
    expect(signupRes.ok()).toBe(true);
    const signupBody = await signupRes.json();
    const accessToken: string = signupBody.session.access_token;
    const refreshToken: string = signupBody.session.refresh_token;

    const createRes = await request.post(`${BACKEND}/api/records`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { architectName: ARCHITECT_NAME },
    });
    expect(createRes.ok()).toBe(true);
    const record = await createRes.json();
    const recordId: string = record.id;

    const patchRes = await request.patch(`${BACKEND}/api/records/${recordId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { architectEmail: ARCHITECT_EMAIL, macrodomain: MACRODOMAIN },
    });
    expect(patchRes.ok()).toBe(true);

    // --- Facilitator session in the real browser ---
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: 'http://localhost:5173',
    });
    await page.goto('/');
    await page.evaluate(
      ([t, r]) => {
        localStorage.setItem('gemba_access_token', t);
        localStorage.setItem('gemba_refresh_token', r);
      },
      [accessToken, refreshToken],
    );
    await page.reload();

    await page
      .getByRole('row', { name: new RegExp(ARCHITECT_NAME) })
      .getByRole('button', { name: 'Abrir' })
      .click();

    // Preparar tab is the default tab -> pending state visible immediately.
    await expect(page.getByText('Pendiente de autoevaluación')).toBeVisible();
    await page.getByRole('button', { name: 'Copiar enlace' }).click();
    const copiedUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedUrl).toBe('http://localhost:5173/motivadores');

    // --- Unauthenticated public wizard, in a brand-new browser context ---
    const publicContext = await browser.newContext();
    const publicPage = await publicContext.newPage();
    await publicPage.goto(copiedUrl);

    await publicPage.getByLabel('Nombre').fill(`Arquitecto Phase I ${RUN_ID}`);
    await publicPage.getByLabel('Correo electrónico').fill(ARCHITECT_EMAIL);
    await publicPage.getByLabel('Macrodominio').selectOption(MACRODOMAIN);
    await publicPage.getByRole('button', { name: 'Siguiente' }).click();

    await expect(publicPage.getByText('¿Qué te mueve?')).toBeVisible();
    await publicPage.getByRole('button', { name: 'Siguiente' }).click();

    await expect(publicPage.getByText('¿Cómo impacta el nuevo rol?')).toBeVisible();
    await publicPage.getByRole('button', { name: 'Enviar' }).click();

    await expect(publicPage.getByText('¡Gracias!')).toBeVisible();
    await publicContext.close();

    // --- Facilitator reloads Preparar: now sees the submitted result ---
    // A full reload resets in-memory navigation state back to Home (no
    // router in this app), so re-open the record from the roster.
    await page.reload();
    await page
      .getByRole('row', { name: new RegExp(ARCHITECT_NAME) })
      .getByRole('button', { name: 'Abrir' })
      .click();
    await expect(
      page.locator('[aria-label="Radar de motivadores del arquitecto"]'),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label="Prioridad de motivadores del arquitecto"]'),
    ).toBeVisible();
    await expect(page.getByText('Pendiente de autoevaluación')).not.toBeVisible();

    // --- Facilitator reloads Home: team aggregate reflects the new submission ---
    await page.getByRole('button', { name: 'Volver al home' }).click();
    await page.getByLabel('Macrodominio').selectOption(MACRODOMAIN);
    await expect(
      page.locator('[aria-label="Radar de impacto de motivadores del equipo"]'),
    ).toBeVisible();
    await expect(page.getByText(/Todavía no hay autoevaluaciones/)).not.toBeVisible();

    // --- Repeat submission with the same email, different values -> overwrite ---
    const publicContext2 = await browser.newContext();
    const publicPage2 = await publicContext2.newPage();
    await publicPage2.goto(copiedUrl);

    await publicPage2.getByLabel('Nombre').fill(`Arquitecto Phase I ${RUN_ID} (actualizado)`);
    await publicPage2.getByLabel('Correo electrónico').fill(ARCHITECT_EMAIL);
    await publicPage2.getByLabel('Macrodominio').selectOption(MACRODOMAIN);
    await publicPage2.getByRole('button', { name: 'Siguiente' }).click();
    await publicPage2.getByRole('button', { name: 'Siguiente' }).click();

    // Change one impact value this run so the overwrite is provable, not just
    // a resubmission of identical data.
    const impactSlider = publicPage2.getByLabel('Impacto de Aceptación');
    await impactSlider.focus();
    for (let i = 0; i < 4; i++) {
      await publicPage2.keyboard.press('ArrowRight');
    }
    await expect(impactSlider).toHaveValue('4');

    await publicPage2.getByRole('button', { name: 'Enviar' }).click();

    await expect(publicPage2.getByRole('dialog')).toBeVisible();
    await expect(
      publicPage2.getByRole('heading', { name: 'Ya existe un registro' }),
    ).toBeVisible();
    await publicPage2.getByRole('button', { name: 'Reemplazar' }).click();

    await expect(publicPage2.getByText('¡Gracias!')).toBeVisible();
    await publicContext2.close();

    // --- Confirm the facilitator's view now shows the UPDATED values ---
    const resultRes = await request.get(
      `${BACKEND}/api/records/${recordId}/motivator-result`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const resultBody = await resultRes.json();
    expect(resultBody.found).toBe(true);
    expect(resultBody.result.name).toBe(`Arquitecto Phase I ${RUN_ID} (actualizado)`);
    const updatedImpact = resultBody.result.impacts.find(
      (i: { motivator: string; impact: number }) => i.motivator === 'Aceptación',
    )?.impact;
    expect(updatedImpact).toBe(4);
  });
});
