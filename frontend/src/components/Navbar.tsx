
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Menu, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/AuthDialog';
import { getCurrentUser, setCurrentUser } from '@/data/database';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUserState] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    setCurrentUserState(user);
  }, []);

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthDialogOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setAuthDialogOpen(true);
  };

  const handleLogoutClick = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    window.location.reload();
  };

  const handleAuthSuccess = () => {
    setCurrentUserState(getCurrentUser());
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Anchor className="h-7 w-7 text-marine-700" />
            <span className="text-xl font-bold text-marine-800">VoyageMarin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-marine-700 hover:text-marine-500 font-medium">
              Accueil
            </Link>
            <Link to="/b" className="text-marine-700 hover:text-marine-500 font-medium">
              Bateaux
            </Link>
            <Link to="/r" className="text-marine-700 hover:text-marine-500 font-medium">
              Mes Réservations
            </Link>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-marine-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-marine-700 font-medium">{currentUser}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleLoginClick}
                >
                  <User className="h-4 w-4" /> Connexion
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRegisterClick}
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-marine-700 hover:text-marine-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-marine-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/b"
              className="block px-4 py-2 text-marine-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Bateaux
            </Link>
            <Link
              to="/r"
              className="block px-4 py-2 text-marine-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Mes Réservations
            </Link>
            <div className="px-4 pt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-marine-500"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            {currentUser ? (
              <div className="px-4 pt-2 space-y-2">
                <p className="text-marine-700 font-medium">{currentUser}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </Button>
              </div>
            ) : (
              <div className="px-4 pt-2 space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleLoginClick}
                >
                  <User className="h-4 w-4" /> Connexion
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={handleRegisterClick}
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog 
        isOpen={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </nav>
  );
};

export default Navbar;
