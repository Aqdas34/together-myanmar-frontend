import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – Together Myanmar",
  description: "Privacy Policy for Together Myanmar. Learn how we collect, use, and protect your personal information.",
};

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 font-semibold text-gray-900">Personal Information</h4>
          <p className="mb-2 text-sm text-gray-600">We may collect personal information you provide voluntarily, such as your:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Name, email address, and contact details</li>
            <li>Profile information if you create an account</li>
            <li>Community or organizational affiliation</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-gray-900">Non-Personal Information</h4>
          <p className="mb-2 text-sm text-gray-600">We automatically collect:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Device and browser type</li>
            <li>IP address</li>
            <li>Pages visited and time spent on the website</li>
            <li>Interaction data for analytics</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">This information helps us improve the website and user experience.</p>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: (
      <div>
        <p className="mb-3 text-sm text-gray-600">We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Provide and improve our services</li>
          <li>Connect Myanmar communities globally</li>
          <li>Respond to inquiries and feedback</li>
          <li>Share updates, newsletters, and announcements</li>
          <li>Maintain website security</li>
          <li>Support research and community initiatives</li>
        </ul>
        <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          ✓ We do not sell or rent your personal information to third parties.
        </p>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "3. Sharing of Information",
    content: (
      <div>
        <p className="mb-3 text-sm text-gray-600">We may share information only in limited circumstances:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>With trusted service providers assisting us in operating the website</li>
          <li>When required by law or legal obligations</li>
          <li>To protect the safety, rights, or property of the platform or its users</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Personal information will never be shared for marketing purposes without your explicit consent.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking",
    content: (
      <div>
        <p className="mb-3 text-sm text-gray-600">We use cookies and similar technologies to:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Enhance website functionality and user experience</li>
          <li>Remember user preferences</li>
          <li>Collect usage analytics</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          You may disable cookies via your browser settings, though some features may not function properly as a result.
        </p>
      </div>
    ),
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: (
      <p className="text-sm text-gray-600">
        We retain personal information only as long as necessary for the purposes for which it was collected, or as required by applicable law.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: (
      <p className="text-sm text-gray-600">
        We implement reasonable technical and organizational measures to protect personal information against unauthorized access, disclosure, or destruction. However, no online system is completely secure, and we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: (
      <div>
        <p className="mb-3 text-sm text-gray-600">You have the following rights regarding your personal data:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Access your personal information</li>
          <li>Request correction of inaccuracies</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent (where applicable)</li>
          <li>Object to processing or request data portability (GDPR)</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:privacy@togethermyanmar.org" className="font-medium text-blue-600 underline hover:text-blue-800">
            privacy@togethermyanmar.org
          </a>.
        </p>
      </div>
    ),
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: (
      <p className="text-sm text-gray-600">
        Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us and we will promptly delete it.
      </p>
    ),
  },
  {
    id: "international",
    title: "9. International Users",
    content: (
      <p className="text-sm text-gray-600">
        For users outside Canada, we comply with applicable international privacy laws, including the General Data Protection Regulation (GDPR) for EU residents. By using our website, you consent to the transfer and processing of your data in accordance with this Privacy Policy.
      </p>
    ),
  },
  {
    id: "updates",
    title: "10. Updates to This Policy",
    content: (
      <p className="text-sm text-gray-600">
        We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date. We encourage you to review this policy periodically to stay informed about how we protect your information.
      </p>
    ),
  },
  {
    id: "contact",
    title: "11. Contact",
    content: (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="mb-3 text-sm text-gray-600">For questions about this Privacy Policy or your personal information:</p>
        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="font-semibold text-gray-700 w-20 shrink-0">Organisation</dt>
            <dd className="text-gray-600">Together Myanmar</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-gray-700 w-20 shrink-0">Email</dt>
            <dd>
              <a href="mailto:privacy@togethermyanmar.org" className="font-medium text-blue-600 underline hover:text-blue-800">
                privacy@togethermyanmar.org
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-gray-700 w-20 shrink-0">Website</dt>
            <dd className="text-gray-600">www.togethermyanmar.org</dd>
          </div>
        </dl>
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="px-6 py-14 text-white"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)" }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            🔒 Legal
          </div>
          <h1 className="mb-3 text-4xl font-extrabold sm:text-5xl">Privacy Policy</h1>
          <p className="text-base" style={{ color: "#bfdbfe" }}>
            Together Myanmar — <span className="font-semibold">Effective Date: March 12, 2026</span>
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "#93c5fd" }}>
            Together Myanmar ("we", "our", "us") respects your privacy and is committed to protecting your personal
            information in accordance with Canadian law (PIPEDA) and international privacy standards including GDPR.
            This policy explains what information we collect, how we use it, and your rights.
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
                      className="block rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-6">
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

              {/* Compliance badges */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700">Compliance</p>
                <div className="flex flex-wrap gap-2">
                  {["🇨🇦 PIPEDA (Canada)", "🇪🇺 GDPR (EU)", "🌐 International Privacy Standards"].map((b) => (
                    <span key={b} className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-800">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-400">
                <span>Last updated: March 12, 2026</span>
                <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service →</Link>
                <Link href="/contact" className="text-blue-600 hover:underline">Contact Us →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
