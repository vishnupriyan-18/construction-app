export const formatCurrency = (value) => {
  const number = Number(value) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(number)
}

export const statusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-500/15 text-emerald-300'
    case 'Completed':
      return 'bg-sky-500/15 text-sky-300'
    case 'Paused':
      return 'bg-amber-500/15 text-amber-300'
    default:
      return 'bg-violet-500/15 text-violet-300'
  }
}
