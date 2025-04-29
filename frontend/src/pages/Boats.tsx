import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import Layout from '@/components/Layout';
import BoatCard from '@/components/BoatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllBoats, Boat } from '@/data/boats';


const BoatsPage: React.FC = () => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [allBoats, setAllBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [capacity, setCapacity] = useState(0);
  const [showFilters, setShowFilters] = useState(false);


  // Fonction pour vérifier et charger les données avec une attente si nécessaire
  const loadBoatsWithRetry = async () => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 10; // Limite d'essais pour éviter une boucle infinie
    const retryDelay = 500; // Délai entre les tentatives (en ms)


    while (attempts < maxAttempts) {
      try {
        const boatsData = getAllBoats(); // Appel à la fonction d'obtention des bateaux
        if (boatsData.length > 0) {
          // Si des données sont disponibles, on les utilise
          setAllBoats(boatsData);
          setBoats(boatsData);
          setLoading(false);
          return;
        }
        // Si aucune donnée n'est disponible, on attend un peu et on réessaie
        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        console.error("Erreur lors du chargement des bateaux :", error);
        setLoading(false);
        return;
      }
    }
    console.warn("Aucune donnée de bateau disponible après plusieurs tentatives.");
    setLoading(false);
  };


  // Charger les données au montage du composant
  useEffect(() => {
    loadBoatsWithRetry();
  }, []); // Dépendance vide pour ne charger qu'au montage


  // Get unique categories
  const categories = Array.from(new Set(allBoats.map(boat => boat.category)));


  // Get unique locations
  const locations = Array.from(new Set(allBoats.map(boat => boat.location)));


  // Handle filter changes
  useEffect(() => {
    if (allBoats.length === 0) return; // Éviter de filtrer si les données ne sont pas encore chargées


    let filteredBoats = allBoats;


    // Filter by search term
    if (searchTerm) {
      filteredBoats = filteredBoats.filter(boat => 
        boat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        boat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    // Filter by category
    if (selectedCategory) {
      filteredBoats = filteredBoats.filter(boat => boat.category === selectedCategory);
    }


    // Filter by location
    if (selectedLocation) {
      filteredBoats = filteredBoats.filter(boat => boat.location === selectedLocation);
    }


    // Filter by price range
    filteredBoats = filteredBoats.filter(boat => 
      boat.price >= priceRange[0] && boat.price <= priceRange[1]
    );


    // Filter by capacity
    if (capacity > 0) {
      filteredBoats = filteredBoats.filter(boat => boat.capacity >= capacity);
    }


    setBoats(filteredBoats);
  }, [searchTerm, selectedCategory, selectedLocation, priceRange, capacity, allBoats]);


  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setPriceRange([0, 1000]);
    setCapacity(0);
  };


  // Affichage pendant le chargement
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-marine-900 mb-2">Chargement des bateaux...</h1>
          <p className="text-gray-600">Veuillez patienter, nous récupérons la liste des bateaux.</p>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-marine-900 mb-2">Nos Bateaux</h1>
          <p className="text-gray-600">Trouvez le bateau idéal pour votre prochaine aventure en mer</p>
        </div>
        
        {/* Search and filters section */}
        <div className="mb-12 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Rechercher un bateau..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" /> Filtres 
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="text-marine-700"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
          
          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-3">
                <Label htmlFor="category">Type de bateau</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="location">Lieu</Label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les lieux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les lieux</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>Capacité minimale</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-gray-500">personnes</span>
                </div>
              </div>
              
              <div className="md:col-span-3 space-y-3">
                <div className="flex justify-between">
                  <Label>Prix par jour</Label>
                  <span className="text-sm text-gray-500">
                    {priceRange[0]}€ - {priceRange[1]}€
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 1000]}
                  min={0}
                  max={1000}
                  step={50}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Results section */}
        {boats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boats.map(boat => (
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
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun bateau trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};


export default BoatsPage;
