import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#181e29] text-gray-200 pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand & Social */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Fluency Logo" className="h-10" />
          </div>
          <p className="mb-4 text-lg text-gray-300">Learn languages and practice with native speakers.<br />Join thousands of learners on their journey to fluency.</p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="bg-[#232a38] p-2 rounded-lg hover:bg-blue-600 transition"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" fill="#fff"/></svg></a>
            <a href="#" className="bg-[#232a38] p-2 rounded-lg hover:bg-pink-500 transition"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 2.75a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm6.25.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM12 7.25A4.75 4.75 0 1 1 7.25 12 4.75 4.75 0 0 1 12 7.25Z" fill="#fff"/></svg></a>
          </div>
        </div>
        {/* Product */}
        <div>
          <h4 className="font-bold text-lg text-white mb-4">Product</h4>
          <ul className="space-y-2">
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/placement-test" className="hover:underline">Placement Test</Link></li>
            <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
          </ul>
        </div>
        {/* Company */}
        <div>
          <h4 className="font-bold text-lg text-white mb-4">Company</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h4 className="font-bold text-lg text-white mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4Z" stroke="#fff" strokeWidth="2"/><path d="M22 6.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.5M22 6.5l-10 7-10-7" stroke="#fff" strokeWidth="2"/></svg> <span>contact@fluency.center</span></li>
            <li className="flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M22 16.92v2a2 2 0 0 1-2.18 2A19.84 19.84 0 0 1 3.11 5.18 2 2 0 0 1 5.09 3h2a2 2 0 0 1 2 1.72l.7 3a2 2 0 0 1-.5 1.93L8.02 9.92a16 16 0 0 0 6.46 6.46l1.27-1.27a2 2 0 0 1 1.93-.5l3 .7a2 2 0 0 1 1.32 1.61Z"
                  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <span>+212 691-294-488 </span>
            </li>
            <li className="flex items-center gap-2"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17.657 16.657A8 8 0 1 0 7.05 7.05a8 8 0 0 0 10.607 9.607Z" stroke="#fff" strokeWidth="2"/><path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="#fff" strokeWidth="2"/></svg> <span>Beni-Mellal, Morocco</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm gap-4">
        <div>© 2025 Fluency. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
