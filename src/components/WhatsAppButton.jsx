import { motion } from 'framer-motion'

export default function WhatsAppButton({ s }) {
  if (!s.whatsapp) return null

  const text = encodeURIComponent(s.whatsapp_message || '')
  const href = `https://wa.me/${s.whatsapp}${text ? `?text=${text}` : ''}`

  return (
    <motion.a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 3, type: 'spring', stiffness: 200, damping: 14 }}
    >
      <span className="wa-tip">Chat with me</span>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
      </svg>
    </motion.a>
  )
}