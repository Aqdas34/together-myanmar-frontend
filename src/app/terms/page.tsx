import Link from "next/link";

export const metadata = {
  title: "Terms of Service – Together Myanmar",
  description: "Terms of Service for Together Myanmar. Read the rules and guidelines governing your use of our platform.",
};

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <p className="text-sm text-gray-600">
        By accessing or using the Together Myanmar website and platform at{" "}
        <span className="font-medium text-gray-800">www.togethermyanmar.org</span> ("the Platform"), you agree to be
        bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.
        We reserve the right to update these Terms at any time, with changes effective upon posting.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>To use the Platform, you must:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Be at least 13 years of age</li>
          <li>Have the legal capacity to enter into a binding agreement</li>
          <li>Not be prohibited from using the Platform under applicable law</li>
        </ul>
        <p>
          By using the Platform, you represent and warrant that you meet all of the above eligibility requirements.
        </p>
      </div>
    ),
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>When you create an account on Together Myanmar, you agree to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain the security of your password and account credentials</li>
          <li>Promptly notify us of any unauthorized access or use of your account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe
          have been compromised.
        </p>
      </div>
    ),
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use",
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>You agree to use the Platform only for lawful purposes and in a way that does not infringe the rights of others. You must not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Post content that is hateful, discriminatory, threatening, or harassing</li>
          <li>Share false, misleading, or defamatory information</li>
          <li>Impersonate any person or organization</li>
          <li>Upload or transmit malware, viruses, or harmful code</li>
          <li>Scrape, harvest, or collect data from the Platform without authorization</li>
          <li>Attempt to gain unauthorized access to any part of the Platform</li>
          <li>Use the Platform for commercial solicitation without our written consent</li>
          <li>Engage in any activity that disrupts or interferes with the Platform</li>
        </ul>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
          Violations of this section may result in immediate account suspension or termination and may be reported to
          relevant authorities.
        </p>
      </div>
    ),
  },
  {
    id: "content",
    title: "5. User-Generated Content",
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          You retain ownership of content you submit to the Platform. By posting content, you grant Together Myanmar a
          non-exclusive, royalty-free, worldwide licence to use, display, and distribute that content solely for the
          purpose of operating and improving the Platform.
        </p>
        <p>You are solely responsible for the content you post and represent that:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You own or have the necessary rights to share the content</li>
          <li>The content does not violate any third-party rights or applicable law</li>
          <li>The content is accurate and not misleading</li>
        </ul>
        <p>
          We reserve the right to remove any content at our discretion that violates these Terms or that we find
          otherwise objectionable.
        </p>
      </div>
    ),
  },
  {
    id: "reconnection",
    title: "6. Reconnection & Messaging Features",
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          The Platform provides consent-based reconnection tools that allow users to send connection requests and
          exchange private messages with other members.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Connection requests require explicit approval from the recipient before any communication is established</li>
          <li>Private messages are only visible to the two connected parties</li>
          <li>You must not use the messaging feature to harass, threaten, or spam other users</li>
          <li>You may block or remove any connection at any time</li>
        </ul>
        <p>
          Together Myanmar does not monitor private messages but may act on reports of abuse submitted through the
          platform.
        </p>
      </div>
    ),
  },
  {
    id: "privacy",
    title: "7. Privacy",
    content: (
      <p className="text-sm text-gray-600">
        Your use of the Platform is also governed by our{" "}
        <Link href="/privacy" className="font-medium text-blue-600 underline hover:text-blue-800">
          Privacy Policy
        </Link>
        , which is incorporated into these Terms by reference. By using the Platform, you consent to the collection
        and use of your information as described in the Privacy Policy.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property",
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          All content, design, logos, and software on the Platform that are not user-generated are the intellectual
          property of Together Myanmar or its licensors and are protected by copyright and other applicable laws.
        </p>
        <p>
          You may not reproduce, distribute, or create derivative works from any Platform content without our express
          written permission.
        </p>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "9. Third-Party Links & Services",
    content: (
      <p className="text-sm text-gray-600">
        The Platform may contain links to third-party websites or services. These are provided for convenience only.
        Together Myanmar does not endorse, control, or accept responsibility for the content, privacy practices, or
        availability of third-party sites. Your use of any third-party service is at your own risk.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          The Platform is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without
          warranties of any kind, either express or implied, including but not limited to warranties of
          merchantability, fitness for a particular purpose, or non-infringement.
        </p>
        <p>
          We do not warrant that the Platform will be uninterrupted, error-free, or free from viruses or other
          harmful components.
        </p>
      </div>
    ),
  },
  {
    id: "limitation",
    title: "11. Limitation of Liability",
    content: (
      <p className="text-sm text-gray-600">
        To the fullest extent permitted by law, Together Myanmar and its officers, directors, employees, and
        volunteers shall not be liable for any indirect, incidental, special, consequential, or punitive damages
        arising out of or related to your use of the Platform, even if we have been advised of the possibility of
        such damages. Our total liability to you for any claim shall not exceed CAD $100.
      </p>
    ),
  },
  {
    id: "indemnification",
    title: "12. Indemnification",
    content: (
      <p className="text-sm text-gray-600">
        You agree to indemnify, defend, and hold harmless Together Myanmar and its affiliates from and against any
        claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from
        your use of the Platform, your violation of these Terms, or your infringement of any third-party rights.
      </p>
    ),
  },
  {
    id: "termination",
    title: "13. Termination",
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          We may suspend or terminate your access to the Platform at any time, with or without notice, for any reason,
          including a breach of these Terms.
        </p>
        <p>
          You may close your account at any time by contacting us. Upon termination, your right to use the Platform
          ceases immediately. Provisions that by their nature should survive termination will remain in effect.
        </p>
      </div>
    ),
  },
  {
    id: "governing-law",
    title: "14. Governing Law",
    content: (
      <p className="text-sm text-gray-600">
        These Terms are governed by and construed in accordance with the laws of the Province of Ontario, Canada,
        and the federal laws of Canada applicable therein, without regard to conflict of law principles. Any disputes
        arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Ontario,
        Canada.
      </p>
    ),
  },
  {
    id: "changes",
    title: "15. Changes to These Terms",
    content: (
      <p className="text-sm text-gray-600">
        We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a
        revised effective date. Your continued use of the Platform after changes are posted constitutes your
        acceptance of the updated Terms. If you do not agree to the revised Terms, you should stop using the
        Platform.
      </p>
    ),
  },
  {
    id: "contact",
    title: "16. Contact",
    content: (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="mb-3 text-sm text-gray-600">
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-semibold text-gray-700">Organisation</dt>
            <dd className="text-gray-600">Together Myanmar</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-semibold text-gray-700">Email</dt>
            <dd>
              <a href="mailto:legal@togethermyanmar.org" className="font-medium text-blue-600 underline hover:text-blue-800">
                legal@togethermyanmar.org
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-semibold text-gray-700">Website</dt>
            <dd className="text-gray-600">www.togethermyanmar.org</dd>
          </div>
        </dl>
      </div>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="px-6 py-14 text-white"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)" }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            📄 Legal
          </div>
          <h1 className="mb-3 text-4xl font-extrabold sm:text-5xl">Terms of Service</h1>
          <p className="text-base" style={{ color: "#c7d2fe" }}>
            Together Myanmar — <span className="font-semibold">Effective Date: March 12, 2026</span>
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "#a5b4fc" }}>
            Please read these Terms carefully before using the Together Myanmar platform. By accessing or using our
            services, you agree to be bound by these Terms and our Privacy Policy.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">

            {/* Table of Contents — sticky sidebar */}
            <aside className="shrink-0 lg:sticky lg:top-6 lg:w-56 lg:self-start">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Contents</p>
                <nav className="space-y-1">
                  {SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block rounded-lg px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick links */}
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Related</p>
                <div className="space-y-1">
                  <Link href="/privacy" className="block rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    🔒 Privacy Policy
                  </Link>
                  <Link href="/contact" className="block rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    ✉️ Contact Us
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-6">

              {/* Summary callout */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">Summary</p>
                <ul className="space-y-1 text-xs text-indigo-800">
                  <li>✓ Use the platform respectfully and lawfully</li>
                  <li>✓ You own your content; we only use it to run the platform</li>
                  <li>✓ Consent-based connections — no one is added without approval</li>
                  <li>✓ We may remove content or accounts that violate these Terms</li>
                  <li>✓ Governed by Ontario, Canadian law</li>
                </ul>
              </div>

              {SECTIONS.map((s) => (
                <div
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <h2 className="mb-4 text-base font-bold text-gray-900">{s.title}</h2>
                  {s.content}
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-400">
                <span>Last updated: March 12, 2026</span>
                <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy →</Link>
                <Link href="/contact" className="text-blue-600 hover:underline">Contact Us →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
