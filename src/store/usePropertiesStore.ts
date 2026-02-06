import { create } from 'zustand';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { COLLECTIONS } from '@/src/lib/collections';
import type { Property } from '@/src/types/models';

type PropertiesState = {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
};

export const usePropertiesStore = create<PropertiesState>(() => ({
  properties: [],
  isLoading: true,
  error: null,
  unsubscribe: null,
}));

export function subscribeProperties(): () => void {
  const q = query(
    collection(db, COLLECTIONS.properties),
    orderBy('name')
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Property[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Property);
      });
      usePropertiesStore.setState({
        properties: list,
        isLoading: false,
        error: null,
      });
    },
    (err) => {
      console.error('Properties subscription error', err);
      usePropertiesStore.setState({
        isLoading: false,
        error: err.message ?? 'Failed to load properties',
      });
    }
  );
  usePropertiesStore.setState({ unsubscribe });
  return unsubscribe;
}

export async function addProperty(input: { name: string; city: string }): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.properties), {
    name: input.name.trim(),
    city: input.city.trim(),
  });
  return ref.id;
}

export async function updateProperty(id: string, input: { name: string; city: string }): Promise<void> {
  const ref = doc(db, COLLECTIONS.properties, id);
  await updateDoc(ref, {
    name: input.name.trim(),
    city: input.city.trim(),
  });
}

export async function deleteProperty(id: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.properties, id);
  await deleteDoc(ref);
}
