/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a date string nicely
 */
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Truncate text to a given length
 */
export const truncate = (text, length = 100) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

/**
 * Calculate discount percentage
 */
export const discountPercent = (original, sale) => {
  if (!original || !sale) return 0
  return Math.round(((original - sale) / original) * 100)
}

/**
 * Generate star rating array
 */
export const getStars = (rating, max = 5) => {
  const stars = []
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(rating)) stars.push('full')
    else if (i - 0.5 <= rating) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Get order status badge color
 */
export const getStatusColor = (status) => {
  const map = {
    pending: 'orange',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray',
  }
  return map[status?.toLowerCase()] || 'gray'
}

/**
 * Clamp a number between min and max
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/**
 * Generate a random color gradient index (1-6) for categories
 */
export const categoryGradient = (index) => `category-gradient-${(index % 6) + 1}`
