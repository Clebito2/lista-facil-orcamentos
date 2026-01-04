import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { ChildList, SupplierQuote } from '../types';

export const firebaseService = {
  saveChildList: async (userId: string, title: string, items: any[]) => {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'childLists'), {
        title,
        items,
        createdAt: Timestamp.now()
      });
      console.log(`Lista salva com sucesso: ${docRef.id}`);
      return { id: docRef.id, title, items };
    } catch (error) {
      console.error("Erro ao salvar lista no Firebase:", error);
      throw error;
    }
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
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'quotes'), {
        ...quote,
        createdAt: Timestamp.now()
      });
      console.log(`Orçamento salvo com sucesso: ${docRef.id}`);
      return { ...quote, id: docRef.id };
    } catch (error) {
      console.error("Erro ao salvar orçamento no Firebase:", error);
      throw error;
    }
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
  },

  updateQuoteItems: async (userId: string, id: string, items: any[], totalValue: number) => {
    await updateDoc(doc(db, 'users', userId, 'quotes', id), { items, totalValue });
  },

  // Viral Sharing Features
  shareList: async (listData: { title: string, items: any[] }) => {
    const docRef = await addDoc(collection(db, 'shared_lists'), {
      ...listData,
      createdAt: Timestamp.now(),
      shared: true
    });
    return docRef.id;
  },

  getSharedList: async (shareId: string) => {
    const docRef = doc(db, 'shared_lists', shareId);
    const docSnap = await ((await import('firebase/firestore')).getDoc(docRef));

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    } else {
      return null;
    }
  },

  importSharedList: async (userId: string, listData: { title: string, items: any[] }) => {
    // Add "(Importada)" to title to distinguish
    const newTitle = `${listData.title} (Importada)`;
    return await firebaseService.saveChildList(userId, newTitle, listData.items);
  }
};
