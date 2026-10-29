import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import useActiveSection from '../hooks/useActiveSection'
import { labelFor } from '../i18n/sections'

const SKIP = new Set(['top', 'contact'])
const KEY = 'cta-closed'

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export default function CtaBar({ s, show }) {
  const { lang, t } = useLang()
  const hi = lang === 'hi'
  const prompts = useTable('cta_prompts')
  const { active } = useActiveSection()

  const [closed, setClosed] = useState(read)
  const [ctx, setCtx] = useState(null) // set while the enquiry box is open
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })

  const prompt = prompts.find((p) => p.section === active && p.is_visible !== false && p.message)
  const visible = s.show_cta !== 'false' && !!show && !closed && !!prompt && !SKIP.has(active) && !ctx

  // lets the floating buttons move up on phones while the bar is showing
  useEffect(() => {
    document.body.classList.toggle('has-cta', visible)
    return () => document.body.classList.remove('has-cta')
  }, [visible])

  // enquiry box: lock page scroll, Esc closes
  useEffect(() => {
    if (!ctx) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setCtx(null)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [ctx])

  const dismiss = () => {
    setClosed(true)
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage blocked */
    }
  }

 const openForm = (p) => {
  if (!p) return
  setForm({ name: '', email: '', message: p.prefill || '', website: '' })
  setStatus({ type: '', text: '' })
  setCtx({
    section: p.section,
    label: labelFor(p.section, lang),
    labelEn: labelFor(p.section, 'en'),
  })
}

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // same two steps as the Contact form: saved in "messages" and emailed through Web3Forms
  const submit = async (e) => {
    e.preventDefault()
    if (form.website) return // hidden spam-trap field
    setSending(true)
    setStatus({ type: '', text: '' })

    const body = `[Quick enquiry from the “${ctx.labelEn}” section]\n\n${form.message}`

    const saveToDb = supabase
      .from('messages')
      .insert({ name: form.name, email: form.email, message: body })
      .then(({ error }) => {
        if (error) throw error
      })

    const sendEmail = s.web3forms_key
      ? fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: s.web3forms_key,
            subject: `Quick enquiry (${ctx.labelEn}) from ${form.name}`,
            from_name: 'Portfolio Website',
            name: form.name,
            email: form.email,
            message: body,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (!d.success) throw new Error(d.message || 'Email failed')
          })
      : Promise.reject(new Error('No email key'))

    const results = await Promise.allSettled([saveToDb, sendEmail])
    setSending(false)

    if (results.some((r) => r.status === 'fulfilled')) {
      setStatus({ type: 'ok', text: t('sent_ok') })
      setTimeout(() => {
        setCtx(null)
        dismiss()
      }, 2200)
    } else {
      setStatus({ type: 'err', text: t('sent_err') })
    }
  }

  return (
    <>
      <div className="cta-wrap">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={active}
              className="cta-bar"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35 }}
            >
              <span className="cta-msg">{prompt.message}</span>
              <button type="button" className="cta-go" onClick={openForm}>
                {prompt.button || (hi ? 'पूछताछ' : 'Enquire')}
              </button>
              <button type="button" className="cta-x" onClick={dismiss} aria-label="Close">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {ctx && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCtx(null)}
          >
            <motion.div
              className="enq-card"
              initial={{ scale: 0.94, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="share-x" onClick={() => setCtx(null)} aria-label="Close">✕</button>
              <h3>{hi ? 'तुरंत पूछताछ' : 'Quick enquiry'}</h3>
              <p className="share-sub">{ctx.label}</p>

              <form className="contact-form" onSubmit={submit} style={{ marginTop: 18, textAlign: 'left' }}>
                <div className="row">
                  <input required placeholder={t('ph_name')} value={form.name} onChange={set('name')} />
                  <input required type="email" placeholder={t('ph_email')} value={form.email} onChange={set('email')} />
                </div>
                <textarea required rows="5" placeholder={t('ph_message')} value={form.message} onChange={set('message')} />
                <input className="hp" tabIndex="-1" autoComplete="off" placeholder="Website" value={form.website} onChange={set('website')} />
                <div>
                  <button className="btn" type="submit" disabled={sending}>
                    {sending ? t('sending') : t('send')}
                  </button>
                </div>
                {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}