import { subscribeProperties } from './usePropertiesStore';
import { subscribeUnits } from './useUnitsStore';
import { subscribeGuests } from './useGuestsStore';

/** Call after anonymous auth is ready. */
export function startFirestoreSubscriptions(): () => void {
  const unsubProperties = subscribeProperties();
  const unsubUnits = subscribeUnits();
  const unsubGuests = subscribeGuests();
  return () => {
    unsubProperties();
    unsubUnits();
    unsubGuests();
  };
}

export { usePropertiesStore, addProperty, updateProperty, deleteProperty } from './usePropertiesStore';
export { useUnitsStore, addUnit } from './useUnitsStore';
export {
  useGuestsStore,
  addGuest,
  updateGuest,
  getGuest,
  deleteGuest,
} from './useGuestsStore';
