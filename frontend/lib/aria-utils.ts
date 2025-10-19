// frontend/lib/aria-utils.ts

/**
 * Announces messages to screen readers via ARIA live region
 * @param message - The message to announce
 */
export const announceLiveRegion = (message: string) => {
  if (typeof window === 'undefined') return
  
  const region = document.getElementById('aria-live-region')
  if (region) {
    // Clear previous message
    region.textContent = ''
    
    // Use setTimeout to ensure the change is detected
    setTimeout(() => {
      region.textContent = message
    }, 100)
  }
}

/**
 * Announces urgent messages to screen readers via ARIA live region
 * @param message - The urgent message to announce
 */
export const announceUrgentLiveRegion = (message: string) => {
  if (typeof window === 'undefined') return
  
  const region = document.getElementById('aria-live-urgent')
  if (region) {
    region.textContent = ''
    setTimeout(() => {
      region.textContent = message
    }, 100)
  }
}

/**
 * Creates a unique ID for ARIA relationships
 * @param prefix - The prefix for the ID
 * @returns A unique ID string
 */
export const createAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Focuses the first focusable element in a container
 * @param container - The container element
 */
export const focusFirstElement = (container: HTMLElement | null) => {
  if (!container) return
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length > 0) {
    ;(focusableElements[0] as HTMLElement).focus()
  }
}

/**
 * Focuses the last focusable element in a container
 * @param container - The container element
 */
export const focusLastElement = (container: HTMLElement | null) => {
  if (!container) return
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length > 0) {
    ;(focusableElements[focusableElements.length - 1] as HTMLElement).focus()
  }
}

/**
 * Traps focus within a container (for modals)
 * @param container - The container element
 * @param event - The keyboard event
 */
export const trapFocus = (container: HTMLElement | null, event: KeyboardEvent) => {
  if (!container || event.key !== 'Tab') return
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}
