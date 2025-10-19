import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test('should authenticate user and access protected routes', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Fill login form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to buyer dashboard
    await expect(page).toHaveURL('/buyer');
    
    // Verify user menu is visible
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should protect seller routes', async ({ page }) => {
    // Try to access seller dashboard without authentication
    await page.goto('/seller');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });

  test('should handle cart operations', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'buyer@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to products
    await page.goto('/buyer');
    
    // Add product to cart
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart count updates
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // Navigate to cart page
    await page.goto('/buyer/cart');
    
    // Verify product is in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });

  test('should handle product search and filtering', async ({ page }) => {
    await page.goto('/buyer');
    
    // Search for products
    await page.fill('[data-testid="search-input"]', 'pottery');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', 'Pottery');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/buyer');
    
    // Should show error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle network timeouts', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/products', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }, 5000);
    });
    
    await page.goto('/buyer');
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
  });
});
