import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const BACKEND = 'http://localhost:3000';
const SHOT_DIR =
  '/private/tmp/claude-501/-Users-MacBook-Documents-claude-elianny/99b4dd1a-e8d2-4f61-808d-54ead6848c2e/scratchpad/phase-i-screenshots';
const MACRODOMAIN = 'Business Line';

const BREAKPOINTS = [
  { name: '1280', width: 1280, height: 900 },
  { name: '950', width: 950, height: 900 },
  { name: '620', width: 620, height: 1100 },
];

async function assertNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe('Phase I — /motivadores responsive check (no submission, free of rate limiting)', () => {
  for (const bp of BREAKPOINTS) {
    test(`steps 0/1/2 at ${bp.width}px have no page-level horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/motivadores');
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `motivadores-step0-${bp.name}.png`),
        fullPage: true,
      });

      await page.getByLabel('Nombre').fill('Visual Check');
      await page.getByLabel('Correo electrónico').fill('visualcheck@example.com');
      await page.getByLabel('Macrodominio').selectOption(MACRODOMAIN);
      await page.getByRole('button', { name: 'Siguiente' }).click();
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `motivadores-step1-${bp.name}.png`),
        fullPage: true,
      });

      await page.getByRole('button', { name: 'Siguiente' }).click();
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `motivadores-step2-${bp.name}.png`),
        fullPage: true,
      });
    });
  }
});

test.describe('Step 2 (Impacto) respects the order chosen in Step 1', () => {
  test('reordering in Step 1 changes the card order shown in Step 2', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/motivadores');
    await page.getByLabel('Nombre').fill('Order Check');
    await page.getByLabel('Correo electrónico').fill('orderCheck@example.com');
    await page.getByLabel('Macrodominio').selectOption(MACRODOMAIN);
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // MOT's fixed order starts with Aceptación, then Curiosidad. Move
    // Curiosidad one slot left so it becomes the new leftmost (most
    // important) card — a visual order that no longer matches MOT's raw
    // order, which is exactly what a regression back to iterating MOT
    // directly in Step 2 would fail to reflect.
    await page.getByRole('button', { name: 'Mover Curiosidad a la izquierda' }).click();

    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.getByText('¿Cómo impacta el nuevo rol?')).toBeVisible();

    const firstCardName = await page
      .locator('[aria-label^="Impacto de "]')
      .first()
      .getAttribute('aria-label');
    expect(firstCardName).toBe('Impacto de Curiosidad');
  });
});

test.describe('Phase I — Home and Preparar motivator sections (no submission)', () => {
  test('Home empty-state and Preparar pending-state, at 1280px and 620px', async ({
    page,
    context,
    request,
  }) => {
    const RUN_ID = Date.now();
    const email = `phasei-visual-${RUN_ID}@example.com`;
    const signupRes = await request.post(`${BACKEND}/auth/signup`, {
      data: { email, password: 'Test1234!' },
    });
    const signupBody = await signupRes.json();
    const accessToken: string = signupBody.session.access_token;
    const refreshToken: string = signupBody.session.refresh_token;

    const architectName = `Phase I Visual ${RUN_ID}`;
    const createRes = await request.post(`${BACKEND}/api/records`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { architectName },
    });
    const recordRow = await createRes.json();
    await request.patch(`${BACKEND}/api/records/${recordRow.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { architectEmail: `phasei-visual-architect-${RUN_ID}@example.com`, macrodomain: MACRODOMAIN },
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

    for (const bp of [BREAKPOINTS[0], BREAKPOINTS[2]]) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `home-empty-state-${bp.name}.png`),
        fullPage: true,
      });
    }

    await page
      .getByRole('row', { name: new RegExp(architectName) })
      .getByRole('button', { name: 'Abrir' })
      .click();
    await expect(page.getByText('Pendiente de autoevaluación')).toBeVisible();

    for (const bp of [BREAKPOINTS[0], BREAKPOINTS[2]]) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `preparar-pending-state-${bp.name}.png`),
        fullPage: true,
      });
    }
  });

  // Uses exactly one real public submission (counts against the public
  // endpoint's rate limit), unlike the other tests in this file.
  test('Home and Preparar with a real submission present, at 1280px', async ({
    page,
    request,
  }) => {
    const RUN_ID = Date.now();
    const architectEmail = `phasei-visualdata-architect-${RUN_ID}@example.com`;
    const signupRes = await request.post(`${BACKEND}/auth/signup`, {
      data: { email: `phasei-visualdata-${RUN_ID}@example.com`, password: 'Test1234!' },
    });
    const signupBody = await signupRes.json();
    const accessToken: string = signupBody.session.access_token;
    const refreshToken: string = signupBody.session.refresh_token;

    const architectName = `Phase I VisualData ${RUN_ID}`;
    const createRes = await request.post(`${BACKEND}/api/records`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { architectName },
    });
    const recordRow = await createRes.json();
    await request.patch(`${BACKEND}/api/records/${recordRow.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { architectEmail, macrodomain: MACRODOMAIN },
    });

    const motivators = [
      'Aceptación', 'Curiosidad', 'Libertad', 'Estatus', 'Meta',
      'Honor', 'Maestría', 'Orden', 'Poder', 'Relaciones',
    ];
    await request.post(`${BACKEND}/api/public/moving-motivators`, {
      data: {
        name: 'Arquitecto Visual Data',
        email: architectEmail,
        macrodomain: MACRODOMAIN,
        priorities: motivators.map((m, i) => ({ motivator: m, priorityOrder: i + 1 })),
        impacts: motivators.map((m, i) => ({ motivator: m, impact: (i % 9) - 4 })),
      },
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.evaluate(
      ([t, r]) => {
        localStorage.setItem('gemba_access_token', t);
        localStorage.setItem('gemba_refresh_token', r);
      },
      [accessToken, refreshToken],
    );
    await page.reload();
    await page.getByLabel('Macrodominio').selectOption(MACRODOMAIN);

    await expect(
      page.locator('[aria-label="Radar de impacto de motivadores del equipo"]'),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, 'home-with-data-1280.png'),
      fullPage: true,
    });

    await page
      .getByRole('row', { name: new RegExp(architectName) })
      .getByRole('button', { name: 'Abrir' })
      .click();
    await expect(
      page.locator('[aria-label="Radar de motivadores del arquitecto"]'),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, 'preparar-result-state-1280.png'),
      fullPage: true,
    });
  });
});
