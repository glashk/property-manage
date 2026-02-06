export type Property = {
  id: string;
  name: string;
  city: string;
};

export type Unit = {
  id: string;
  propertyId: string;
  name: string;
};

export type GuestSource = 'Booking' | 'Airbnb' | 'Direct';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type Guest = {
  id: string;
  fullName: string;
  phone: string;
  checkIn: number; // timestamp ms
  checkOut: number;
  propertyId: string;
  unitId: string;
  source: GuestSource;
  notes: string;
  paymentStatus: PaymentStatus;
  createdAt: number;
  /** Booking/rent income (optional). Used for Finance tracking. */
  price?: number;
};

export const GUEST_SOURCES: GuestSource[] = ['Booking', 'Airbnb', 'Direct'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['paid', 'partial', 'unpaid'];
