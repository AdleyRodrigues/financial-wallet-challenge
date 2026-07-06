import { expect, test, type Page } from '@playwright/test';

const PASSWORD = 'Password123!';

function buildEmail(alias: string, runId: number) {
  return `e2e.web+${alias}.${runId}@example.com`;
}

async function registerUser(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await page.goto('/register');
  await page.getByLabel('Nome').fill(name);
  await page.getByLabel('E-mail').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function logoutUser(page: Page) {
  await page.getByTestId('logout-button').click();
  await expect(page).toHaveURL(/\/login$/);
}

test('financial critical flow in browser', async ({ page }) => {
  const runId = Date.now();
  const aliceEmail = buildEmail('alice', runId);
  const brunoEmail = buildEmail('bruno', runId);

  await registerUser(page, `Alice Web ${runId}`, aliceEmail, PASSWORD);
  await registerUser(page, `Bruno Web ${runId}`, brunoEmail, PASSWORD);

  await loginUser(page, aliceEmail, PASSWORD);
  await expect(page.getByTestId('dashboard-balance')).toHaveText('R$ 0,00');

  await page.getByLabel('Valor (R$)').first().fill('100');
  await page.getByRole('button', { name: 'Depositar' }).click();
  await expect(page.getByTestId('dashboard-balance')).toHaveText('R$ 100,00');

  await page.getByLabel('E-mail do destinatário').fill(brunoEmail);
  await page.getByLabel('Valor (R$)').nth(1).fill('40');
  await page.getByRole('button', { name: 'Transferir' }).click();
  await expect(page.getByTestId('dashboard-balance')).toHaveText('R$ 60,00');
  await expect(page.getByText('Transferência realizada com sucesso.')).toBeVisible();

  await logoutUser(page);

  await loginUser(page, brunoEmail, PASSWORD);
  await expect(page.getByTestId('dashboard-balance')).toHaveText('R$ 40,00');
  await expect(page.getByText('Transferência', { exact: true }).first()).toBeVisible();

  await logoutUser(page);

  await loginUser(page, aliceEmail, PASSWORD);
  await page.getByRole('button', { name: 'Reverter' }).first().click();
  await page.getByTestId('reverse-confirm-button').click();

  await expect(page.getByTestId('dashboard-balance')).toHaveText('R$ 100,00');
  await expect(page.getByText('Transação revertida com sucesso.')).toBeVisible();
  await expect(page.getByText('Revertida', { exact: true }).first()).toBeVisible();
});
