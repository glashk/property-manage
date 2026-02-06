import { create } from 'zustand';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { COLLECTIONS } from '@/src/lib/collections';
import type { Unit } from '@/src/types/models';

type UnitsState = {
  units: Unit[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
};

export const useUnitsStore = create<UnitsState>(() => ({
  units: [],
  isLoading: true,
  error: null,
  unsubscribe: null,
}));

/** Subscribe to all units; filter by propertyId in components. */
export function subscribeUnits(): () => void {
  const q = query(
    collection(db, COLLECTIONS.units),
    orderBy('name')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Unit[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Unit);
      });
      useUnitsStore.setState({
        units: list,
        isLoading: false,
        error: null,
      });
    },
    (err) => {
      console.error('Units subscription error', err);
      useUnitsStore.setState({
        isLoading: false,
        error: err.message ?? 'Failed to load units',
      });
    }
  );
  useUnitsStore.setState({ unsubscribe });
  return unsubscribe;
}

export async function addUnit(propertyId: string, name: string): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.units), {
    propertyId,
    name: name.trim(),
  });
  return ref.id;
}
