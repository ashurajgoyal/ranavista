import { site } from '../config/site';

export const faqGroups = [
  {
    id: 'general',
    title: 'About Ranavista',
    items: [
      [
        `What is ${site.name}?`,
        `${site.name} is a curated B2B sourcing platform for home and lifestyle products. Buyers post a sourcing request (RFQ), our team reviews it, and we hand it to one verified supplier who is the best fit. You get a focused quotation instead of dozens of cold calls.`,
      ],
      [
        'Why only one supplier per request?',
        'Sending every request to every supplier creates price wars, spam and low-quality quotes. By matching each request with a single, carefully chosen supplier, buyers get serious attention and suppliers get leads worth their time. If the first match doesn’t work out, our team can re-assign the request.',
      ],
      [
        'Which products do you cover?',
        'Home textiles, furniture, home décor, kitchen & dining, lighting, rugs, handicrafts, fashion accessories, jewellery and garden products. See the Products page for the full list.',
      ],
      [
        'Which countries do suppliers come from?',
        'Our supplier network is built around major sourcing countries for home and lifestyle goods, led by India and including Vietnam, Indonesia, Turkey, Bangladesh and China.',
      ],
    ],
  },
  {
    id: 'buyers',
    title: 'For buyers',
    items: [
      ['Is it free to join as a buyer?', 'Yes. The Basic plan is free and lets you post a limited number of requests every month. Paid plans add more requests, team members and priority matching.'],
      [
        'What should I include in a sourcing request?',
        'The product, quantity, target price or budget, required delivery date and destination, plus any specifications, materials, certifications or reference images. The clearer the request, the faster and more accurate the quote.',
      ],
      ['How quickly will I get a quote?', 'Every request is reviewed by our team first. Timelines depend on the product and how complete the request is; you’ll see the status of each request in your dashboard.'],
      ['Can I talk to the supplier directly?', 'Yes. Once a supplier is assigned and sends a quotation, you can discuss details with them in the in-platform chat.'],
    ],
  },
  {
    id: 'sellers',
    title: 'For suppliers',
    items: [
      ['How do I become a supplier?', 'Create a seller account with your company details and the categories you supply. Our team reviews every application before you can receive leads, and we’ll email you once you’re approved.'],
      ['What do you check before approving a supplier?', 'Business registration details (such as GST or tax ID), the categories and capacity you list, and your contact information. We may ask for additional documents.'],
      ['How many leads will I receive?', 'Leads depend on demand in your categories and your plan’s monthly lead allowance. Paid plans get higher allowances and higher priority in matching.'],
      ['Do I compete with other suppliers on the same lead?', 'No. Each lead is sent to one supplier at a time, so you are not bidding against others for that request.'],
    ],
  },
  {
    id: 'payments',
    title: 'Payments & subscriptions',
    items: [
      ['How do subscription payments work?', 'Paid plans are billed monthly or yearly by card through our payment partner. You can upgrade, downgrade or cancel from Plan & billing at any time.'],
      ['What happens when I cancel?', 'Your paid plan stays active until the end of the current billing period, then your account moves to the free plan. You won’t be charged again.'],
      ['How are order payments protected?', 'Order payments are held securely and released to the supplier only after the buyer confirms delivery, or as decided in a dispute review. This protects both sides.'],
      ['Do you offer refunds?', 'Please see our Refund & Cancellation Policy for details on subscriptions and order payments.'],
    ],
  },
];
