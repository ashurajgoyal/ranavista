/**
 * Policy texts. These are carefully written templates for an India-based B2B platform.
 * Have them reviewed by a lawyer before launch, and update site.js with your
 * registered company name, address and grievance officer.
 */
import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';
import { site } from '../../config/site';

const company = site.legalName;
const Email = ({ to = site.email }) => <a href={`mailto:${to}`}>{to}</a>;

// ─────────────────────────── Privacy Policy ───────────────────────────

export function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This Privacy Policy explains how {company} (“{site.name}”, “we”, “us”) collects, uses, shares and protects personal data when you use our website and
          B2B sourcing platform (the “Platform”). We process personal data in line with India’s Digital Personal Data Protection Act, 2023 and other applicable
          laws. By using the Platform you agree to this policy.
        </p>
      }
      sections={[
        {
          id: 'data-we-collect',
          title: 'Information we collect',
          body: (
            <>
              <p><strong>Information you give us:</strong></p>
              <ul>
                <li>Account details: name, email address, phone number, password (stored only in encrypted, hashed form) and account type (buyer or supplier).</li>
                <li>Business details: company name, GST or tax ID, address, city, country, website, product categories and business description.</li>
                <li>Sourcing information: requests for quotation, specifications, attachments, quotations, chat messages and ratings.</li>
                <li>Messages you send us through the contact form or by email.</li>
              </ul>
              <p><strong>Information collected automatically:</strong> device and browser type, IP address, pages visited, and the date and time of your visits, which we use for security and to keep the Platform working.</p>
              <p><strong>Payment information:</strong> card payments are processed by our payment partner (Stripe). We do not see or store your full card number; we receive only limited details such as the card brand, last four digits and payment status.</p>
            </>
          ),
        },
        {
          id: 'how-we-use',
          title: 'How we use your information',
          body: (
            <ul>
              <li>To create and manage your account and verify your email address.</li>
              <li>To review supplier applications and verify business details.</li>
              <li>To review sourcing requests and match each request with a suitable supplier.</li>
              <li>To enable quotations, chat, orders, payments, invoices and dispute resolution.</li>
              <li>To manage subscriptions and billing.</li>
              <li>To send service emails such as one-time codes, approvals, payment receipts and important updates.</li>
              <li>To respond to your questions and provide support.</li>
              <li>To protect the Platform against fraud, abuse and security threats, and to meet legal obligations.</li>
              <li>To improve our services using aggregated, non-identifying information.</li>
            </ul>
          ),
        },
        {
          id: 'sharing',
          title: 'How we share information',
          body: (
            <>
              <p>We do not sell your personal data. We share it only as needed to run the Platform:</p>
              <ul>
                <li><strong>With your matched party:</strong> when we assign a request, the matched supplier sees the request details and the buyer’s business contact details needed to quote and fulfil the order, and the buyer sees the supplier’s business details.</li>
                <li><strong>With service providers:</strong> hosting, database, email delivery and payment processing companies that act on our instructions.</li>
                <li><strong>For legal reasons:</strong> where required by law, court order or a government authority, or to protect the rights and safety of our users and the Platform.</li>
                <li><strong>Business transfers:</strong> if we are involved in a merger, acquisition or sale of assets, subject to this policy.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'retention',
          title: 'How long we keep data',
          body: (
            <p>
              We keep personal data for as long as your account is active and as needed to provide the services. After you close your account, we keep records
              that we must retain for tax, accounting, dispute or legal reasons for the period required by law, and delete or anonymise the rest.
              One-time verification codes are deleted automatically after they expire.
            </p>
          ),
        },
        {
          id: 'security',
          title: 'Security',
          body: (
            <p>
              We use reasonable technical and organisational measures to protect your data, including encrypted connections (HTTPS), hashed passwords, access
              controls for our staff and audit logs of administrative actions. No system is completely secure, so please use a strong, unique password and keep it private.
            </p>
          ),
        },
        {
          id: 'your-rights',
          title: 'Your rights',
          body: (
            <>
              <p>Subject to applicable law, you can:</p>
              <ul>
                <li>access a summary of the personal data we hold about you;</li>
                <li>correct or update inaccurate or incomplete data (most details can be edited from your profile);</li>
                <li>ask us to erase your data, where we are not required to keep it;</li>
                <li>withdraw consent where processing is based on consent;</li>
                <li>nominate another person to exercise your rights in case of death or incapacity; and</li>
                <li>raise a grievance with us, and, if unresolved, with the Data Protection Board of India.</li>
              </ul>
              <p>To exercise these rights, email <Email />.</p>
            </>
          ),
        },
        {
          id: 'international',
          title: 'International transfers',
          body: (
            <p>
              Because we connect buyers and suppliers in different countries, and because some of our service providers operate globally, your data may be
              processed outside your country. We take steps to ensure it remains protected as described in this policy and as permitted by law.
            </p>
          ),
        },
        {
          id: 'cookies',
          title: 'Cookies and local storage',
          body: (
            <p>
              We use essential browser storage to keep you signed in and remember basic preferences. See our <Link to="/cookie-policy">Cookie Policy</Link> for details.
            </p>
          ),
        },
        {
          id: 'children',
          title: 'Business users only',
          body: <p>The Platform is intended for businesses and people aged 18 or over acting for a business. We do not knowingly collect data from children.</p>,
        },
        {
          id: 'grievance',
          title: 'Grievance Officer',
          body: (
            <>
              <p>If you have a concern about how we handle your data, please contact our Grievance Officer:</p>
              <ul>
                {site.grievanceOfficer.name && <li>Name: {site.grievanceOfficer.name}</li>}
                <li>Email: <Email to={site.grievanceOfficer.email} /></li>
                {site.address && <li>Address: {site.address}</li>}
              </ul>
              <p>We aim to acknowledge grievances within 48 hours and resolve them within 30 days.</p>
            </>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to this policy',
          body: <p>We may update this policy from time to time. We will post the new version here with a new “Last updated” date and, for significant changes, notify you by email or on the Platform.</p>,
        },
      ]}
    />
  );
}

