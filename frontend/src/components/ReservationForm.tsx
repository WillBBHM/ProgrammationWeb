import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/data/database';
import { getBoatById } from '@/data/boats';
import AuthDialog from '@/components/AuthDialog';
import axios from 'axios';

interface ReservationFormProps {
  boatId?: string;
  locationState?: any;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ boatId, locationState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const effectiveState = locationState || location.state || {};
  const editMode = effectiveState.editMode || false;
  const existingReservation = effectiveState.reservation as any | undefined;
  const selectedBoatId = boatId || existingReservation?.boatId;
  const [boat, setBoat] = useState<any>(null);
  const [loadingBoat, setLoadingBoat] = useState<boolean>(!!selectedBoatId);

  const todayStr = new Date(new Date().toISOString().split('T')[0]);
  const minDateStr = (() => {
    let min = new Date();
    min.setDate(min.getDate() + 1);
    return min.toISOString().split('T')[0];
  })();

  // Pre-fill start and end dates for edit mode by parsing the API date format
  const [startDate, setStartDate] = useState(() => {
    if (existingReservation?.startDate) {
      return new Date(existingReservation.startDate).toISOString().split('T')[0];
    }
    return '';
  });
  const [endDate, setEndDate] = useState(() => {
    if (existingReservation?.endDate) {
      return new Date(existingReservation.endDate).toISOString().split('T')[0];
    }
    return '';
  });
  const [fullName, setFullName] = useState(existingReservation?.fullName || '');
  const [email, setEmail] = useState(existingReservation?.email || '');
  const [phone, setPhone] = useState(existingReservation?.phone || '');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBoatData = async () => {
      if (selectedBoatId) {
        setLoadingBoat(true);
        try {
          let boatData = getBoatById(selectedBoatId);
          if (!boatData) {
            const response = await axios.get(`http://127.0.0.1/boats/${selectedBoatId}`);
            boatData = response.data;
          }
          setBoat(boatData);
        } catch (error) {
          console.error('Error fetching boat data:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de récupérer les informations du bateau.",
          });
        } finally {
          setLoadingBoat(false);
        }
      }
    };
    fetchBoatData();
  }, [selectedBoatId, toast]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user && !editMode) {
      setFullName(user);
    }
  }, [editMode]);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !boat) return 0;
    const dstart = new Date(startDate);
    const dend = new Date(endDate);
    const days = Math.max(1, Math.ceil((dend.getTime() - dstart.getTime()) / (1000 * 60 * 60 * 24)));
    return boat.price * days;
  };

  const extractNumbers = (id: string) => {
    return id.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthDialogOpen(true);
      return;
    }
    if (!startDate || !endDate || !fullName || !email || !phone || !selectedBoatId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
      });
      return;
    }
    if (
      new Date(startDate) <= todayStr ||
      new Date(endDate) <= todayStr ||
      new Date(startDate) >= new Date(endDate)
    ) {
      toast({
        variant: "destructive",
        title: "Dates incorrectes",
        description: "Les dates doivent être ultérieures à aujourd'hui, et la date de fin après la date de début.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const boatIdString = extractNumbers(selectedBoatId);
      const reservationData = {
        boatId: boatIdString,
        startDate,
        endDate,
        fullName,
        email,
        phone,
        totalPrice: calculateTotalPrice(),
        status: 'pending'
      };
      console.log('Données envoyées à l\'API :', reservationData);
      console.log('Mode :', editMode ? 'Modification' : 'Création');
      const endpoint = editMode && existingReservation
        ? `http://127.0.0.1/reservations/${existingReservation.id}`
        : 'http://127.0.0.1/reservations';
      const method = editMode && existingReservation ? 'put' : 'post';
      console.log('Endpoint utilisé :', endpoint);
      console.log('Méthode utilisée :', method.toUpperCase());
      const response = await axios[method](endpoint, reservationData);
      console.log('Réponse de l\'API :', response.data);
      if (response.data && (response.data.message || response.data.id !== undefined)) {
        toast({
          title: editMode ? "Réservation modifiée !" : "Réservation confirmée !",
          description: editMode
            ? "Votre réservation a bien été mise à jour."
            : "Votre réservation a bien été enregistrée.",
        });
        navigate('/r');
        window.location.reload();
      } else {
        console.error('Format de réponse inattendu :', response.data);
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission de la réservation :', error);
      let errorMessage = "Une erreur s'est produite lors de l'envoi de la réservation.";
      if (error.response) {
        console.error('Détails de l\'erreur API :', error.response.data);
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        console.error('Aucune réponse reçue de l\'API :', error.request);
        errorMessage = "Aucune réponse de l'API. Vérifiez votre connexion ou l'adresse du serveur.";
      } else {
        console.error('Erreur de configuration de la requête :', error.message);
      }
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSuccess = () => {
    setCurrentUser(getCurrentUser());
    if (getCurrentUser()) {
      setFullName(getCurrentUser() || '');
    }
  };

  const disablePastDates = (dateValue: string) =>
    !dateValue || new Date(dateValue) <= todayStr;

  return (
    <>
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-marine-800 dark:text-white">
            {editMode ? "Modifier votre réservation" : "Formulaire de réservation"}
          </CardTitle>
          {boat && !loadingBoat && (
            <CardDescription className="dark:text-gray-300">
              {editMode ? "Modification pour: " : "Réservation pour: "}
              <span className="font-medium text-marine-700 dark:text-marine-300">
                {boat.nom_bateau || boat.name || "Nom non disponible"}
              </span>
            </CardDescription>
          )}
          {loadingBoat && (
            <CardDescription className="dark:text-gray-300">
              Chargement des informations du bateau...
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="dark:text-gray-200">Date de début</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={minDateStr}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="dark:text-gray-200">Date de fin</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="endDate"
                    type="date"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={(startDate && new Date(startDate) >= new Date(minDateStr)) ? startDate : minDateStr}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="dark:text-gray-200">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!!currentUser}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {currentUser && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Réservation au nom de votre profil</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="dark:text-gray-200">Téléphone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            {boat && !loadingBoat && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">Prix par jour: <span className="font-semibold">{boat.price}€</span></p>
                {startDate && endDate && (
                  <p className="text-sm font-medium text-marine-800 dark:text-marine-300 mt-2">
                    Prix total: <span className="text-lg font-bold text-gold-600 dark:text-gold-400">{calculateTotalPrice()}€</span>
                  </p>
                )}
              </div>
            )}
            {loadingBoat && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">Chargement des détails du bateau...</p>
              </div>
            )}
            <Button type="submit" className="w-full bg-marine-700 hover:bg-marine-800 dark:bg-marine-600 dark:hover:bg-marine-700" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : editMode ? "Mettre à jour la réservation" : "Confirmer la réservation"}
            </Button>
            {!currentUser && (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
                Vous devez être connecté pour effectuer une réservation
              </p>
            )}
          </form>
        </CardContent>
      </Card>
      <AuthDialog
        isOpen={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        mode="login"
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default ReservationForm;
