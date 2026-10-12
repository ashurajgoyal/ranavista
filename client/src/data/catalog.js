/**
 * Website content: product categories, sourcing countries, trade fairs.
 * Edit freely — pages, menus and search all read from here.
 */
import {
  Armchair,
  BedDouble,
  Flower2,
  Gem,
  Gift,
  Lamp,
  Leaf,
  Palette,
  Shirt,
  UtensilsCrossed,
} from 'lucide-react';

export const categories = [
  {
    slug: 'home-textiles',
    name: 'Home Textiles',
    icon: BedDouble,
    summary: 'Bed linen, cushions, throws, curtains and table linen in cotton, linen, jute and blends.',
    items: ['Bed sheets & duvet covers', 'Cushion covers & throws', 'Curtains & drapes', 'Table linen & kitchen towels', 'Bath towels & bathrobes'],
    hubs: ['India', 'Turkey', 'Bangladesh'],
  },
  {
    slug: 'furniture',
    name: 'Furniture',
    icon: Armchair,
    summary: 'Solid-wood, metal, cane and upholstered furniture for homes, hotels and retail.',
    items: ['Solid-wood dining & living', 'Metal & industrial furniture', 'Cane, rattan & wicker', 'Upholstered seating', 'Outdoor furniture'],
    hubs: ['India', 'Vietnam', 'Indonesia'],
  },
  {
    slug: 'home-decor',
    name: 'Home Décor',
    icon: Flower2,
    summary: 'Vases, mirrors, wall art, candle holders and decorative accents across styles.',
    items: ['Vases & planters', 'Mirrors & wall décor', 'Candles & holders', 'Photo frames', 'Seasonal & festive décor'],
    hubs: ['India', 'China', 'Vietnam'],
  },
  {
    slug: 'kitchen-dining',
    name: 'Kitchen & Dining',
    icon: UtensilsCrossed,
    summary: 'Serveware, tableware, wooden boards and metal kitchen accessories.',
    items: ['Serveware & platters', 'Ceramic & stoneware tableware', 'Wooden boards & utensils', 'Copper & brass ware', 'Glassware & barware'],
    hubs: ['India', 'Vietnam', 'China'],
  },
  {
    slug: 'lighting',
    name: 'Lighting',
    icon: Lamp,
    summary: 'Table and floor lamps, pendants, lanterns and decorative lighting.',
    items: ['Table & floor lamps', 'Pendants & chandeliers', 'Lanterns & candle lights', 'Lampshades', 'Outdoor & solar lighting'],
    hubs: ['India', 'China', 'Turkey'],
  },
  {
    slug: 'rugs-carpets',
    name: 'Rugs & Carpets',
    icon: Palette,
    summary: 'Hand-knotted, hand-tufted, flat-woven and machine-made rugs in natural fibres.',
    items: ['Hand-knotted rugs', 'Hand-tufted rugs', 'Flat-weave & kilims', 'Jute & natural-fibre rugs', 'Runners & doormats'],
    hubs: ['India', 'Turkey', 'Bangladesh'],
  },
  {
    slug: 'handicrafts',
    name: 'Handicrafts',
    icon: Gift,
    summary: 'Artisan-made wood, metal, stone and paper crafts with a story behind them.',
    items: ['Wood carving', 'Metal & brass craft', 'Marble & stone craft', 'Papier-mâché & paper craft', 'Gift & corporate sets'],
    hubs: ['India', 'Indonesia', 'Vietnam'],
  },
  {
    slug: 'fashion-accessories',
    name: 'Fashion & Accessories',
    icon: Shirt,
    summary: 'Bags, scarves, stoles and lifestyle accessories from export-ready makers.',
    items: ['Bags & totes', 'Scarves & stoles', 'Leather goods', 'Footwear', 'Travel accessories'],
    hubs: ['India', 'Bangladesh', 'Vietnam'],
  },
  {
    slug: 'jewellery',
    name: 'Jewellery',
    icon: Gem,
    summary: 'Fashion, silver and fine jewellery, including traditional and contemporary designs.',
    items: ['Fashion & costume jewellery', 'Sterling silver', 'Gold & fine jewellery', 'Bridal & traditional sets', 'Packaging & displays'],
    hubs: ['India', 'Thailand', 'Turkey'],
  },
  {
    slug: 'garden-outdoor',
    name: 'Garden & Outdoor',
    icon: Leaf,
    summary: 'Planters, garden décor, outdoor textiles and sustainable natural-material products.',
    items: ['Planters & pots', 'Garden décor', 'Outdoor cushions & textiles', 'Bird feeders & houses', 'Eco & natural-fibre products'],
    hubs: ['India', 'Vietnam', 'Indonesia'],
  },
];

