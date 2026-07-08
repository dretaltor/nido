// Utilidad simple de exportación a CSV para dashboards de asesor y propietario.
// No depende de librerías externas: arma el CSV en el cliente y dispara la descarga.

export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return

  const headerSet = new Set<string>()
  rows.forEach(row => Object.keys(row).forEach(k => headerSet.add(k)))
  const headers = Array.from(headerSet)

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return ''
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escapeCell(row[h])).join(',')),
  ]

  // BOM para que Excel reconozca UTF-8 (tildes, ñ) correctamente.
  const csvContent = '﻿' + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
