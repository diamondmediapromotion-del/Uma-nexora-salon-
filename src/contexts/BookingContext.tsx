import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShopService, ShopStaff, Shop } from '../types';

interface BookingDraft {
  shopId: string | null;
  shop: Shop | null;
  selectedServices: ShopService[];
  selectedStaff: ShopStaff | 'any' | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // HH:MM AM/PM
}

interface BookingContextType {
  bookingDraft: BookingDraft;
  setShop: (shop: Shop) => void;
  setSelectedServices: (services: ShopService[]) => void;
  setSelectedStaff: (staff: ShopStaff | 'any' | null) => void;
  setDateTime: (date: string, time: string) => void;
  resetBooking: () => void;
  totalPrice: number;
  totalDuration: number;
}

const initialDraft: BookingDraft = {
  shopId: null,
  shop: null,
  selectedServices: [],
  selectedStaff: null,
  selectedDate: null,
  selectedTime: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(() => {
    const saved = localStorage.getItem('nexora_booking_draft');
    return saved ? JSON.parse(saved) : initialDraft;
  });

  useEffect(() => {
    localStorage.setItem('nexora_booking_draft', JSON.stringify(bookingDraft));
  }, [bookingDraft]);

  const setShop = (shop: Shop) => {
    setBookingDraft(prev => ({
      ...prev,
      shopId: shop.id,
      shop: shop,
      // Reset flow if switching shops
      selectedServices: prev.shopId === shop.id ? prev.selectedServices : [],
      selectedStaff: prev.shopId === shop.id ? prev.selectedStaff : null,
      selectedDate: prev.shopId === shop.id ? prev.selectedDate : null,
      selectedTime: prev.shopId === shop.id ? prev.selectedTime : null,
    }));
  };

  const setSelectedServices = (services: ShopService[]) => {
    setBookingDraft(prev => ({ ...prev, selectedServices: services }));
  };

  const setSelectedStaff = (staff: ShopStaff | 'any' | null) => {
    setBookingDraft(prev => ({ ...prev, selectedStaff: staff }));
  };

  const setDateTime = (date: string, time: string) => {
    setBookingDraft(prev => ({ ...prev, selectedDate: date, selectedTime: time }));
  };

  const resetBooking = () => {
    setBookingDraft(initialDraft);
    localStorage.removeItem('nexora_booking_draft');
  };

  const totalPrice = bookingDraft.selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = bookingDraft.selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <BookingContext.Provider value={{ 
      bookingDraft, 
      setShop, 
      setSelectedServices, 
      setSelectedStaff, 
      setDateTime, 
      resetBooking,
      totalPrice,
      totalDuration
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
