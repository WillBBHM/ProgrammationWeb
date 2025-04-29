import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { Reservation } from '@/data/database';

interface ReservationCardProps {
  reservation: Reservation;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onView,
  onEdit,
  onDelete,
}) => {
  const [boat, setBoat] = useState<any>(null);
  const [loadingBoat, setLoadingBoat] = useState(true);

  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const today = new Date();

  const isPast = endDate < today;
  const isFuture = startDate > today;

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadgeClass = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    }
  };

  const getStatusText = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'Confirmée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'En attente';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://127.0.0.1/reservations/${reservation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        onDelete(reservation);
        window.location.reload();
      } else {
        console.error('Failed to delete reservation');
        alert('Erreur lors de l\'annulation de la réservation. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Une erreur s\'est produite. Veuillez réessayer plus tard.');
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1/boats/${reservation.boatId}`);
        const data = await response.json();
        setBoat(data);
      } catch (error) {
        console.error('Erreur lors de la récupération du bateau:', error);
      } finally {
        setLoadingBoat(false);
      }
    };

    fetchBoatDetails();
  }, [reservation.boatId]);

  return (
    <Card className="overflow-hidden border border-black dark:border-gray-700">
      <CardContent className="p-0">
        <div className="p-4 md:p-6">
          {/* Header With Boat Name and Category */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-marine-800 dark:text-marine-200">
                {loadingBoat ? 'Chargement...' : boat?.nom_bateau || 'Nom de bateau indisponible'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {loadingBoat ? '...' : boat?.category || 'Catégorie non spécifiée'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
              {getStatusText()}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de début</p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-marine-600 dark:text-marine-400" />
                <span className="font-medium">
                  {format(startDate, 'dd MMMM yyyy', { locale: fr })}
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de fin</p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-marine-600 dark:text-marine-400" />
                <span className="font-medium">
                  {format(endDate, 'dd MMMM yyyy', { locale: fr })}
                </span>
              </p>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Prix total</p>
            <p className="font-bold text-lg text-marine-700 dark:text-marine-300">
              {reservation.totalPrice} €
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800 p-4 border-t border-black dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 hover:bg-orange-400 hover:text-white transition-colors duration-200"
          onClick={() => onView(reservation)}
        >
          <Calendar className="h-4 w-4" />
          <span>Voir détails</span>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 hover:bg-orange-400 hover:text-white transition-colors duration-200"
            disabled={!isFuture || reservation.status === 'cancelled'}
            onClick={() => onEdit(reservation)}
          >
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 hover:bg-red-600 hover:text-white transition-colors duration-200"
            disabled={!isFuture || reservation.status === 'cancelled' || isDeleting}
            onClick={() => setShowConfirmDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Annuler</span>
          </Button>
        </div>
      </CardFooter>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="sm:max-w-[425px] border border-black dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir annuler cette réservation ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La réservation sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-900"
              disabled={isDeleting}
            >
              {isDeleting ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ReservationCard;
