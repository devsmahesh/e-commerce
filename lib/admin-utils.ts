/**
 * Utility functions for admin operations
 */

/**
 * Download a blob file (for exports)
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Format date range for reports
 */
export const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate && !endDate) return 'All time'
  if (startDate && endDate) {
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
  }
  if (startDate) {
    return `From ${new Date(startDate).toLocaleDateString()}`
  }
  return `Until ${new Date(endDate!).toLocaleDateString()}`
}

/**
 * Get export filename with timestamp
 */
export const getExportFilename = (type: 'orders' | 'products', format: 'csv' | 'excel' = 'csv'): string => {
  const timestamp = new Date().toISOString().split('T')[0]
  const extension = format === 'csv' ? 'csv' : 'xlsx'
  return `${type}-export-${timestamp}.${extension}`
}

