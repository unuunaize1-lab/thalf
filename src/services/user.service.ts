import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, SavedAddress } from '@/types';

export const UserService = {
  /**
   * Fetch complete user profile details.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { uid, ...docSnap.data() } as UserProfile;
  },

  /**
   * Save or update an address inside the customer's address book list.
   */
  async saveAddress(uid: string, address: SavedAddress): Promise<void> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('User profile not found.');

    const profile = docSnap.data() as UserProfile;
    let savedAddresses = [...(profile.savedAddresses || [])];

    // If new address is marked as default, clear other default states
    if (address.isDefault) {
      savedAddresses = savedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    const existingIdx = savedAddresses.findIndex(addr => addr.id === address.id);
    if (existingIdx !== -1) {
      savedAddresses[existingIdx] = address;
    } else {
      savedAddresses.push(address);
    }

    // Double check: if it is the first address, ensure it's set as default
    if (savedAddresses.length === 1) {
      savedAddresses[0].isDefault = true;
    }

    await updateDoc(docRef, {
      savedAddresses,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Delete an address from the customer's address book.
   */
  async deleteAddress(uid: string, addressId: string): Promise<void> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('User profile not found.');

    const profile = docSnap.data() as UserProfile;
    const savedAddresses = (profile.savedAddresses || []).filter(addr => addr.id !== addressId);

    // If we deleted a default address and have others remaining, mark first one as default
    if (savedAddresses.length > 0 && !savedAddresses.some(addr => addr.isDefault)) {
      savedAddresses[0].isDefault = true;
    }

    await updateDoc(docRef, {
      savedAddresses,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Increment or decrement customer loyalty reward points balance.
   */
  async updateLoyaltyPoints(uid: string, pointsDelta: number): Promise<void> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('User profile not found.');

    const profile = docSnap.data() as UserProfile;
    const newPoints = Math.max(0, (profile.loyaltyPoints || 0) + pointsDelta);

    await updateDoc(docRef, {
      loyaltyPoints: newPoints,
      updatedAt: serverTimestamp(),
    });
  },
};
