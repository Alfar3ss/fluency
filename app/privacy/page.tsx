export default function PrivacyPage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: 1/1/2026</p>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
            <p className="text-gray-700">
              This Privacy Policy explains how Fluency ("we", "us", "our") collects, uses, and protects
              your personal information when you use <span className="font-medium">www.fluency.center</span> (the "Website") and our
              services. By using our Website, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
            <p className="text-gray-700">We may collect the following categories of information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>
                <span className="font-medium">Account & Identity:</span> name, email address, password (hashed), profile details (e.g., full name,
                language preferences, level), and teacher/student identifiers.
              </li>
              <li>
                <span className="font-medium">Authentication & Session:</span> session tokens and similar identifiers managed by our authentication
                provider (e.g., Supabase) to keep you signed in.
              </li>
              <li>
                <span className="font-medium">Usage Data:</span> pages viewed, interactions, assessments taken, and general analytics to improve
                performance and features.
              </li>
              <li>
                <span className="font-medium">Device & Log Data:</span> IP address, browser type, device information, and timestamps used for security
                and diagnostics.
              </li>
              <li>
                <span className="font-medium">Payment Data:</span> if applicable, limited transaction details processed by third-party payment providers.
                We do not store full payment card numbers on our servers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide, operate, and maintain the Website and services</li>
              <li>Authenticate users and secure access to dashboards and classes</li>
              <li>Personalize your learning experience and track progress</li>
              <li>Communicate updates, service notices, and support messages</li>
              <li>Monitor performance, fix issues, and improve features</li>
              <li>Comply with legal obligations and enforce our Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Legal Bases (EEA/UK)</h2>
            <p className="text-gray-700">Where applicable under GDPR, we process personal data based on:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Performance of a contract (providing subscribed services)</li>
              <li>Legitimate interests (security, analytics, product improvement)</li>
              <li>Consent (optional features like marketing emails or certain cookies)</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Sharing Your Information</h2>
            <p className="text-gray-700">We may share limited data with:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>
                <span className="font-medium">Service providers:</span> authentication (e.g., Supabase), analytics, hosting, payment processing,
                and customer support—solely to deliver and improve the service.
              </li>
              <li>
                <span className="font-medium">Legal & compliance:</span> when required by law or to protect rights, safety, and security.
              </li>
            </ul>
            <p className="text-gray-700 mt-2">We do not sell personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Data Retention</h2>
            <p className="text-gray-700">
              We retain personal data for as long as necessary to provide services, comply with legal
              obligations, resolve disputes, and enforce agreements. You may request deletion of your account
              and associated data, subject to lawful exceptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
            <p className="text-gray-700">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Access a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your data (subject to legal exceptions)</li>
              <li>Restrict or object to certain processing</li>
              <li>Receive your data in a portable format</li>
              <li>Withdraw consent where processing relies on consent</li>
            </ul>
            <p className="text-gray-700 mt-2">To exercise these rights, contact us at <span className="font-medium">contact@fluency.center</span>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Cookies & Tracking</h2>
            <p className="text-gray-700">
              We use cookies to operate and improve the Website, remember preferences, and analyze usage.
              For details and controls, see our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Security</h2>
            <p className="text-gray-700">
              We implement technical and organizational measures to protect personal data. No system is
              perfectly secure; please use strong passwords and keep your credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">International Transfers</h2>
            <p className="text-gray-700">
              If your data is transferred outside your country or region, we take steps to ensure appropriate
              safeguards (e.g., contractual protections) consistent with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Children’s Privacy</h2>
            <p className="text-gray-700">
              Our services are intended for users aged 13 and older. If you believe a child provided personal
              data without consent, contact us and we will take appropriate steps.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically. If we make significant changes, we will notify
              you in-app or via email and update the "Last updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-700">
              Questions about this Privacy Policy? Contact us at
              <span className="font-medium"> contact@fluency.center</span>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
