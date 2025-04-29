export interface Boat {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  location: string;
  capacity: number;
  length: number;
  year: number;
  motorPower?: string;
  description: string;
  features: string[];
}

// Fonction pour récupérer les données depuis l'API
async function fetchBoatsFromApi(): Promise<Boat[]> {
  const response = await fetch('http://127.0.0.1/boats/');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données depuis l\'API');
  }
  const jsonData = await response.json();
  
  // Transformation des données JSON en tableau Boat[]
  const boatsData: Boat[] = [];
  for (const item of jsonData) {
    const featuresArray = item.features ? item.features.split(',') : [];
    boatsData.push({
      id: `boat-${item.id}`,
      name: item.nom_bateau,
      imageUrl: item.imageUrl,
      price: parseFloat(item.price),
      category: item.category,
      location: item.location,
      capacity: item.capacity,
      length: parseFloat(item.length),
      year: item.year,
      motorPower: item.motorPower || undefined,
      description: item.description,
      features: featuresArray
    });
  }
  return boatsData;
}

// Variable pour stocker les bateaux
let boats: Boat[] = [];

// Initialisation automatique des données lors de l'importation du module
(async function init() {
  boats = await fetchBoatsFromApi();
  console.log(`Initialisation terminée. Nombre de bateaux chargés : ${boats.length}`);
})();

// Récupérer tous les bateaux
export const getAllBoats = (): Boat[] => {
  return boats;
};

// Récupérer un bateau par ID
export const getBoatById = (id: string): Boat | null => {
  for (const boat of boats) {
    if (boat.id === id) {
      return boat;
    }
  }
  return null;
};

// Récupérer les bateaux par catégorie
export const getBoatsByCategory = (category: string): Boat[] => {
  const result: Boat[] = [];
  for (const boat of boats) {
    if (boat.category.toLowerCase() === category.toLowerCase()) {
      result.push(boat);
    }
  }
  return result;
};

// Récupérer les bateaux en vedette (limité à un certain nombre)
export const getFeaturedBoats = (count: number = 3): Boat[] => {
  const result: Boat[] = [];
  for (let i = 0; i < count && i < boats.length; i++) {
    result.push(boats[i]);
  }
  return result;
};
