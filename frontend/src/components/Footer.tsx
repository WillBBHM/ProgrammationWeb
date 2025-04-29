
import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-marine-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Anchor className="h-7 w-7 text-gold-400" />
              <span className="text-xl font-bold">VoyageMarin</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Votre partenaire de confiance pour la location de bateaux de qualité.
              Explorez les mers avec style et confort.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-gold-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-gold-400">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-gold-400">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gold-400">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Accueil</Link>
              </li>
              <li>
                <Link to="/boats" className="text-gray-300 hover:text-white">Nos Bateaux</Link>
              </li>
              <li>
                <Link to="/reservation" className="text-gray-300 hover:text-white">Réserver</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">À propos</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gold-400">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Location de bateaux</li>
              <li className="text-gray-300">Excursions en mer</li>
              <li className="text-gray-300">Événements nautiques</li>
              <li className="text-gray-300">Formation en navigation</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gold-400">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-400 mt-0.5" />
                <span className="text-gray-300">123 Avenue Maritime, 13000 Marseille, France</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold-400" />
                <span className="text-gray-300">+33 6 12 34 56 78</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold-400" />
                <span className="text-gray-300">contact@voyagemarin.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-marine-800 mt-8 pt-6">
          <p className="text-gray-400 text-center text-sm">
            © {new Date().getFullYear()} VoyageMarin. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