export const countries = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    headline: 'Handcraft heritage at export scale',
    text: 'One of the world’s deepest supply bases for handmade home and lifestyle goods, with established export clusters for textiles, rugs, furniture, metalware and handicrafts.',
    strengths: ['Home Textiles', 'Rugs & Carpets', 'Handicrafts', 'Furniture', 'Jewellery'],
    hubs: [
      ['Jaipur', 'Textiles, block print, jewellery, handicrafts'],
      ['Moradabad', 'Brass and metalware'],
      ['Panipat & Karur', 'Home textiles'],
      ['Jodhpur', 'Solid-wood and iron furniture'],
      ['Bhadohi', 'Hand-knotted and tufted rugs'],
      ['Saharanpur', 'Wood carving'],
    ],
    fairs: ['IHGF Delhi Fair', 'India Home Furnishings & Textiles events'],
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    headline: 'Furniture and ceramics powerhouse',
    text: 'A major exporter of wooden and outdoor furniture, with strong ceramics, lacquerware and natural-fibre craft traditions.',
    strengths: ['Furniture', 'Kitchen & Dining', 'Home Décor', 'Garden & Outdoor'],
    hubs: [
      ['Binh Duong & Dong Nai', 'Wooden and outdoor furniture'],
      ['Bat Trang (Hanoi)', 'Ceramics and pottery'],
      ['Ho Chi Minh City', 'Furniture, home décor'],
    ],
    fairs: ['VIFA-EXPO (Ho Chi Minh City)'],
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    headline: 'Teak, rattan and island craft',
    text: 'Known for teak and reclaimed-wood furniture, rattan and natural-fibre products, and Balinese handicrafts.',
    strengths: ['Furniture', 'Handicrafts', 'Garden & Outdoor'],
    hubs: [
      ['Jepara', 'Teak furniture and carving'],
      ['Cirebon', 'Rattan and wicker'],
      ['Bali', 'Handicrafts and décor'],
    ],
    fairs: ['IFEX (Jakarta)'],
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    headline: 'Textiles and design at the crossroads',
    text: 'Strong in towels, bath and home textiles, rugs and design-led décor, with fast shipping into Europe.',
    strengths: ['Home Textiles', 'Rugs & Carpets', 'Lighting', 'Jewellery'],
    hubs: [
      ['Denizli', 'Towels and bath textiles'],
      ['Bursa', 'Home textiles'],
      ['Gaziantep', 'Machine-made rugs'],
      ['Istanbul', 'Design, lighting, jewellery'],
    ],
    fairs: ['EVTEKS (Istanbul)'],
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    headline: 'Jute and textile specialists',
    text: 'A leading source of jute and natural-fibre products and a large textile manufacturing base.',
    strengths: ['Home Textiles', 'Rugs & Carpets', 'Fashion & Accessories'],
    hubs: [
      ['Dhaka', 'Textiles and jute goods'],
      ['Narayanganj', 'Jute products'],
    ],
    fairs: ['Dhaka International Trade Fair'],
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    headline: 'Breadth, speed and scale',
    text: 'Unmatched breadth across décor, lighting, tableware and seasonal products, with mature logistics.',
    strengths: ['Home Décor', 'Lighting', 'Kitchen & Dining'],
    hubs: [
      ['Foshan', 'Furniture and lighting'],
      ['Yiwu', 'Small commodities and seasonal décor'],
      ['Jingdezhen', 'Porcelain and ceramics'],
    ],
    fairs: ['Canton Fair (Guangzhou)'],
  },
];

