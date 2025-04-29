
import React, { useState } from 'react';
import { Calendar, MapPin, Users, Ruler, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import ReservationForm from '@/components/ReservationForm';

interface BoatDetailCardProps {
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

const BoatDetailCard: React.FC<BoatDetailCardProps> = ({
  id,
  name,
  imageUrl,
  price,
  category,
  location,
  capacity,
  length,
  year,
  motorPower,
  description,
  features,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="overflow-hidden shadow-lg border-none">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-full">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 flex flex-col">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-marine-900">{name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-marine-50 text-marine-700 border-marine-200">
                  {category}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {location}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gold-600">{price}€<span className="text-sm font-normal text-gray-500">/jour</span></p>
            </div>
          </div>

          <CardDescription className="text-gray-600 mb-6">
            {description}
          </CardDescription>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-marine-600" />
              <span><strong>{capacity}</strong> passagers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-marine-600" />
              <span><strong>{length}</strong> mètres</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-marine-600" />
              <span>Année <strong>{year}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ship className="h-4 w-4 text-marine-600" />
              <span><strong>{motorPower || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2 text-marine-800">Équipements:</h4>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-marine-700 hover:bg-marine-800">
                  Réserver maintenant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ReservationForm boatId={id} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BoatDetailCard;
