import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Produto',
      links: [
        { name: 'Recursos', href: '/recursos' },
        { name: 'Preços', href: '/precos' },
        { name: 'Integrações', href: '/integracoes' },
        { name: 'API', href: '/api' },
      ]
    },
    {
      title: 'Empresa',
      links: [
        { name: 'Sobre', href: '/sobre' },
        { name: 'Blog', href: '/blog' },
        { name: 'Cases', href: '/cases' },
        { name: 'Carreiras', href: '/carreiras' },
      ]
    },
    {
      title: 'Suporte',
      links: [
        { name: 'Central de Ajuda', href: '/ajuda' },
        { name: 'Documentação', href: '/docs' },
        { name: 'Status', href: '/status' },
        { name: 'Contato', href: '/contato' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacidade', href: '/privacidade' },
        { name: 'Termos de Uso', href: '/termos' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'LGPD', href: '/lgpd' },
      ]
    }
  ]

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Email', href: 'mailto:contato@mercaflow.com.br', icon: Mail },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MF</span>
              </div>
              <span className="text-xl font-bold">MercaFlow</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Transforme seu negócio no Mercado Livre com nossa plataforma world-class de integração e otimização.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-semibold text-white mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-gray-400 text-sm">
                Receba dicas exclusivas, cases de sucesso e atualizações da plataforma.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium whitespace-nowrap">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} MercaFlow. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="text-gray-400 text-sm">🇧🇷 Feito no Brasil</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">Para vendedores brasileiros</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}