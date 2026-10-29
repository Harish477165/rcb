import { Link } from 'react-router-dom'
import { Zap, Mail, Phone, MapPin, Twitter, Github, Linkedin, Facebook, Instagram, CreditCard, Shield, Truck, RefreshCw } from 'lucide-react'

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/catalog' },
    { label: 'Laptops & Computers', to: '/catalog?category=laptops' },
    { label: 'Smartphones', to: '/catalog?category=phones' },
    { label: 'Audio & Headphones', to: '/catalog?category=audio' },
    { label: 'Cameras', to: '/catalog?category=cameras' },
    { label: 'Smart Home', to: '/catalog?category=smarthome' },
  ],
  Account: [
    { label: 'My Profile', to: '/profile' },
    { label: 'My Orders', to: '/orders' },
    { label: 'Shopping Cart', to: '/cart' },
    { label: 'Wishlist', to: '/wishlist' },
    { label: 'Track Order', to: '/orders' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Returns & Refunds', to: '#' },
    { label: 'Shipping Info', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
}

const features = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders over $99' },
  { icon: Shield, label: 'Secure Payments', sub: '256-bit SSL encrypted' },
  { icon: RefreshCw, label: '30-Day Returns', sub: 'Hassle-free policy' },
  { icon: CreditCard, label: 'Flexible Payment', sub: 'Multiple methods' },
]

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Feature highlights */}
      <div className="border-b border-gray-800">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Shop<span className="text-primary-400">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your premium destination for cutting-edge electronics and gadgets. 
              Quality products, competitive prices, and exceptional service.
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@shopforge.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+1 (800) SHOPFORGE</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>123 Tech Ave, San Francisco, CA</span>
              </div>
            </div>
            {/* Social links */}
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold text-white text-sm mb-4">{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors hover:pl-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ShopForge. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Payments secured by</span>
            <span className="font-semibold text-gray-400 ml-1">Stripe</span>
            <CreditCard className="w-4 h-4 ml-1 text-primary-400" />
          </div>
        </div>
      </div>
    </footer>
  )
}
