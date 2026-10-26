export default function Footer({ s }) {
  const social = [
    ['Instagram', s.instagram],
    ['LinkedIn', s.linkedin],
    ['WhatsApp', s.whatsapp && `https://wa.me/${s.whatsapp}`],
  ].filter(([, url]) => url)

  return (
    <footer className="footer">
      <a href="#top" className="brand">{s.brand_name}<span>.</span></a>
      <div className="footer-social">
        {social.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
        ))}
      </div>
      <p>{s.footer_text}</p>
    </footer>
  )
}