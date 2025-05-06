
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Room } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DateRangePicker from '../components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

const RoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const { getRoomById, createBooking, checkAvailability } = useBooking();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get check-in and check-out dates from URL params
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    checkIn && checkOut
      ? {
          from: new Date(checkIn),
          to: new Date(checkOut),
        }
      : undefined
  );

  useEffect(() => {
    if (roomId) {
      const roomData = getRoomById(roomId);
      if (roomData) {
        setRoom(roomData);
      }
    }
  }, [roomId, getRoomById]);

  useEffect(() => {
    checkRoomAvailability();
  }, [dateRange, room]);

  const checkRoomAvailability = () => {
    if (!dateRange?.from || !dateRange?.to || !room) return;

    const availableRooms = checkAvailability({
      checkInDate: dateRange.from,
      checkOutDate: dateRange.to,
    });

    setIsAvailable(availableRooms.some(r => r.id === roomId));
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book this room');
      navigate('/login');
      return;
    }

    if (!dateRange?.from || !dateRange?.to || !roomId) {
      toast.error('Please select valid dates');
      return;
    }

    setIsLoading(true);
    try {
      createBooking(roomId, dateRange.from, dateRange.to);
      navigate('/bookings');
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Room not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">{room.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden mb-6">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-[400px] object-cover"
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={room.type === 'single' ? 'outline' : 'default'}>
                  {room.type === 'single' ? 'Single Room' : 'Double Room'}
                </Badge>
                <Badge variant="outline">{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</Badge>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700">{room.description}</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-md bg-accent"
                  >
                    <span className="text-primary">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-2xl font-bold">${room.price}<span className="text-sm font-normal text-gray-500"> / night</span></p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium">Select Dates</label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                    />
                  </div>

                  {dateRange?.from && dateRange?.to && (
                    <div className="py-4 border-t border-b">
                      <div className="flex justify-between mb-2">
                        <span>Price per night</span>
                        <span>${room.price}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Nights</span>
                        <span>
                          {Math.ceil(
                            (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                        <span>Total</span>
                        <span>
                          $
                          {room.price *
                            Math.ceil(
                              (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
                            )}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={!isAvailable || !dateRange?.from || !dateRange?.to || isLoading}
                    onClick={handleBooking}
                  >
                    {isLoading
                      ? 'Processing...'
                      : !dateRange?.from || !dateRange?.to
                      ? 'Select Dates'
                      : isAvailable
                      ? 'Book Now'
                      : 'Not Available'}
                  </Button>

                  {!isAvailable && dateRange?.from && dateRange?.to && (
                    <p className="text-destructive text-sm text-center">
                      This room is not available for the selected dates
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoomDetail;
