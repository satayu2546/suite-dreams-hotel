
export interface User {
  id: string;
  email: string;
  name: string;
}

export type RoomType = 'single' | 'double';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  price: number;
  description: string;
  amenities: string[];
  image: string;
  capacity: number;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface AvailabilityParams {
  checkInDate: Date;
  checkOutDate: Date;
  roomType?: RoomType;
}

// Helper functions to convert between Supabase DB types and our application types
export const mapDbRoomToRoom = (dbRoom: any): Room => {
  return {
    id: dbRoom.id,
    name: dbRoom.name,
    type: dbRoom.type as RoomType,
    price: Number(dbRoom.price),
    description: dbRoom.description,
    amenities: Array.isArray(dbRoom.amenities) ? dbRoom.amenities : [],
    image: dbRoom.image,
    capacity: dbRoom.capacity
  };
};

export const mapDbBookingToBooking = (dbBooking: any): Booking => {
  return {
    id: dbBooking.id,
    userId: dbBooking.user_id,
    roomId: dbBooking.room_id,
    checkInDate: dbBooking.check_in_date,
    checkOutDate: dbBooking.check_out_date,
    createdAt: dbBooking.created_at
  };
};
