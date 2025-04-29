import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ReservationCard from '@/components/ReservationCard';
import ReservationCalendar from '@/components/ReservationCalendar';
import ReservationForm from '@/components/ReservationForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getCurrentUser, deleteReservation, Reservation } from '@/data/database';

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      fetchReservations(user);
    }
  }, []);

  const fetchReservations = async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1/reservations/');
      if (!response.ok) {
        throw new Error('Failed to fetch reservations from API');
      }
      const data = await response.json();
      // Convert API data to match Reservation interface
      const convertedReservations: Reservation[] = data.map((item: any) => ({
        id: item.id.toString(),
        boatId: item.boatId.toString(),
        startDate: item.startDate,
        endDate: item.endDate,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        totalPrice: parseFloat(item.totalPrice),
        status: item.status as 'pending' | 'confirmed' | 'cancelled',
      })).filter((res: Reservation) => res.fullName === username); // Filter by username
      setReservations(convertedReservations);
    } catch (err) {
      setError('Unable to load reservations. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsCalendarOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditReservation(reservation);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) setEditReservation(null);
    
    if (open === false && currentUser) {
      fetchReservations(currentUser);
    }
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteReservation = () => {
    if (!selectedReservation) return;
    
    const success = deleteReservation(selectedReservation.id);
    if (success) {
      toast({
        title: "Réservation annulée",
        description: "Votre réservation a été annulée avec succès.",
      });
      
      if (currentUser) {
        fetchReservations(currentUser);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'annuler la réservation.",
      });
    }
    
    setIsDeleteDialogOpen(false);
  };

  const handleNewReservation = () => {
    navigate('/b');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-marine-900 mb-2">
              Mes réservations
            </h1>
            <p className="text-gray-600">
              {currentUser 
                ? "Gérez vos réservations de bateaux" 
                : "Connectez-vous pour voir vos réservations"
              }
            </p>
          </div>
          <Button 
            onClick={handleNewReservation}
            disabled={!currentUser}
            className="bg-marine-700 hover:bg-marine-800"
          >
            Réserver un bateau
          </Button>
        </div>

        {!currentUser ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Vous devez être connecté pour voir vos réservations
            </h2>
            <p className="text-gray-600 mb-6">
              Connectez-vous ou inscrivez-vous pour réserver un bateau et gérer vos réservations.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Chargement des réservations...
            </h2>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-red-600 mb-4">
              {error}
            </h2>
            <Button onClick={() => currentUser && fetchReservations(currentUser)} className="bg-marine-700 hover:bg-marine-800">
              Réessayer
            </Button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Vous n'avez pas encore de réservation
            </h2>
            <p className="text-gray-600 mb-6">
              Explorez notre catalogue et trouvez le bateau parfait pour votre prochaine aventure.
            </p>
            <Button onClick={handleNewReservation} className="bg-marine-700 hover:bg-marine-800">
              Explorer les bateaux
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reservations.map(reservation => (
              <ReservationCard 
                key={reservation.id}
                reservation={reservation}
                onView={handleViewReservation}
                onEdit={handleEditReservation}
                onDelete={handleDeleteReservation}
              />
            ))}
          </div>
        )}

        <ReservationCalendar
          reservation={selectedReservation}
          isOpen={isCalendarOpen}
          onOpenChange={setIsCalendarOpen}
        />

        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la réservation</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre réservation ci-dessous.
              </DialogDescription>
            </DialogHeader>
            {editReservation && (
              <div className="mt-4">
                <ReservationForm
                  key={editReservation.id}
                  boatId={editReservation.boatId}
                  locationState={{
                    editMode: true,
                    reservation: editReservation
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ReservationPage;
