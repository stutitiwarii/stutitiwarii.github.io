// names of the sections (used by the chapter dots and the enquiry bar)
export const SECTION_LABELS = {
  top: { en: 'Home', hi: 'होम' },
  about: { en: 'About', hi: 'परिचय' },
  toolkit: { en: 'Skills', hi: 'कौशल' },
  resume: { en: 'Resume', hi: 'रिज़्यूमे' },
  portfolio: { en: 'Work', hi: 'काम' },
  campaigns: { en: 'Campaigns', hi: 'अभियान' },
  gallery: { en: 'Gallery', hi: 'गैलरी' },
  awards: { en: 'Awards', hi: 'सम्मान' },
  social: { en: 'Social', hi: 'सोशल' },
  reels: { en: 'Reels', hi: 'रील्स' },
  blogs: { en: 'Blogs', hi: 'ब्लॉग' },
  writing: { en: 'Writing', hi: 'लेखन' },
  services: { en: 'Services', hi: 'सेवाएँ' },
  brands: { en: 'Brands', hi: 'ब्रांड्स' },
  testimonials: { en: 'Reviews', hi: 'राय' },
  contact: { en: 'Contact', hi: 'संपर्क' },
}

export const labelFor = (id, lang) => SECTION_LABELS[id]?.[lang] || SECTION_LABELS[id]?.en || id