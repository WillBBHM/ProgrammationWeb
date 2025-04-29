import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import BoatDetailCard from '@/components/BoatDetailCard';
import { getBoatById } from '@/data/boats';

const BoatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [boat, setBoat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Function to load boat data with retry logic
  const loadBoatWithRetry = async () => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 10; // Limit attempts to avoid infinite loop
    const retryDelay = 500; // Delay between attempts (in ms)

    while (attempts < maxAttempts) {
      try {
        const boatData = id ? getBoatById(id) : null;
        if (boatData) {
          // If data is available, use it
          setBoat(boatData);
          setLoading(false);
          return;
        }
        // If no data is available, wait and retry
        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        console.error("Erreur lors du chargement du bateau :", error);
        setLoading(false);
        return;
      }
    }
    console.warn("Aucune donnée de bateau disponible après plusieurs tentatives.");
    setLoading(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadBoatWithRetry();
  }, [id]); // Reload if ID changes

  // Display during loading
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-marine-900 mb-2">Chargement du bateau...</h1>
          <p className="text-gray-600">Veuillez patienter, nous récupérons les détails du bateau.</p>
        </div>
      </Layout>
    );
  }

  // Display if boat is not found
  if (!boat) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 mb-8"
            onClick={() => navigate('/b')}
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux bateaux
          </Button>
          
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-center gap-4 mb-6 max-w-md">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <h2 className="text-lg font-semibold text-amber-800">Bateau introuvable</h2>
                <p className="text-amber-700">Ce bateau n'existe pas ou a été retiré de notre flotte.</p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/b')}
              className="bg-marine-700 hover:bg-marine-800"
            >
              Explorer nos bateaux disponibles
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Display boat details when data is loaded
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-8"
          onClick={() => navigate('/b')}
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux bateaux
        </Button>
        
        <BoatDetailCard
          id={boat.id}
          name={boat.name}
          imageUrl={boat.imageUrl}
          price={boat.price}
          category={boat.category}
          location={boat.location}
          capacity={boat.capacity}
          length={boat.length}
          year={boat.year}
          motorPower={boat.motorPower}
          description={boat.description}
          features={boat.features}
        />
        
        {/* Additional sections can be added here if needed */}
      </div>
    </Layout>
  );
};

export default BoatDetailPage;
