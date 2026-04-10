import { test, expect } from '@playwright/test';

test.describe('Events Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events');
  });

  test('отображает заголовок страницы', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Предстоящие события' })).toBeVisible();
  });

  test('отображает список бронирований из моков', async ({ page }) => {
    await expect(page.getByText('Иван Петров')).toBeVisible();
    await expect(page.getByText('ivan@example.com')).toBeVisible();
    await expect(page.getByText('Консультация 30 мин')).toBeVisible();
  });

  test('отображает детали бронирования', async ({ page }) => {
    // Проверяем дату и время
    await expect(page.getByText(/\d+ января \d{4}/)).toBeVisible();
    
    // Проверяем статус
    await expect(page.getByText('Подтверждено')).toBeVisible();
    
    // Проверяем заметки
    await expect(page.getByText('Заметки: Тестовая запись')).toBeVisible();
  });
});
