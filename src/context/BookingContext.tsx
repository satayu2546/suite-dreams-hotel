
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Booking, Room, AvailabilityParams, mapDbRoomToRoom, mapDbBookingToBooking } from '../types';
import { useAuth } from './AuthContext';
import { isSameDay, isWithinInterval, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

interface BookingContextType {
  bookings: Booking[];
  userBookings: Booking[];
  createBooking: (roomId: string, checkInDate: Date, checkOutDate: Date) => void;
  cancelBooking: (bookingId: string) => void;
  checkAvailability: (params: AvailabilityParams) => Promise<Room[]>;
  getBooking: (bookingId: string) => Booking | undefined;
  getRoomById: (roomId: string) => Promise<Room | undefined>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAuth();

  // Load bookings from Supabase when user changes
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  // Fetch all rooms once on initial load
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchUserBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      const fetchedBookings = data.map(mapDbBookingToBooking);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      const fetchedRooms = data.map(mapDbRoomToRoom);
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  // Get user-specific bookings
  const userBookings = user ? bookings.filter(booking => booking.userId === user.id) : [];

  // Create a new booking
  const createBooking = async (roomId: string, checkInDate: Date, checkOutDate: Date) => {
    if (!user) {
      toast.error('You must be logged in to book a room');
      return;
    }

    try {
      // Check if room is available
      const availableRooms = await checkAvailability({
        checkInDate,
        checkOutDate,
        roomType: undefined,
      });

      if (!availableRooms.some(room => room.id === roomId)) {
        toast.error('This room is not available for the selected dates');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          room_id: roomId,
          user_id: user.id,
          check_in_date: checkInDate.toISOString(),
          check_out_date: checkOutDate.toISOString()
        })
        .select();

      if (error) {
        console.error('Error creating booking:', error);
        toast.error('Failed to create booking');
        return;
      }

      if (data && data.length > 0) {
        const newBooking = mapDbBookingToBooking(data[0]);
        setBookings(prev => [...prev, newBooking]);
        toast.success('Booking created successfully');
      }
    } catch (error) {
      console.error('Error in createBooking:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string) => {
    if (!user) {
      toast.error('You must be logged in to cancel a booking');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error canceling booking:', error);
        toast.error('Failed to cancel booking');
        return;
      }

      setBookings(prev => prev.filter(b => b.id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Check room availability based on dates and room type
  const checkAvailability = async ({ checkInDate, checkOutDate, roomType }: AvailabilityParams): Promise<Room[]> => {
    try {
      // Get all bookings that might overlap with the requested dates
      const { data: allBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .or(`check_in_date.lte.${checkOutDate.toISOString()},check_out_date.gte.${checkInDate.toISOString()}`);

      if (bookingsError) {
        console.error('Error fetching bookings for availability check:', bookingsError);
        return [];
      }

      // Get all rooms (or filtered by type)
      const roomsQuery = supabase.from('rooms').select('*');
      if (roomType) {
        roomsQuery.eq('type', roomType);
      }
      
      const { data: availableRooms, error: roomsError } = await roomsQuery;

      if (roomsError) {
        console.error('Error fetching rooms for availability check:', roomsError);
        return [];
      }

      // Convert to app types
      const bookingsForCheck = allBookings.map(mapDbBookingToBooking);
      const roomsForCheck = availableRooms.map(mapDbRoomToRoom);

      // Filter out rooms that have bookings during the requested dates
      return roomsForCheck.filter(room => {
        const roomBookings = bookingsForCheck.filter(booking => booking.roomId === room.id);
        
        // Room is available if it has no bookings during the selected dates
        return !roomBookings.some(booking => {
          const bookingStart = parseISO(booking.checkInDate);
          const bookingEnd = parseISO(booking.checkOutDate);
          
          // Check for overlapping dates
          return (
            isWithinInterval(checkInDate, { start: bookingStart, end: addDays(bookingEnd, -1) }) ||
            isWithinInterval(checkOutDate, { start: addDays(bookingStart, 1), end: bookingEnd }) ||
            isWithinInterval(bookingStart, { start: checkInDate, end: checkOutDate }) ||
            isWithinInterval(bookingEnd, { start: checkInDate, end: checkOutDate }) ||
            (isSameDay(checkInDate, bookingStart) && isSameDay(checkOutDate, bookingEnd))
          );
        });
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      return [];
    }
  };

  // Get booking by ID
  const getBooking = (bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  };

  // Get room by ID
  const getRoomById = async (roomId: string): Promise<Room | undefined> => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error fetching room:', error);
        return undefined;
      }

      return mapDbRoomToRoom(data);
    } catch (error) {
      console.error('Failed to fetch room:', error);
      return undefined;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        userBookings,
        createBooking,
        cancelBooking,
        checkAvailability,
        getBooking,
        getRoomById,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
