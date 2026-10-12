/**
 * ─────────────────────────────────────────────────────────────
 *  COMPANY DETAILS — edit this file to update the whole website.
 *  Empty values are hidden automatically (e.g. no phone = no phone shown).
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  name: 'Ranavista',
  legalName: 'Ranavista', // e.g. "Ranavista Global Sourcing Pvt. Ltd." — used in policies
  tagline: 'Sourcing Today for a Brighter Tomorrow',
  pillars: ['Global Sourcing', 'Trusted Partnerships', 'Timeless Value'],
  promise: 'Connecting the World to Exceptional Home & Lifestyle Products',
  footerLine: 'Building Sustainable Partnerships Worldwide.',

  // Contact (TODO: replace with real details before launch)
  email: 'info@ranavista.com',
  supportEmail: 'support@ranavista.com',
  phone: '', // e.g. '+91 98xxx xxxxx'
  whatsapp: '', // digits only with country code, e.g. '9198xxxxxxxx'
  address: '', // full office address
  city: 'India',
  hours: 'Monday – Saturday, 10:00 AM – 6:30 PM IST',

  // Policies
  grievanceOfficer: { name: '', email: 'grievance@ranavista.com' }, // required under Indian IT Rules
  jurisdiction: 'New Delhi, India', // courts named in Terms & Conditions
  policiesUpdated: '12 October 2026',

  // Social links — leave '' to hide an icon
  social: {
    linkedin: '',
    facebook: '',
    instagram: '',
    youtube: '',
  },
};

export const mailto = (email) => `mailto:${email}`;
export const telLink = (phone) => `tel:${phone.replace(/[^+\d]/g, '')}`;
