
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reservation } from '@/data/database';
import { getBoatById } from '@/data/boats';

interface ReservationCalendarProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservation,
  isOpen,
  onOpenChange
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    reservation ? new Date(reservation.startDate) : undefined
  );

  // If no reservation is provided, don't render anything
  if (!reservation) return null;

  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const boat = getBoatById(reservation.boatId);

  // Custom CSS to style the date ranges
  const dateRangeStyles = `
    .reservation-day {
      background-color: rgba(14, 116, 144, 0.2) !important;
      color: #0e7490 !important;
    }
    .reservation-start {
      background-color: rgba(14, 116, 144, 0.8) !important;
      color: white !important;
      font-weight: bold !important;
    }
    .reservation-end {
      background-color: rgba(14, 116, 144, 0.6) !important;
      color: white !important;
      font-weight: bold !important;
    }
  `;

  return (
    <>
      <style>{dateRangeStyles}</style>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Détail de la réservation</SheetTitle>
            <SheetDescription>
              Visualisez votre séjour du {format(startDate, 'dd MMMM yyyy', {locale: fr})} au {format(endDate, 'dd MMMM yyyy', {locale: fr})}.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-marine-800 mb-2">{boat?.name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Date de début:</span> {format(startDate, 'dd MMMM yyyy', {locale: fr})}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Date de fin:</span> {format(endDate, 'dd MMMM yyyy', {locale: fr})}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Prix total:</span> {reservation.totalPrice}€
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Statut:</span>{' '}
                <span className={`${
                  reservation.status === 'confirmed' ? 'text-green-600' : 
                  reservation.status === 'cancelled' ? 'text-red-600' : 
                  'text-amber-600'
                }`}>
                  {reservation.status === 'confirmed' ? 'Confirmée' : 
                   reservation.status === 'cancelled' ? 'Annulée' : 
                   'En attente'}
                </span>
              </p>
            </div>
            
            <div className="max-w-sm mx-auto">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Calendrier de réservation</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded border pointer-events-auto"
                modifiers={{
                  reservation: (date: Date) => {
                    return date >= startDate && date <= endDate;
                  },
                  reservationStart: (date: Date) => {
                    return date.toDateString() === startDate.toDateString();
                  },
                  reservationEnd: (date: Date) => {
                    return date.toDateString() === endDate.toDateString();
                  }
                }}
                modifiersClassNames={{
                  reservation: 'reservation-day',
                  reservationStart: 'reservation-start',
                  reservationEnd: 'reservation-end'
                }}
                defaultMonth={startDate}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ReservationCalendar;