// ─────────────────────────── Terms & Conditions ───────────────────────────

export function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={
        <p>
          These Terms & Conditions (“Terms”) govern your use of the {site.name} website and platform (the “Platform”), operated by {company}. By creating an
          account or using the Platform you agree to these Terms. If you are using the Platform for a company, you confirm you are authorised to accept these
          Terms on its behalf.
        </p>
      }
      sections={[
        {
          id: 'about-platform',
          title: 'About the Platform',
          body: (
            <p>
              {site.name} is a B2B platform that connects buyers of home and lifestyle products with suppliers. Buyers post requests for quotation (“RFQs”); our team
              reviews each request and, at our discretion, assigns it to a supplier we select. Contracts for the sale of goods are made directly between the buyer
              and the supplier. {site.name} is not the seller or manufacturer of any goods unless we expressly say so.
            </p>
          ),
        },
        {
          id: 'eligibility',
          title: 'Eligibility and accounts',
          body: (
            <ul>
              <li>You must be at least 18 and use the Platform for business purposes.</li>
              <li>You must give accurate, complete information and keep it up to date.</li>
              <li>You are responsible for keeping your password secure and for all activity under your account. Tell us immediately at <Email /> if you suspect unauthorised use.</li>
              <li>One person or company may not open multiple accounts to get around plan limits or a suspension.</li>
            </ul>
          ),
        },
        {
          id: 'suppliers',
          title: 'Supplier verification',
          body: (
            <p>
              Supplier accounts are reviewed before they can receive leads. We may request documents and may approve, reject, suspend or remove any supplier at our
              discretion. Verification is a reasonable check of the information provided; it is not a guarantee of a supplier’s performance, product quality or
              legal compliance. Buyers should carry out their own checks where appropriate, such as samples or inspections.
            </p>
          ),
        },
        {
          id: 'matching',
          title: 'Requests, matching and quotations',
          body: (
            <ul>
              <li>Buyers must describe requests honestly and only post genuine sourcing needs.</li>
              <li>We decide whether and to whom a request is assigned. We do not guarantee that every request will be matched or quoted, or any response time.</li>
              <li>Suppliers must only quote on requests they can fulfil and must honour accepted quotations.</li>
              <li>Price, specifications, delivery terms (including Incoterms), inspection and warranties are agreed between buyer and supplier.</li>
              <li>Users must not use the Platform to move a matched deal off-Platform to avoid fees or protections.</li>
            </ul>
          ),
        },
        {
          id: 'payments',
          title: 'Order payments and protection',
          body: (
            <p>
              Where order payments are made through the Platform, the buyer’s payment is held by our payment partner and released to the supplier after the buyer
              confirms delivery, or as decided by us in a dispute review. Buyers must confirm delivery or raise a dispute within the period shown on the order. Our
              decision in a dispute is based on the evidence provided by both parties. Payment processing is subject to our payment partner’s terms.
            </p>
          ),
        },
        {
          id: 'subscriptions',
          title: 'Subscriptions and fees',
          body: (
            <ul>
              <li>Some features require a paid subscription. Prices and plan limits are shown on the <Link to="/pricing">Pricing</Link> page and may change with notice.</li>
              <li>Paid plans renew automatically each billing period until cancelled. You authorise us and our payment partner to charge your payment method.</li>
              <li>Fees are exclusive of applicable taxes (such as GST) unless stated otherwise.</li>
              <li>Cancellations and refunds are covered by our <Link to="/refund-policy">Refund & Cancellation Policy</Link>.</li>
            </ul>
          ),
        },
        {
          id: 'conduct',
          title: 'Prohibited use',
          body: (
            <>
              <p>You must not:</p>
              <ul>
                <li>list, request or trade illegal, counterfeit, stolen or restricted goods, or goods that infringe others’ rights;</li>
                <li>post false, misleading or fraudulent information, quotations or reviews;</li>
                <li>harass, spam or abuse other users or our staff;</li>
                <li>try to access accounts, data or systems without permission, or disrupt the Platform;</li>
                <li>copy, scrape or resell Platform data without our written consent; or</li>
                <li>break any applicable law, including export, import, sanctions and anti-bribery laws.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'content',
          title: 'Your content and our intellectual property',
          body: (
            <p>
              You keep ownership of content you upload, such as specifications and images, and give us a licence to use it to operate the Platform, including
              sharing it with your matched party. The {site.name} name, logo, website design and software belong to us and may not be used without permission.
            </p>
          ),
        },
        {
          id: 'disclaimer',
          title: 'Disclaimers',
          body: (
            <p>
              The Platform is provided “as is” and “as available”. To the extent permitted by law, we do not warrant that it will be uninterrupted or error-free.
              Information such as currency rates, trade-fair dates, Incoterms summaries and container guides is for general guidance only and should be verified
              independently.
            </p>
          ),
        },
        {
          id: 'liability',
          title: 'Limitation of liability',
          body: (
            <p>
              To the extent permitted by law, we are not liable for indirect, incidental or consequential losses, or for loss of profit, revenue or data. We are not
              responsible for the acts, omissions, products or services of buyers or suppliers. Our total liability for any claim relating to the Platform is
              limited to the subscription fees you paid us in the twelve months before the claim.
            </p>
          ),
        },
        {
          id: 'indemnity',
          title: 'Indemnity',
          body: <p>You agree to indemnify {company} against claims, losses and costs arising from your breach of these Terms, your content, or your dealings with other users.</p>,
        },
        {
          id: 'termination',
          title: 'Suspension and termination',
          body: (
            <p>
              You can close your account at any time by contacting us. We may suspend or close accounts that breach these Terms, pose a risk to other users, or are
              required to be closed by law. Sections that by their nature should continue (such as payments due, liability and governing law) survive termination.
            </p>
          ),
        },
        {
          id: 'law',
          title: 'Governing law and disputes',
          body: (
            <p>
              These Terms are governed by the laws of India. Subject to applicable law, the courts at {site.jurisdiction} have exclusive jurisdiction over any
              dispute relating to these Terms or the Platform. We encourage you to contact us first so we can try to resolve any issue informally.
            </p>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to these Terms',
          body: <p>We may update these Terms. We will post the updated version here and, for material changes, notify you. Continued use after changes take effect means you accept them.</p>,
        },
      ]}
    />
  );
}

