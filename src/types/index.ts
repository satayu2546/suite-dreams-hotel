
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
