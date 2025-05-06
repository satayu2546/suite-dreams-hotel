
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Booking, Room, AvailabilityParams } from '../types';
import { rooms } from '../data/rooms';
import { useAuth } from './AuthContext';
import { isSameDay, isWithinInterval, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';

interface BookingContextType {
  bookings: Booking[];
  userBookings: Booking[];
  createBooking: (roomId: string, checkInDate: Date, checkOutDate: Date) => void;
  cancelBooking: (bookingId: string) => void;
  checkAvailability: (params: AvailabilityParams) => Room[];
  getBooking: (bookingId: string) => Booking | undefined;
  getRoomById: (roomId: string) => Room | undefined;
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
  const { user } = useAuth();

  // Load bookings from localStorage on initial render
  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, []);

  // Get user-specific bookings
  const userBookings = bookings.filter(booking => booking.userId === user?.id);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Create a new booking
  const createBooking = (roomId: string, checkInDate: Date, checkOutDate: Date) => {
    if (!user) {
      toast.error('You must be logged in to book a room');
      return;
    }

    // Check if room is available
    const isAvailable = checkAvailability({
      checkInDate,
      checkOutDate,
      roomType: undefined,
    }).some(room => room.id === roomId);

    if (!isAvailable) {
      toast.error('This room is not available for the selected dates');
      return;
    }

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      roomId,
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [...prev, newBooking]);
    toast.success('Booking created successfully');
  };

  // Cancel a booking
  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      toast.error('Booking not found');
      return;
    }

    if (booking.userId !== user?.id) {
      toast.error('You can only cancel your own bookings');
      return;
    }

    setBookings(prev => prev.filter(b => b.id !== bookingId));
    toast.success('Booking cancelled successfully');
  };

  // Check room availability based on dates and room type
  const checkAvailability = ({ checkInDate, checkOutDate, roomType }: AvailabilityParams): Room[] => {
    // Filter rooms by type if specified
    let availableRooms = roomType 
      ? rooms.filter(room => room.type === roomType) 
      : rooms;

    // Check if room is booked during the selected dates
    return availableRooms.filter(room => {
      const roomBookings = bookings.filter(booking => booking.roomId === room.id);
      
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
  };

  // Get booking by ID
  const getBooking = (bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  };

  // Get room by ID
  const getRoomById = (roomId: string) => {
    return rooms.find(room => room.id === roomId);
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
