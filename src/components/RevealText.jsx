import { motion, useReducedMotion } from 'framer-motion'

export default function RevealText({ text = '', as: Tag = 'h2', delay = 0, className = '' }) {
  const calm = useReducedMotion()
  const words = String(text).split(' ').filter(Boolean)

  if (calm) return <Tag className={className}>{text}</Tag>

  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="rt-mask" aria-hidden="true">
          <motion.span
            className="rt-word"
            initial={{ y: '115%', rotate: 3 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {w + (i < words.length - 1 ? '\u00A0' : '')}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}