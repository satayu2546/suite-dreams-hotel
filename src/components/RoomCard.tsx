
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Room } from '../types';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-video overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <Badge variant={room.type === 'single' ? 'outline' : 'default'}>
            {room.type === 'single' ? 'Single' : 'Double'}
          </Badge>
        </div>
        <CardDescription>
          {room.description.length > 80 
            ? `${room.description.substring(0, 80)}...` 
            : room.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mt-2">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="font-medium">
          <span className="text-lg">${room.price}</span>
          <span className="text-sm text-gray-500"> / night</span>
        </div>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate(`/rooms/${room.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
