import { create } from 'zustand';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { COLLECTIONS } from '@/src/lib/collections';
import type { Guest, GuestSource, PaymentStatus } from '@/src/types/models';

type GuestsState = {
  guests: Guest[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
};

export const useGuestsStore = create<GuestsState>(() => ({
  guests: [],
  isLoading: true,
  error: null,
  unsubscribe: null,
}));

export function subscribeGuests(): () => void {
  const q = query(
    collection(db, COLLECTIONS.guests),
    orderBy('checkIn', 'desc')
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Guest[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          fullName: d.fullName ?? '',
          phone: d.phone ?? '',
          checkIn: d.checkIn ?? 0,
          checkOut: d.checkOut ?? 0,
          propertyId: d.propertyId ?? '',
          unitId: d.unitId ?? '',
          source: (d.source ?? 'Direct') as GuestSource,
          notes: d.notes ?? '',
          paymentStatus: (d.paymentStatus ?? 'unpaid') as PaymentStatus,
          createdAt: d.createdAt?.toMillis?.() ?? d.createdAt ?? 0,
          price: typeof d.price === 'number' ? d.price : undefined,
        });
      });
      useGuestsStore.setState({
        guests: list,
        isLoading: false,
        error: null,
      });
    },
    (err) => {
      console.error('Guests subscription error', err);
      useGuestsStore.setState({
        isLoading: false,
        error: err.message ?? 'Failed to load guests',
      });
    }
  );
  useGuestsStore.setState({ unsubscribe });
  return unsubscribe;
}

type AddGuestInput = {
  fullName: string;
  phone: string;
  checkIn: number;
  checkOut: number;
  propertyId: string;
  unitId: string;
  source: GuestSource;
  notes: string;
  paymentStatus?: PaymentStatus;
  price?: number;
};

export async function addGuest(input: AddGuestInput): Promise<string> {
  const coll = collection(db, COLLECTIONS.guests);
  const ref = await addDoc(coll, {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGuest(
  guestId: string,
  updates: Partial<Omit<Guest, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.guests, guestId);
  await updateDoc(ref, updates as Record<string, unknown>);
}

export async function getGuest(guestId: string): Promise<Guest | null> {
  const ref = doc(db, COLLECTIONS.guests, guestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    fullName: d.fullName ?? '',
    phone: d.phone ?? '',
    checkIn: d.checkIn ?? 0,
    checkOut: d.checkOut ?? 0,
    propertyId: d.propertyId ?? '',
    unitId: d.unitId ?? '',
    source: (d.source ?? 'Direct') as GuestSource,
    notes: d.notes ?? '',
    paymentStatus: (d.paymentStatus ?? 'unpaid') as PaymentStatus,
    createdAt: d.createdAt?.toMillis?.() ?? d.createdAt ?? 0,
    price: typeof d.price === 'number' ? d.price : undefined,
  };
}

export async function deleteGuest(guestId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.guests, guestId);
  await deleteDoc(ref);
}
