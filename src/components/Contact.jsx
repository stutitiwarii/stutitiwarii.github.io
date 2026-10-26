import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Reveal from './Reveal'

export default function Contact({ s }) {
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
      setStatus({ type: 'ok', text: 'Thank you! Your message has been sent.' })
    } else {
      setStatus({ type: 'err', text: 'Something went wrong. Please try again or email directly.' })
    }
  }

  const links = [
    s.email && { ic: '✉', label: 'Email', text: s.email, href: `mailto:${s.email}` },
    s.phone && { ic: '☎', label: 'Phone', text: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    s.whatsapp && { ic: '💬', label: 'WhatsApp', text: 'Chat with me', href: `https://wa.me/${s.whatsapp}` },
    s.instagram && { ic: '📷', label: 'Instagram', text: 'Follow along', href: s.instagram },
    s.linkedin && { ic: 'in', label: 'LinkedIn', text: 'Connect with me', href: s.linkedin },
  ].filter(Boolean)

  return (
    <section id="contact" className="section alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>Contact</small>
            <h2>{s.contact_title}</h2>
          </div>
        </Reveal>

        <div className="contact-grid">
          <Reveal className="contact-info">
            <p>Have a project in mind or just want to say hello? Send a message and I'll get back to you soon.</p>
            <div className="contact-links">
              {links.map((l) => (
                <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <span className="ic">{l.ic}</span>
                  <span><small>{l.label}</small><b>{l.text}</b></span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <form className="contact-form" onSubmit={submit}>
              <div className="row">
                <input required placeholder="Your name" value={form.name} onChange={set('name')} />
                <input required type="email" placeholder="Your email" value={form.email} onChange={set('email')} />
              </div>
              <textarea required rows="6" placeholder="Tell me about your project..." value={form.message} onChange={set('message')} />
              <input className="hp" tabIndex="-1" autoComplete="off" placeholder="Website" value={form.website} onChange={set('website')} />
              <div>
                <button className="btn" type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
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