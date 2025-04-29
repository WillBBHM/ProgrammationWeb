
import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Users, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BoatCardProps {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  location: string;
  capacity: number;
  length: number;
}

const BoatCard: React.FC<BoatCardProps> = ({
  id,
  name,
  imageUrl,
  price,
  category,
  location,
  capacity,
  length,
}) => {
  return (
    <Card className="overflow-hidden boat-hover border-none shadow-lg">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-marine-800">
            {category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-marine-900 line-clamp-1">{name}</h3>
            <p className="font-bold text-gold-600">{price}€<span className="text-xs font-normal text-gray-500">/jour</span></p>
          </div>
          
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Anchor className="h-3 w-3" /> {location}
          </p>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {capacity}
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="h-3 w-3" /> {length}m
              </span>
            </div>
            <Link to={`/b/${id}`}>
              <Button size="sm" variant="outline" className="text-xs">
                Voir détails
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoatCard;
