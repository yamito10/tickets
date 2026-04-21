import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Guardar perfil del usuario en Firestore para que otros puedan verlo
            if (currentUser) {
                try {
                    await setDoc(doc(db, 'users', currentUser.uid), {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario',
                        lastLogin: new Date().toISOString(),
                        photoURL: currentUser.photoURL || null
                    }, { merge: true });
                } catch (error) {
                    console.warn('No se pudo guardar perfil de usuario:', error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    return { user, loading, logout };
}
