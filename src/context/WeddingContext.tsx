import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Wedding } from '../db/schema';
import { seedSampleWedding } from '../db/sampleData';

interface WeddingContextType {
  weddings: Wedding[] | undefined;
  activeWeddingId: string | null;
  activeWedding: Wedding | null;
  setActiveWeddingId: (id: string | null) => void;
  createWedding: (wedding: Wedding) => Promise<string>;
  updateWedding: (wedding: Wedding) => Promise<void>;
  deleteWedding: (id: string) => Promise<void>;
  loadSample: () => Promise<string>;
  isLoading: boolean;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

const ACTIVE_WEDDING_STORAGE_KEY = 'vivah_active_wedding_id';

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const weddings = useLiveQuery(() => db.weddings.orderBy('createdAt').reverse().toArray());
  const [activeWeddingId, setActiveWeddingIdState] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_WEDDING_STORAGE_KEY);
  });

  const setActiveWeddingId = (id: string | null) => {
    setActiveWeddingIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_WEDDING_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_WEDDING_STORAGE_KEY);
    }
  };

  // If activeWeddingId does not exist in weddings, reset or fallback
  useEffect(() => {
    if (weddings && weddings.length > 0) {
      if (!activeWeddingId || !weddings.some((w) => w.id === activeWeddingId)) {
        // Keep activeWeddingId if user is on dashboard, or auto-select first
      }
    } else if (weddings && weddings.length === 0 && activeWeddingId) {
      setActiveWeddingId(null);
    }
  }, [weddings, activeWeddingId]);

  const activeWedding = weddings?.find((w) => w.id === activeWeddingId) || null;

  const createWedding = async (wedding: Wedding): Promise<string> => {
    await db.weddings.put(wedding);
    setActiveWeddingId(wedding.id);
    return wedding.id;
  };

  const updateWedding = async (wedding: Wedding): Promise<void> => {
    await db.weddings.put({ ...wedding, updatedAt: Date.now() });
  };

  const deleteWedding = async (id: string): Promise<void> => {
    await db.transaction('rw', db.tables, async () => {
      await db.weddings.delete(id);
      await db.events.where('weddingId').equals(id).delete();
      await db.familyMembers.where('weddingId').equals(id).delete();
      await db.guestParties.where('weddingId').equals(id).delete();
      await db.guests.where('weddingId').equals(id).delete();
      await db.eventRsvps.where('weddingId').equals(id).delete();
      await db.hotels.where('weddingId').equals(id).delete();
      await db.rooms.where('weddingId').equals(id).delete();
      await db.roomAllocations.where('weddingId').equals(id).delete();
      await db.travelItems.where('weddingId').equals(id).delete();
      await db.vehicles.where('weddingId').equals(id).delete();
      await db.vehicleSeats.where('weddingId').equals(id).delete();
      await db.seatingPlans.where('weddingId').equals(id).delete();
      await db.eInvites.where('weddingId').equals(id).delete();
    });
    if (activeWeddingId === id) {
      setActiveWeddingId(null);
    }
  };

  const loadSample = async (): Promise<string> => {
    const id = await seedSampleWedding();
    setActiveWeddingId(id);
    return id;
  };

  return (
    <WeddingContext.Provider
      value={{
        weddings,
        activeWeddingId,
        activeWedding,
        setActiveWeddingId,
        createWedding,
        updateWedding,
        deleteWedding,
        loadSample,
        isLoading: weddings === undefined,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
