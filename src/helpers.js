module.exports = {
  formatValue: formatValue
}

function formatValue(value) {
  const padding = '      '

  if (['boolean', 'number', 'string'].indexOf(typeof value) > -1) {
    return padding + value
  }
  
  return JSON.stringify(value, null, 2)
    .split('\n')
    .map(line => padding + line)
    .join('\n')
}