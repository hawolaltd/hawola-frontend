import Link from "next/link";
import LegalPageShell from "@/components/legal/LegalPageShell";

const EFFECTIVE_DATE = "25 June 2026";

export default function TermsOfUsePage() {
  return (
    <LegalPageShell
      title="Hawola Terms of Use"
      effectiveDate={EFFECTIVE_DATE}
      description="Terms and conditions for using the Hawola marketplace as a shopper or account holder."
    >
      <p className="rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-4 py-3 text-sm not-prose mb-8">
        These Terms govern your use of Hawola as a <strong>shopper or account holder</strong> on
        hawola.com and the Hawola mobile app. Merchants have separate terms on the Hawola Merchant
        platform.
      </p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          These Terms of Use (&quot;Terms&quot;) are a binding agreement between you and Hawola
          (&quot;Hawola,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or
          using Hawola—including browsing, creating an account, placing orders, posting buying
          requests, or chatting with merchants—you agree to these Terms and our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>If you do not agree, please do not use Hawola.</p>
      </section>

      <section>
        <h2>2. About Hawola</h2>
        <p>
          Hawola is a multi-vendor marketplace that connects buyers with independent merchants.
          Unless we clearly state otherwise for a specific transaction, Hawola facilitates
          discovery, ordering, and communication but individual merchants are responsible for
          their products, pricing, fulfilment, and customer service.
        </p>
        <p>
          Hawola may offer categories including general merchandise, cars, real estate listings,
          and other product types. Availability of features may vary by merchant, category, or
          region.
        </p>
      </section>

      <section>
        <h2>3. Eligibility and accounts</h2>
        <ul>
          <li>You must be at least 18 years old and able to enter a binding contract.</li>
          <li>You must provide accurate registration information and keep it up to date.</li>
          <li>You are responsible for all activity under your account and for safeguarding your login credentials.</li>
          <li>You must not create accounts for fraudulent purposes or impersonate another person.</li>
        </ul>
      </section>

      <section>
        <h2>4. Shopping, orders, and payments</h2>
        <ul>
          <li>
            Product descriptions, images, prices, and availability are provided by merchants.
            Hawola does not guarantee that all listings are accurate or that items will always be
            in stock.
          </li>
          <li>
            When you place an order, you make an offer to purchase from the relevant merchant
            subject to their policies and applicable Hawola checkout rules.
          </li>
          <li>
            Where Hawola or its payment partners process payment, you authorise us to charge your
            selected payment method for the order total, including applicable fees, taxes, and
            shipping.
          </li>
          <li>
            Where a merchant collects payment directly, your transaction is primarily with that
            merchant. Hawola&apos;s role may be limited to discovery and communication.
          </li>
          <li>
            Delivery times, shipping costs, and pickup options depend on the merchant and the
            options shown at checkout.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Buying requests</h2>
        <p>
          You may post buying requests describing products you are looking for. You agree that:
        </p>
        <ul>
          <li>Your posts are truthful and not misleading, offensive, or unlawful.</li>
          <li>You will not post prohibited items or content.</li>
          <li>
            Contact details you share with merchants or other users are shared at your own
            discretion. Exercise caution when communicating outside Hawola.
          </li>
          <li>Hawola may remove buying requests that violate these Terms or our policies.</li>
        </ul>
      </section>

      <section>
        <h2>6. User-generated content and in-app communications</h2>
        <p>
          Hawola includes features that allow users to create and exchange content within the
          app and website, including:
        </p>
        <ul>
          <li>Direct messages and chat between buyers and merchants</li>
          <li>Buying requests (text descriptions, categories, budgets, and photos you upload)</li>
          <li>Product reviews, ratings, and related comments where available</li>
          <li>Dispute messages and customer-support communications</li>
          <li>Profile information and other content you choose to submit</li>
        </ul>
        <p>
          Content you submit through these features is &quot;User Content.&quot; You retain ownership of
          your User Content, but you grant Hawola a worldwide, non-exclusive, royalty-free licence
          to host, store, reproduce, display, and use it as needed to operate, secure, and improve
          the platform (including resolving disputes and enforcing these Terms).
        </p>

        <h3>6.1 Your responsibilities</h3>
        <p>You are solely responsible for User Content you submit. You agree that your User Content will not:</p>
        <ul>
          <li>Be false, misleading, defamatory, harassing, hateful, or threatening</li>
          <li>Include unlawful, fraudulent, or deceptive material</li>
          <li>Infringe any third party&apos;s intellectual property, privacy, or other rights</li>
          <li>Contain sexually explicit material, nudity intended to arouse, or exploitation of minors</li>
          <li>Promote violence, self-harm, illegal drugs, weapons, or prohibited goods</li>
          <li>Include spam, malware, phishing, or unsolicited commercial messages</li>
          <li>Share another person&apos;s personal information without lawful authority or consent</li>
        </ul>

        <h3>6.2 Communications between users and merchants</h3>
        <p>
          Chat and messaging on Hawola are intended for marketplace-related communication (for
          example, product enquiries, orders, and buying requests). Messages may be visible to the
          participants in a conversation and stored on Hawola systems for delivery, support, fraud
          prevention, and dispute resolution.
        </p>
        <p>
          Hawola does not routinely monitor all private messages, but we may review, retain, or
          disclose communications where required by law, to enforce these Terms, to respond to
          reports, or to protect users and the platform.
        </p>

        <h3>6.3 Buying requests and public content</h3>
        <p>
          Buying requests and similar posts may be visible to merchants and other users depending
          on product settings. Do not include sensitive personal data in public posts unless you
          are comfortable sharing it for that purpose.
        </p>

        <h3>6.4 Moderation and enforcement</h3>
        <p>
          Hawola may, but is not obligated to, monitor, edit, remove, or restrict access to User
          Content at any time if we believe it violates these Terms, applicable law, or our
          community standards, or if it poses risk to users or the platform.
        </p>
        <p>
          We may suspend or terminate accounts involved in repeated or serious violations. See
          Section 12 (Account suspension and termination).
        </p>

        <h3>6.5 Reporting abusive or illegal content</h3>
        <p>
          If you believe User Content or another user&apos;s behaviour violates these Terms or is
          unlawful, please report it to{" "}
          <a href="mailto:ask@hawola.com">ask@hawola.com</a> with relevant details (such as
          screenshots, usernames, order or chat references, and a description of the issue). We
          will review reports and take appropriate action where warranted.
        </p>

        <h3>6.6 Copyright and intellectual property complaints</h3>
        <p>
          If you believe content on Hawola infringes your copyright or other intellectual property
          rights, contact us at{" "}
          <a href="mailto:ask@hawola.com">ask@hawola.com</a> with identification of the work,
          the location of the infringing material, and your contact information. We may remove or
          disable access to content that we reasonably believe infringes third-party rights.
        </p>
      </section>

      <section>
        <h2>7. Returns, refunds, and disputes</h2>
        <ul>
          <li>Return and refund eligibility depends on the merchant&apos;s policy and applicable law.</li>
          <li>
            Hawola provides tools to raise disputes and communicate with merchants. Where Hawola
            processed payment or facilitated fulfilment, we may assist in resolution according to
            our buyer protection and dispute policies.
          </li>
          <li>
            Where payment or fulfilment occurred directly between you and a merchant outside
            Hawola&apos;s payment flow, disputes are primarily between you and the merchant.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Prohibited conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use Hawola for fraud, money laundering, or illegal activity</li>
          <li>Attempt to gain unauthorised access to accounts, systems, or data</li>
          <li>Scrape, reverse engineer, or disrupt the platform without permission</li>
          <li>Harass merchants, other users, or Hawola staff</li>
          <li>Circumvent fees, policies, or security measures</li>
          <li>List or solicit prohibited goods or services through Hawola features</li>
        </ul>
      </section>

      <section>
        <h2>9. Intellectual property</h2>
        <p>
          Hawola&apos;s name, logo, software, and platform design are owned by Hawola or its
          licensors. You may not copy, modify, or use our branding without written permission.
          Merchant trademarks and product content remain the property of their respective owners.
        </p>
      </section>

      <section>
        <h2>10. Disclaimers</h2>
        <p>
          Hawola is provided on an &quot;as is&quot; and &quot;as available&quot; basis to the
          extent permitted by law. We do not warrant uninterrupted or error-free service. We are
          not the manufacturer or seller of merchant products unless explicitly stated.
        </p>
        <p>
          To the fullest extent permitted by law, Hawola is not liable for merchant conduct,
          product quality, delivery delays, or losses arising from transactions handled directly
          between you and merchants.
        </p>
      </section>

      <section>
        <h2>11. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Hawola and its affiliates will not
          be liable for indirect, incidental, special, consequential, or punitive damages, or for
          loss of profits, data, or goodwill arising from your use of the platform.
        </p>
        <p>
          Where liability cannot be excluded, our total liability for any claim relating to your
          use of Hawola will not exceed the amount you paid to Hawola for the specific order
          giving rise to the claim in the twelve (12) months before the claim, or one hundred
          Nigerian Naira (NGN 100) if no such payment was made—whichever is greater, unless a
          higher minimum is required by law.
        </p>
      </section>

      <section>
        <h2>12. Account suspension and termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms, applicable law, or
          our policies, or if we reasonably believe your activity poses risk to Hawola, merchants,
          or other users. You may close your account at any time by contacting support.
        </p>
      </section>

      <section>
        <h2>13. Privacy</h2>
        <p>
          Our collection and use of personal data is described in our{" "}
          <Link href="/privacy">Privacy Policy</Link>, which forms part of these Terms.
        </p>
      </section>

      <section>
        <h2>14. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be posted on this
          page with an updated effective date. Continued use of Hawola after changes take effect
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>15. Governing law</h2>
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria, without regard
          to conflict-of-law principles. Disputes will be subject to the exclusive jurisdiction of
          the courts of Nigeria, unless mandatory consumer protection laws in your location provide
          otherwise.
        </p>
      </section>

      <section>
        <h2>16. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:ask@hawola.com">ask@hawola.com</a> or through Hawola customer support.
        </p>
      </section>

      <p className="text-sm text-gray-500 border-t border-gray-200 pt-6 mt-8 not-prose">
        See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPageShell>
  );
}
