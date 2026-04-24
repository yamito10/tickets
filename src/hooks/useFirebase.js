import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useFirebaseCollection(collectionName, userId) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
       console.warn("Firebase no está configurado. Revisa tu archivo .env.local");
       return;
    }

    if (!userId) {
        setData([]);
        return;
    }

    // Filtrar por el userId del usuario autenticado
    const q = query(collection(db, collectionName), where("userId", "==", userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(docs);
    }, (error) => {
      console.warn(`Error listening to collection ${collectionName}:`, error);
    });

    return () => unsubscribe();
  }, [collectionName, userId]);

  const addOrUpdateItem = async (item) => {
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY || !userId) return false;
      
      const docRef = doc(db, collectionName, item.id);
      // Asegurarnos de que el item tenga el userId al guardar
      await setDoc(docRef, { ...item, userId });
      return true;
    } catch (error) {
      console.error(`Error saving to ${collectionName}:`, error);
      return false;
    }
  };

  const deleteItem = async (id) => {
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY || !userId) return false;
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      return false;
    }
  };

  return { data, addOrUpdateItem, deleteItem };
}
