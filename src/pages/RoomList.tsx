
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import RoomCard from '../components/RoomCard';
import { useBooking } from '../context/BookingContext';
import { Room, RoomType } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '../components/DateRangePicker';
import { DateRange } from 'react-day-picker';

const RoomList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { checkAvailability } = useBooking();
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [sortBy, setSortBy] = useState<string>('price-asc');
  
  // Get search params
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const roomTypeParam = searchParams.get('roomType') as RoomType | null;

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    checkIn && checkOut
      ? {
          from: new Date(checkIn),
          to: new Date(checkOut),
        }
      : undefined
  );
  const [roomType, setRoomType] = useState<RoomType | 'all'>(roomTypeParam || 'all');

  // Search for available rooms when params change
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const availableRooms = checkAvailability({
        checkInDate: dateRange.from,
        checkOutDate: dateRange.to,
        ...(roomType !== 'all' ? { roomType } : {}),
      });
      setAvailableRooms(availableRooms);
    }
  }, [dateRange, roomType, checkAvailability]);

  // Update search params when filters change
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const params = new URLSearchParams();
      params.set('checkIn', dateRange.from.toISOString());
      params.set('checkOut', dateRange.to.toISOString());
      if (roomType !== 'all') {
        params.set('roomType', roomType);
      }
      setSearchParams(params);
    }
  }, [dateRange, roomType, setSearchParams]);

  // Sort rooms
  const sortedRooms = [...availableRooms].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return a.price - b.price;
    }
  });

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Handle room type change
  const handleRoomTypeChange = (value: RoomType | 'all') => {
    setRoomType(value);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>

        <div className="bg-accent p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Dates</label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Type</label>
              <Select value={roomType} onValueChange={handleRoomTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {sortedRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-gray-600">No rooms available for the selected dates</h2>
            <p className="mt-2 text-gray-500">Try a different date range or room type</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomList;