// ─────────────────────────── Refund & Cancellation ───────────────────────────

export function RefundPolicy() {
  return (
    <LegalPage
      title="Refund & Cancellation"
      intro={
        <p>
          This policy explains how cancellations and refunds work for {site.name} subscriptions and for order payments made through the Platform. It forms part of
          our <Link to="/terms">Terms & Conditions</Link>.
        </p>
      }
      sections={[
        {
          id: 'cancel-subscription',
          title: 'Cancelling a subscription',
          body: (
            <ul>
              <li>You can cancel a paid plan at any time from <strong>Plan & billing</strong> in your account.</li>
              <li>When you cancel, your plan stays active until the end of the current billing period. After that, your account moves to the free plan and you will not be charged again.</li>
              <li>If you change your mind before the period ends, you can choose <strong>Keep my plan</strong> to resume.</li>
            </ul>
          ),
        },
        {
          id: 'subscription-refunds',
          title: 'Subscription refunds',
          body: (
            <>
              <p>Subscription fees are generally non-refundable, including for unused time in a billing period. We will refund subscription charges when:</p>
              <ul>
                <li>you were charged twice for the same period, or charged after a confirmed cancellation;</li>
                <li>a technical fault on our side prevented you from using paid features for a significant part of the period; or</li>
                <li>a refund is required by applicable law.</li>
              </ul>
              <p>When you upgrade or downgrade during a period, the price difference is prorated automatically on your next invoice.</p>
            </>
          ),
        },
        {
          id: 'order-payments',
          title: 'Order payments',
          body: (
            <>
              <p>Order payments made through the Platform are held until the buyer confirms delivery. Refunds of order payments may apply when:</p>
              <ul>
                <li>the supplier cancels the order or fails to ship within the agreed time;</li>
                <li>buyer and supplier agree to cancel the order before shipment; or</li>
                <li>a dispute review finds that the goods were not delivered or were materially different from what was agreed.</li>
              </ul>
              <p>
                Partial refunds may be decided in a dispute where only part of an order is affected. Once a buyer confirms delivery and the payment is released
                to the supplier, any further claim is between the buyer and the supplier.
              </p>
            </>
          ),
        },
        {
          id: 'how-to-request',
          title: 'How to request a refund',
          body: (
            <p>
              Email <Email to={site.supportEmail} /> from your registered email address with your account email, the invoice or order number, and the reason
              for the request. We acknowledge requests within two business days.
            </p>
          ),
        },
        {
          id: 'timelines',
          title: 'Refund timelines',
          body: (
            <p>
              Approved refunds are issued to the original payment method. Once processed by us, they usually appear within 5–10 business days, depending on your
              bank or card issuer. Payment-processing fees charged by third parties may not be refundable where the law allows.
            </p>
          ),
        },
      ]}
    />
  );
}

