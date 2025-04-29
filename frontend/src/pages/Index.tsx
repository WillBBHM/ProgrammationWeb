import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Anchor, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import BoatCard from '@/components/BoatCard';
import { getFeaturedBoats } from '@/data/boats';

const Index: React.FC = () => {
  const [featuredBoats, setFeaturedBoats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les bateaux en vedette avec réessai si nécessaire
  const loadFeaturedBoatsWithRetry = async () => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 10; // Limite d'essais pour éviter une boucle infinie
    const retryDelay = 500; // Délai entre les tentatives (en ms)

    while (attempts < maxAttempts) {
      try {
        const boatsData = getFeaturedBoats(3); // Appel à la fonction pour obtenir 3 bateaux en vedette
        if (boatsData.length > 0) {
          // Si des données sont disponibles, on les utilise
          setFeaturedBoats(boatsData);
          setLoading(false);
          return;
        }
        // Si aucune donnée n'est disponible, on attend un peu et on réessaie
        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        console.error("Erreur lors du chargement des bateaux en vedette :", error);
        setLoading(false);
        return;
      }
    }
    console.warn("Aucune donnée de bateau en vedette disponible après plusieurs tentatives.");
    setLoading(false);
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadFeaturedBoatsWithRetry();
  }, []); // Dépendance vide pour ne charger qu'au montage

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-hero-pattern bg-cover bg-center h-[80vh]">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Découvrez la Liberté en Mer avec VoyageMarin
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Location de bateaux de qualité pour des aventures inoubliables sur l'eau.
              Explorez la côte méditerranéenne avec style et confort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/b">
                <Button size="lg" className="bg-marine-700 hover:bg-marine-800">
                  Voir nos bateaux
                </Button>
              </Link>
              <Link to="/r">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                  Réserver maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Boats */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-marine-900">Bateaux en vedette</h2>
              <p className="text-gray-600 mt-2">Découvrez notre sélection de bateaux populaires</p>
            </div>
            <Link to="/b" className="hidden md:flex items-center text-marine-700 hover:text-marine-900 font-medium">
              Voir tous les bateaux <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Chargement des bateaux en vedette...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBoats.map(boat => (
                <BoatCard
                  key={boat.id}
                  id={boat.id}
                  name={boat.name}
                  imageUrl={boat.imageUrl}
                  price={boat.price}
                  category={boat.category}
                  location={boat.location}
                  capacity={boat.capacity}
                  length={boat.length}
                />
              ))}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link to="/b">
              <Button variant="outline" className="text-marine-700 border-marine-700">
                Voir tous les bateaux <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-marine-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-marine-900">Comment ça marche</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Louer un bateau n'a jamais été aussi simple. Suivez ces étapes pour commencer votre aventure marine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-marine-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Anchor className="h-8 w-8 text-marine-700" />
              </div>
              <h3 className="text-xl font-semibold text-marine-800 mb-3">1. Choisissez votre bateau</h3>
              <p className="text-gray-600">
                Parcourez notre collection de bateaux et trouvez celui qui correspond à vos besoins.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-marine-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-marine-700" />
              </div>
              <h3 className="text-xl font-semibold text-marine-800 mb-3">2. Réservez vos dates</h3>
              <p className="text-gray-600">
                Sélectionnez les dates qui vous conviennent et complétez votre réservation en quelques clics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-marine-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-marine-700" />
              </div>
              <h3 className="text-xl font-semibold text-marine-800 mb-3">3. Profitez de votre voyage</h3>
              <p className="text-gray-600">
                Récupérez votre bateau et partez explorer les eaux bleues en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-marine-900">Témoignages clients</h2>
            <p className="text-gray-600 mt-2">Découvrez ce que nos clients ont à dire</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
              </div>
              <p className="text-gray-600 italic mb-6">
                "Une expérience exceptionnelle ! Le bateau était impeccable et l'équipe très professionnelle. Je recommande vivement VoyageMarin."
              </p>
              <div className="flex items-center">
                <div>
                  <p className="font-medium text-marine-800">Sophie Martin</p>
                  <p className="text-sm text-gray-500">Marseille</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
              </div>
              <p className="text-gray-600 italic mb-6">
                "Location parfaite pour notre week-end entre amis. Le processus de réservation était simple et le bateau correspondait exactement aux photos."
              </p>
              <div className="flex items-center">
                <div>
                  <p className="font-medium text-marine-800">Thomas Dupont</p>
                  <p className="text-sm text-gray-500">Nice</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gold-400" />
                <Star className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-gray-600 italic mb-6">
                "Superbe yacht avec tous les équipements nécessaires. Le service client a été très réactif quand nous avions des questions."
              </p>
              <div className="flex items-center">
                <div>
                  <p className="font-medium text-marine-800">Claire Bernard</p>
                  <p className="text-sm text-gray-500">Cannes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card-pattern bg-cover bg-center relative">
        <div className="absolute inset-0 bg-marine-900/80"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à prendre le large ?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Réservez dès maintenant et profitez d'une expérience inoubliable sur l'eau avec VoyageMarin.
          </p>
          <Link to="/b">
            <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-marine-900">
              Trouver votre bateau idéal
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
