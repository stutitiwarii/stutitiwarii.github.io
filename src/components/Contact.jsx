import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

export default function Contact({ s }) {
  const { t, lang } = useLang()
  const hi = lang === 'hi'
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.website) return // hidden spam-trap field, real people leave it empty
    setSending(true)
    setStatus({ type: '', text: '' })

    const saveToDb = supabase
      .from('messages')
      .insert({ name: form.name, email: form.email, message: form.message })
      .then(({ error }) => {
        if (error) throw error
      })

    const sendEmail = s.web3forms_key
      ? fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: s.web3forms_key,
            subject: `New message from ${form.name} (portfolio)`,
            from_name: 'Portfolio Website',
            name: form.name,
            email: form.email,
            message: form.message,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (!d.success) throw new Error(d.message || 'Email failed')
          })
      : Promise.reject(new Error('No email key'))

    // success if the message was saved OR emailed
    const results = await Promise.allSettled([saveToDb, sendEmail])
    setSending(false)

    if (results.some((r) => r.status === 'fulfilled')) {
      setForm({ name: '', email: '', message: '', website: '' })
      setStatus({ type: 'ok', text: t('sent_ok') })
    } else {
      setStatus({ type: 'err', text: t('sent_err') })
    }
  }

  const links = [
    s.email && { ic: '✉', label: t('lbl_email'), text: s.email, href: `mailto:${s.email}` },
    s.phone && { ic: '☎', label: t('lbl_phone'), text: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    s.whatsapp && { ic: '💬', label: t('lbl_whatsapp'), text: t('txt_whatsapp'), href: `https://wa.me/${s.whatsapp}` },
    s.instagram && { ic: '📷', label: t('lbl_instagram'), text: t('txt_instagram'), href: s.instagram },
    s.facebook && { ic: 'f', label: hi ? 'फ़ेसबुक' : 'Facebook', text: hi ? 'फ़ेसबुक पर जुड़ें' : 'Connect on Facebook', href: s.facebook },
    s.linkedin && { ic: 'in', label: t('lbl_linkedin'), text: t('txt_linkedin'), href: s.linkedin },
  ].filter(Boolean)

  return (
    <section id="contact" className="section alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{t('contact')}</small>
            <RevealText as="h2" text={s.contact_title} />
          </div>
        </Reveal>

        <div className="contact-grid">
          <Reveal className="contact-info">
            <p>{t('contact_intro')}</p>
            <div className="contact-links">
              {links.map((l) => (
                <a key={l.href} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <span className="ic">{l.ic}</span>
                  <span><small>{l.label}</small><b>{l.text}</b></span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <form className="contact-form" onSubmit={submit}>
              <div className="row">
                <input required placeholder={t('ph_name')} value={form.name} onChange={set('name')} />
                <input required type="email" placeholder={t('ph_email')} value={form.email} onChange={set('email')} />
              </div>
              <textarea required rows="6" placeholder={t('ph_message')} value={form.message} onChange={set('message')} />
              <input className="hp" tabIndex="-1" autoComplete="off" placeholder="Website" value={form.website} onChange={set('website')} />
              <div>
                <button className="btn" type="submit" disabled={sending}>
                  {sending ? t('sending') : t('send')}
                </button>
              </div>
              {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}