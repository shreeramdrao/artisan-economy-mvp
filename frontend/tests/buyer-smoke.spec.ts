import { test, expect } from '@playwright/test';

test.describe('Buyer Side Smoke Tests', () => {
  test('should load buyer catalog page', async ({ page }) => {
    await page.goto('/buyer');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Artisan Economy/);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Artisan Economy');
    
    // Check for product grid
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test('should open quick view modal', async ({ page }) => {
    await page.goto('/buyer');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click quick view button
    await page.locator('[data-testid="quick-view-button"]').first().click();
    
    // Check if modal opens
    await expect(page.locator('[data-testid="quick-view-modal"]')).toBeVisible();
    
    // Check modal content
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  });

  test('should toggle wishlist', async ({ page }) => {
    await page.goto('/buyer');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click heart button
    await page.locator('[data-testid="heart-button"]').first().click();
    
    // Check for toast notification
    await expect(page.locator('[data-testid="toast"]')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/buyer');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click add to cart button
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Check for success message
    await expect(page.locator('text=Added to Cart')).toBeVisible();
  });

  test('should load personalized feed', async ({ page }) => {
    await page.goto('/buyer/feed');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Personalized Feed/);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Personalized Feed');
  });

  test('should open AI chat assistant', async ({ page }) => {
    await page.goto('/buyer');
    
    // Click chat assistant button
    await page.locator('[data-testid="chat-assistant-button"]').click();
    
    // Check if chat modal opens
    await expect(page.locator('[data-testid="chat-modal"]')).toBeVisible();
    
    // Check for input field
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
  });

  test('should load cart page', async ({ page }) => {
    await page.goto('/buyer/cart');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Cart/);
    
    // Check for cart elements
    await expect(page.locator('h1')).toContainText('Shopping Cart');
  });

  test('should load product detail page', async ({ page }) => {
    await page.goto('/buyer');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Check if product detail page loads
    await expect(page).toHaveURL(/\/buyer\/product\//);
    
    // Check for product details
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
  });

  test('should load artisans page', async ({ page }) => {
    await page.goto('/buyer/artisans');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Artisans/);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Our Artisans');
  });

  test('should load liked products page', async ({ page }) => {
    await page.goto('/buyer/liked');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Liked Products/);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Your Favorites');
  });
});
