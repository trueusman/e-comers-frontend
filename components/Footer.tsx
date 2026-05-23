import Link from "next/link";
import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Trophy,
  Apple,
  Bot,
  Mail,
  Share2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020617] text-white mt-16">

      {/* ── Newsletter strip ──────────────────────── */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#3b82f6]" />
              Get the best deals in your inbox
            </p>
            <p className="text-sm text-gray-400 mt-0.5">Subscribe to our newsletter for daily deals</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
            <button className="bg-[#3b82f6] text-[#0f172a] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#2563eb] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── Main footer ───────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="font-black text-2xl mb-3">
            <img src="/usmanhub.logo-removebg-preview.png" alt="UsmanHub" className="h-14 w-auto object-contain" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Pakistan&apos;s trusted online classifieds marketplace. Buy and sell anything, anywhere.
          </p>
          <div className="flex gap-3">
            {[
              { label: "Facebook",  color: "hover:bg-blue-600" },
              { label: "Instagram", color: "hover:bg-pink-600" },
              { label: "Twitter",   color: "hover:bg-sky-500"  },
            ].map(({ label, color }) => (
              <a key={label} href="#" aria-label={label}
                className={`w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ${color} transition-colors`}>
                <Share2 className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-300">Categories</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {[
              { Icon: Smartphone, name: "Smartphones",  slug: "smartphones"        },
              { Icon: Car,        name: "Vehicles",      slug: "vehicle"            },
              { Icon: Sofa,       name: "Furniture",     slug: "furniture"          },
              { Icon: Shirt,      name: "Fashion",       slug: "womens-dresses"     },
              { Icon: Trophy,     name: "Sports",        slug: "sports-accessories" },
            ].map(({ Icon, name, slug }) => (
              <li key={name}>
                <Link href={`/listings?category=${slug}`}
                  className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-300">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {[
              ["/post-ad",  "Post an Ad"],
              ["/login",    "Login"],
              ["/register", "Register"],
              ["/listings", "All Listings"],
            ].map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white transition-colors hover:translate-x-0.5 inline-block">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-300">Support</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {["Help Center","Safety Tips","Privacy Policy","Terms of Use"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>

          {/* App badges */}
          <div className="mt-5 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Download App</p>
            {[
              { label: "App Store",   Icon: Apple },
              { label: "Google Play", Icon: Bot   },
            ].map(({ label, Icon }) => (
              <a key={label} href="#"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-3 py-2 text-xs font-medium">
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────── */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} UsmanHub. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