// ─────────────────────────── Cookie Policy ───────────────────────────

export function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro={
        <p>
          This policy explains how {site.name} uses cookies and similar technologies such as your browser’s local storage. We keep this to a minimum and use them
          only to run the Platform.
        </p>
      }
      sections={[
        {
          id: 'what',
          title: 'What are cookies and local storage?',
          body: (
            <p>
              Cookies are small text files that a website stores on your device. Local storage is a similar browser feature that lets a website remember
              information between visits. Both help a site keep you signed in and remember your choices.
            </p>
          ),
        },
        {
          id: 'what-we-use',
          title: 'What we use',
          body: (
            <ul>
              <li><strong>Sign-in token (essential):</strong> stored in your browser’s local storage after you log in, so you stay signed in. It is removed when you log out.</li>
              <li><strong>Temporary session data (essential):</strong> short-lived data in session storage, for example to remember the plan you picked during sign-up.</li>
              <li><strong>Payment pages (essential):</strong> when you pay, our payment partner Stripe may set its own cookies for security and fraud prevention on its checkout pages.</li>
              <li><strong>Fonts:</strong> our typefaces are loaded from Google Fonts, which receives your IP address to deliver them.</li>
            </ul>
            ),
        },
        {
          id: 'no-tracking',
          title: 'Analytics and advertising',
          body: (
            <p>
              We do not currently use advertising or cross-site tracking cookies. If we add analytics or marketing tools in future, we will update this policy and,
              where required, ask for your consent first.
            </p>
          ),
        },
        {
          id: 'control',
          title: 'Your choices',
          body: (
            <p>
              You can clear or block cookies and local storage in your browser settings. If you block essential storage, you will not be able to stay signed in
              or use account features.
            </p>
          ),
        },
        {
          id: 'more',
          title: 'More information',
          body: (
            <p>
              For how we handle personal data in general, see our <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
