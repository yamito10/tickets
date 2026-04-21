import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook que escucha TODOS los documentos de una colección sin filtro de usuario.
 * Utilizado para la vista de observabilidad entre usuarios.
 */
export function useAllCollection(collectionName) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
            console.warn("Firebase no está configurado.");
            setLoading(false);
            return;
        }

        const q = query(collection(db, collectionName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setData(docs);
            setLoading(false);
        }, (error) => {
            console.warn(`Error listening to all ${collectionName}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName]);

    return { data, loading };
}
