// "Good evening, I’m Stuti" by the visitor's local time (null = keep the normal hero title)
export function greetingFor(s, lang, date = new Date()) {
  if (s.greeting_on === 'false') return null
  const name = String(s.greeting_name || '').trim()
  if (!name) return null

  const h = date.getHours()
  if (lang === 'hi') {
    const w = h >= 5 && h < 12 ? 'सुप्रभात' : h >= 12 && h < 17 ? 'नमस्कार' : h >= 17 && h < 21 ? 'शुभ संध्या' : 'नमस्ते'
    return `${w}, मैं ${name} हूँ`
  }
  const w = h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : h >= 17 && h < 21 ? 'Good evening' : 'Hello'
  return `${w}, I’m ${name}`
}