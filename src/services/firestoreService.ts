import { db } from '../firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    onSnapshot,
    query,
    QueryConstraint,
} from 'firebase/firestore';

/**
 * Generic Firestore service for CRUD operations with user-specific data isolation
 * All data is stored under users/{userId}/{collectionName}
 */
export class FirestoreService<T> {
    private collectionPath: string;

    constructor(userId: string, collectionName: string) {
        this.collectionPath = `users/${userId}/${collectionName}`;
    }

    /**
     * Get a single document by ID
     */
    async getDocument(docId: string): Promise<T | null> {
        try {
            const docRef = doc(db, this.collectionPath, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            }
            return null;
        } catch (error: any) {
            // Silently handle permission errors - user may not have data yet
            if (error?.code === 'permission-denied') {
                console.warn('Firestore permission denied - user may not have data yet');
                return null;
            }
            console.error('Error getting document:', error);
            throw error;
        }
    }

    /**
     * Get all documents in the collection
     */
    async getAllDocuments(constraints?: QueryConstraint[]): Promise<T[]> {
        try {
            const collectionRef = collection(db, this.collectionPath);
            const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];
        } catch (error: any) {
            // Silently handle permission errors - user may not have data yet
            if (error?.code === 'permission-denied') {
                console.warn('Firestore permission denied - user may not have data yet');
                return [];
            }
            console.error('Error getting documents:', error);
            throw error;
        }
    }

    /**
     * Create or update a document (merge mode)
     */
    async setDocument(docId: string, data: Partial<T>): Promise<void> {
        try {
            const docRef = doc(db, this.collectionPath, docId);
            await setDoc(docRef, data, { merge: true });
        } catch (error) {
            console.error('Error setting document:', error);
            throw error;
        }
    }

    /**
     * Update specific fields in a document
     */
    async updateDocument(docId: string, data: Partial<T>): Promise<void> {
        try {
            const docRef = doc(db, this.collectionPath, docId);
            await updateDoc(docRef, data as any);
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(docId: string): Promise<void> {
        try {
            const docRef = doc(db, this.collectionPath, docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time updates for the entire collection
     * Returns an unsubscribe function
     */
    subscribeToCollection(
        callback: (data: T[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        const collectionRef = collection(db, this.collectionPath);

        const unsubscribe = onSnapshot(
            collectionRef,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as T[];
                callback(data);
            },
            (error: any) => {
                // Silently handle permission errors
                if (error?.code === 'permission-denied') {
                    console.warn('Firestore permission denied - user may not have data yet');
                    callback([]);
                    return;
                }
                console.error('Error in collection subscription:', error);
                if (onError) {
                    onError(error as Error);
                }
            }
        );

        return unsubscribe;
    }

    /**
     * Subscribe to real-time updates for a single document
     * Returns an unsubscribe function
     */
    subscribeToDocument(
        docId: string,
        callback: (data: T | null) => void,
        onError?: (error: Error) => void
    ): () => void {
        const docRef = doc(db, this.collectionPath, docId);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = { id: snapshot.id, ...snapshot.data() } as T;
                    callback(data);
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error('Error in document subscription:', error);
                if (onError) {
                    onError(error as Error);
                }
            }
        );

        return unsubscribe;
    }
}