/**
 * Trade fairs. Give exact dates (start/end, YYYY-MM-DD) when confirmed —
 * the page then shows Upcoming / Happening now / Ended automatically.
 * Otherwise use `typically` for the usual month.
 */
export const tradeFairs = [
  {
    name: 'IHGF Delhi Fair (Autumn)',
    city: 'Greater Noida',
    country: 'India',
    flag: '🇮🇳',
    venue: 'India Expo Centre & Mart',
    start: '2026-10-14',
    end: '2026-10-18',
    focus: ['Home', 'Lifestyle', 'Textiles', 'Furniture'],
    url: 'https://www.ihgfdelhifair.in',
  },
  {
    name: 'Heimtextil',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    venue: 'Messe Frankfurt',
    typically: 'January',
    focus: ['Home Textiles', 'Interior textiles'],
    url: 'https://heimtextil.messefrankfurt.com',
  },
  {
    name: 'Maison&Objet',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    venue: 'Paris Nord Villepinte',
    typically: 'January and September',
    focus: ['Home Décor', 'Design', 'Lifestyle'],
    url: 'https://www.maison-objet.com',
  },
  {
    name: 'Ambiente',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    venue: 'Messe Frankfurt',
    typically: 'February',
    focus: ['Dining', 'Living', 'Giving'],
    url: 'https://ambiente.messefrankfurt.com',
  },
  {
    name: 'VIFA-EXPO',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    flag: '🇻🇳',
    venue: 'SECC',
    typically: 'March',
    focus: ['Furniture', 'Home Décor', 'Handicrafts'],
    url: 'https://vifaexpo.com.vn',
  },
  {
    name: 'IFEX',
    city: 'Jakarta',
    country: 'Indonesia',
    flag: '🇮🇩',
    venue: 'JIExpo Kemayoran',
    typically: 'March',
    focus: ['Furniture', 'Handicrafts'],
    url: 'https://ifexindonesia.com',
  },
  {
    name: 'Canton Fair',
    city: 'Guangzhou',
    country: 'China',
    flag: '🇨🇳',
    venue: 'China Import and Export Fair Complex',
    typically: 'April–May and October–November',
    focus: ['Home Décor', 'Lighting', 'Kitchen & Dining', 'Textiles'],
    url: 'https://www.cantonfair.org.cn',
  },
  {
    name: 'EVTEKS',
    city: 'Istanbul',
    country: 'Turkey',
    flag: '🇹🇷',
    venue: 'Istanbul Expo Center',
    typically: 'May (biennial)',
    focus: ['Home Textiles'],
    url: 'https://evteks.com',
  },
];

/** Returns 'upcoming' | 'live' | 'past' | null for fairs with exact dates. */
export function fairStatus(fair, today = new Date()) {
  if (!fair.start) return null;
  const d = today.toISOString().slice(0, 10);
  if (d < fair.start) return 'upcoming';
  if (d > (fair.end || fair.start)) return 'past';
  return 'live';
}

export function fairDates(fair) {
  if (!fair.start) return `Typically ${fair.typically}`;
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const s = new Date(`${fair.start}T00:00:00`);
  const e = new Date(`${fair.end || fair.start}T00:00:00`);
  if (fair.start === fair.end || !fair.end) return s.toLocaleDateString('en-GB', opts);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  return sameMonth
    ? `${s.getDate()} – ${e.toLocaleDateString('en-GB', opts)}`
    : `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', opts)}`;
}
