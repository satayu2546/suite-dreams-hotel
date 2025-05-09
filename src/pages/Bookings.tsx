
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Room } from '../types';

const Bookings = () => {
  const { userBookings, cancelBooking, getRoomById } = useBooking();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [roomsData, setRoomsData] = useState<Record<string, Room | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch room details for each booking
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setIsLoading(true);
      const roomPromises = userBookings.map(async (booking) => {
        const room = await getRoomById(booking.roomId);
        return { roomId: booking.roomId, room };
      });

      try {
        const results = await Promise.all(roomPromises);
        const roomsMap: Record<string, Room | null> = {};
        results.forEach(({ roomId, room }) => {
          roomsMap[roomId] = room;
        });
        
        setRoomsData(roomsMap);
      } catch (error) {
        console.error('Error fetching room details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userBookings.length > 0) {
      fetchRoomDetails();
    } else {
      setIsLoading(false);
    }
  }, [userBookings, getRoomById]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : userBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBookings.map((booking) => {
              const room = roomsData[booking.roomId];
              return room ? (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Check-in</span>
                        <span>{format(parseISO(booking.checkInDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Check-out</span>
                        <span>{format(parseISO(booking.checkOutDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Room Type</span>
                        <span className="capitalize">{room.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Price</span>
                        <span className="font-semibold">
                          $
                          {room.price *
                            Math.ceil(
                              (new Date(booking.checkOutDate).getTime() -
                                new Date(booking.checkInDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/rooms/${room.id}`)}
                    >
                      View Room
                    </Button>
                  </CardFooter>
                </Card>
              ) : null;
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium text-gray-600 mb-4">No bookings found</h2>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet</p>
            <Link to="/rooms">
              <Button>Browse Rooms</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;
