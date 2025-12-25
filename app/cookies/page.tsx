export default function CookiesPage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-3">Cookie Policy</h1>
        <p className="text-gray-600">Last updated: December 25, 2025</p>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
            <p className="text-gray-700">
              This Cookie Policy explains how Fluency ("we", "us", "our") uses cookies and similar
              technologies on our website and application. It also explains your choices regarding these
              technologies. For additional information, see our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">What Are Cookies?</h2>
            <p className="text-gray-700">
              Cookies are small text files placed on your device that help the site function, improve
              performance, and deliver a better experience. Cookies can be "session" (deleted when you close
              your browser) or "persistent" (stored until they expire or are removed).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">How We Use Cookies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Essential Cookies</h3>
                <p className="text-gray-700">
                  Required for core functionality such as authentication, security, and load balancing.
                  Without these, the site may not work properly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Preferences Cookies</h3>
                <p className="text-gray-700">
                  Remember your settings and choices (e.g., language, UI preferences) to provide a
                  more personalized experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Analytics Cookies</h3>
                <p className="text-gray-700">
                  Help us understand usage and improve features (e.g., pages visited, interactions).
                  These may be provided by third parties such as analytics platforms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Marketing Cookies</h3>
                <p className="text-gray-700">
                  Used to show relevant offers and measure campaign effectiveness. These may be set
                  by our partners. We avoid intrusive tracking and respect your choices.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Third-Party Cookies</h2>
            <p className="text-gray-700">
              Some cookies are set by third parties that provide services to us. For example, our
              authentication provider (Supabase) may set cookies to maintain your session. Analytics
              and payment providers may also use their own cookies as part of their services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Your Choices</h2>
            <p className="text-gray-700">
              You can control cookies through your browser settings. Most browsers let you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Block or delete cookies</li>
              <li>Set site-specific permissions</li>
              <li>Clear browsing data (including cookies)</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Refer to your browser’s help pages:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Chrome: chrome://settings/cookies</li>
              <li>Firefox: about:preferences#privacy</li>
              <li>Safari: Preferences → Privacy</li>
              <li>Edge: edge://settings/privacy</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Note: Blocking essential cookies may impact core features like login and secure areas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Specific Cookies We Use</h2>
            <div className="rounded-2xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                <div>Name</div>
                <div>Purpose</div>
                <div>Type</div>
                <div>Duration</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-sm text-gray-700">
                <div>sb-access-token</div>
                <div>Authentication session (Supabase)</div>
                <div>Essential</div>
                <div>Session</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-sm text-gray-700 border-t border-gray-100">
                <div>sb-refresh-token</div>
                <div>Refresh session (Supabase)</div>
                <div>Essential</div>
                <div>Persistent</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-sm text-gray-700 border-t border-gray-100">
                <div>preferred_language</div>
                <div>Remember UI language choice</div>
                <div>Preferences</div>
                <div>Persistent</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-sm text-gray-700 border-t border-gray-100">
                <div>analytics_*</div>
                <div>Usage metrics and performance</div>
                <div>Analytics</div>
                <div>Varies</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              The above list is illustrative and may evolve as we improve the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy to reflect changes in technology, our services, or legal
              requirements. If we make significant changes, we will notify you in-app or by updating the
              "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-700">
              Questions about this policy? Contact us at
              <span className="font-medium"> contact@fluency.center</span>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
