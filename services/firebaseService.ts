import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  where,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { ChildList, SupplierQuote } from '../types';

export const firebaseService = {
  saveChildList: async (userId: string, title: string, items: any[]) => {
    const docRef = await addDoc(collection(db, 'users', userId, 'childLists'), {
      title,
      items,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, title, items };
  },

  getChildLists: async (userId: string): Promise<ChildList[]> => {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'childLists'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || doc.data().childName || 'Lista sem nome', // Fallback for old data
      items: doc.data().items
    }));
  },

  deleteChildList: async (userId: string, id: string) => {
    await deleteDoc(doc(db, 'users', userId, 'childLists', id));
  },

  updateChildList: async (userId: string, id: string, title: string) => {
    await updateDoc(doc(db, 'users', userId, 'childLists', id), { title });
  },

  saveQuote: async (userId: string, quote: Omit<SupplierQuote, 'id'>) => {
    const docRef = await addDoc(collection(db, 'users', userId, 'quotes'), {
      ...quote,
      createdAt: Timestamp.now()
    });
    return { ...quote, id: docRef.id };
  },

  getQuotes: async (userId: string): Promise<SupplierQuote[]> => {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'quotes'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      supplierName: doc.data().supplierName,
      date: doc.data().date,
      items: doc.data().items,
      totalValue: doc.data().totalValue
    }));
  },

  deleteQuote: async (userId: string, id: string) => {
    await deleteDoc(doc(db, 'users', userId, 'quotes', id));
  },

  updateQuote: async (userId: string, id: string, supplierName: string) => {
    await updateDoc(doc(db, 'users', userId, 'quotes', id), { supplierName });
  }
};
