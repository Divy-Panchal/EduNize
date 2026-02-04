import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface Topic {
    id: string;
    name: string;
    completed: boolean;
}

export interface Resource {
    id: string;
    title: string;
    url: string;
    type: 'link' | 'file' | 'video';
    fileName?: string;
    fileData?: string; // base64 encoded file data
}

export interface Subject {
    id: string;
    name: string;
    color: string;
    notes: Note[];
    topics: Topic[];
    resources: Resource[];
}

interface SubjectContextType {
    subjects: Subject[];
    addSubject: (subject: Omit<Subject, 'id' | 'notes' | 'topics' | 'resources'>) => Promise<void>;
    deleteSubject: (id: string) => Promise<void>;
    addNote: (subjectId: string, note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
    deleteNote: (subjectId: string, noteId: string) => Promise<void>;
    addTopic: (subjectId: string, topic: Omit<Topic, 'id'>) => Promise<void>;
    deleteTopic: (subjectId: string, topicId: string) => Promise<void>;
    toggleTopic: (subjectId: string, topicId: string) => Promise<void>;
    addResource: (subjectId: string, resource: Omit<Resource, 'id'>) => Promise<void>;
    deleteResource: (subjectId: string, resourceId: string) => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Load subjects from Firestore with real-time sync
    useEffect(() => {
        if (!user) {
            setSubjects([]);
            return;
        }

        const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');

        // Subscribe to real-time subject updates
        const unsubscribe = subjectService.subscribeToCollection(
            (firestoreSubjects) => {
                setSubjects(firestoreSubjects);
            },
            (error) => {
                console.error('Error loading subjects:', error);
                toast.error('Failed to load subjects. Please check your connection.');
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);

    const addSubject = async (subjectData: Omit<Subject, 'id' | 'notes' | 'topics' | 'resources'>) => {
        if (!user) {
            toast.error('You must be logged in to add subjects');
            return;
        }

        try {
            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            const newSubject: Subject = {
                ...subjectData,
                id: `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                notes: [],
                topics: [],
                resources: [],
            };
            await subjectService.setDocument(newSubject.id, newSubject);
        } catch (error) {
            console.error('Error adding subject:', error);
            toast.error('Failed to add subject. Please try again.');
        }
    };

    const deleteSubject = async (id: string) => {
        if (!user) {
            toast.error('You must be logged in to delete subjects');
            return;
        }

        try {
            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.deleteDocument(id);
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error('Failed to delete subject. Please try again.');
        }
    };

    // Note operations
    const addNote = async (subjectId: string, noteData: Omit<Note, 'id' | 'createdAt'>) => {
        if (!user) {
            toast.error('You must be logged in to add notes');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const newNote: Note = {
                ...noteData,
                id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
            };

            const updatedSubject = {
                ...subject,
                notes: [...subject.notes, newNote]
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Failed to add note. Please try again.');
        }
    };

    const deleteNote = async (subjectId: string, noteId: string) => {
        if (!user) {
            toast.error('You must be logged in to delete notes');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const updatedSubject = {
                ...subject,
                notes: subject.notes.filter(note => note.id !== noteId)
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note. Please try again.');
        }
    };

    // Topic operations
    const addTopic = async (subjectId: string, topicData: Omit<Topic, 'id'>) => {
        if (!user) {
            toast.error('You must be logged in to add topics');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const newTopic: Topic = {
                ...topicData,
                id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };

            const updatedSubject = {
                ...subject,
                topics: [...subject.topics, newTopic]
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error adding topic:', error);
            toast.error('Failed to add topic. Please try again.');
        }
    };

    const deleteTopic = async (subjectId: string, topicId: string) => {
        if (!user) {
            toast.error('You must be logged in to delete topics');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const updatedSubject = {
                ...subject,
                topics: subject.topics.filter(topic => topic.id !== topicId)
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error deleting topic:', error);
            toast.error('Failed to delete topic. Please try again.');
        }
    };

    const toggleTopic = async (subjectId: string, topicId: string) => {
        if (!user) {
            toast.error('You must be logged in to toggle topics');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const updatedSubject = {
                ...subject,
                topics: subject.topics.map(topic =>
                    topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
                )
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error toggling topic:', error);
            toast.error('Failed to toggle topic. Please try again.');
        }
    };

    // Resource operations
    const addResource = async (subjectId: string, resourceData: Omit<Resource, 'id'>) => {
        if (!user) {
            toast.error('You must be logged in to add resources');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const newResource: Resource = {
                ...resourceData,
                id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };

            const updatedSubject = {
                ...subject,
                resources: [...subject.resources, newResource]
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error adding resource:', error);
            toast.error('Failed to add resource. Please try again.');
        }
    };

    const deleteResource = async (subjectId: string, resourceId: string) => {
        if (!user) {
            toast.error('You must be logged in to delete resources');
            return;
        }

        try {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const updatedSubject = {
                ...subject,
                resources: subject.resources.filter(resource => resource.id !== resourceId)
            };

            const subjectService = new FirestoreService<Subject>(user.uid, 'subjects');
            await subjectService.setDocument(subjectId, updatedSubject);
        } catch (error) {
            console.error('Error deleting resource:', error);
            toast.error('Failed to delete resource. Please try again.');
        }
    };

    return (
        <SubjectContext.Provider value={{
            subjects,
            addSubject,
            deleteSubject,
            addNote,
            deleteNote,
            addTopic,
            deleteTopic,
            toggleTopic,
            addResource,
            deleteResource,
        }}>
            {children}
        </SubjectContext.Provider>
    );
}

export function useSubject() {
    const context = useContext(SubjectContext);
    if (!context) {
        throw new Error('useSubject must be used within SubjectProvider');
    }
    return context;
}
