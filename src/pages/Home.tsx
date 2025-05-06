
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoomType } from '../types';
import { useNavigate } from 'react-router-dom';
import DateRangePicker from '../components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

const Home = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [roomType, setRoomType] = useState<RoomType | ''>('');

  const handleSearch = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    const queryParams = new URLSearchParams({
      checkIn: dateRange.from.toISOString(),
      checkOut: dateRange.to.toISOString(),
      ...(roomType && { roomType }),
    });

    navigate(`/rooms?${queryParams.toString()}`);
  };

  return (
    <Layout>
      <div className="relative">
        <div className="h-[600px] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
            alt="Luxury hotel room"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fadeIn">
              Experience Luxury Stays
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mb-8 animate-fadeIn">
              Book your perfect room for June 2025 and enjoy an unforgettable experience
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 relative -mt-24">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dates</label>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Type</label>
                  <Select value={roomType} onValueChange={(value: RoomType | '') => setRoomType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full" onClick={handleSearch}>
                    Search Rooms
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FutureStay?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the best in hospitality with our modern amenities and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-accent">
              <div className="text-primary text-4xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">Find our rooms at the best rates, guaranteed.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-accent">
              <div className="text-primary text-4xl mb-4">♨</div>
              <h3 className="text-xl font-semibold mb-2">Premium Amenities</h3>
              <p className="text-gray-600">Enjoy luxury amenities in all our room types.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-accent">
              <div className="text-primary text-4xl mb-4">⚑</div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure booking process with no hidden fees.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
