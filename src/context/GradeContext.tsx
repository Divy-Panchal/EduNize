import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Grade, SubjectGrade, GradeStats, getLetterGrade } from '../types/grade';
import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

interface GradeContextType {
    grades: Grade[];
    addGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
    updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
    deleteGrade: (id: string) => Promise<void>;
    getGradeStats: () => GradeStats;
    getSubjectGrades: (subjectId: string) => Grade[];
    gradingSystem: 'college' | 'school';
    setGradingSystem: (system: 'college' | 'school') => Promise<void>;
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

interface GradingSystemSettings {
    gradingSystem: 'college' | 'school';
}

export function GradeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [gradingSystem, setGradingSystemState] = useState<'college' | 'school'>('college');

    // Load data from Firestore on mount with real-time sync
    useEffect(() => {
        if (!user) {
            setGrades([]);
            setGradingSystemState('college');
            return;
        }

        const gradeService = new FirestoreService<Grade>(user.uid, 'grades');
        const settingsService = new FirestoreService<GradingSystemSettings>(user.uid, 'settings');

        // Subscribe to real-time grade updates
        const unsubscribeGrades = gradeService.subscribeToCollection(
            (firestoreGrades) => {
                setGrades(firestoreGrades);
            },
            (error) => {
                console.error('Error loading grades:', error);
                toast.error('Failed to load grades. Please check your connection.');
            }
        );

        // Load grading system preference
        const loadGradingSystem = async () => {
            try {
                const settings = await settingsService.getDocument('preferences');
                if (settings?.gradingSystem) {
                    setGradingSystemState(settings.gradingSystem);
                }
            } catch (error) {
                console.error('Error loading grading system preference:', error);
            }
        };
        loadGradingSystem();

        return () => {
            unsubscribeGrades();
        };
    }, [user]);

    const setGradingSystem = async (system: 'college' | 'school') => {
        setGradingSystemState(system);
        if (user) {
            try {
                const settingsService = new FirestoreService<GradingSystemSettings>(user.uid, 'settings');
                await settingsService.setDocument('preferences', { gradingSystem: system });
            } catch (error) {
                console.error('Error saving grading system preference:', error);
                toast.error('Failed to save grading system preference');
            }
        }
    };


    const addGrade = async (gradeData: Omit<Grade, 'id'>) => {
        if (!user) {
            toast.error('You must be logged in to add grades');
            return;
        }

        try {
            const gradeService = new FirestoreService<Grade>(user.uid, 'grades');
            const newGrade: Grade = {
                ...gradeData,
                id: `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            await gradeService.setDocument(newGrade.id, newGrade);
        } catch (error) {
            console.error('Error adding grade:', error);
            toast.error('Failed to add grade. Please try again.');
        }
    };

    const updateGrade = async (id: string, gradeData: Partial<Grade>) => {
        if (!user) {
            toast.error('You must be logged in to update grades');
            return;
        }

        try {
            const gradeService = new FirestoreService<Grade>(user.uid, 'grades');
            await gradeService.updateDocument(id, gradeData);
        } catch (error) {
            console.error('Error updating grade:', error);
            toast.error('Failed to update grade. Please try again.');
        }
    };

    const deleteGrade = async (id: string) => {
        if (!user) {
            toast.error('You must be logged in to delete grades');
            return;
        }

        try {
            const gradeService = new FirestoreService<Grade>(user.uid, 'grades');
            await gradeService.deleteDocument(id);
        } catch (error) {
            console.error('Error deleting grade:', error);
            toast.error('Failed to delete grade. Please try again.');
        }
    };


    const getSubjectGrades = (subjectId: string): Grade[] => {
        return grades.filter(grade => grade.subjectId === subjectId);
    };

    const calculateSubjectAverage = (subjectGrades: Grade[]): number => {
        if (subjectGrades.length === 0) return 0;

        const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);

        if (totalWeight === 0) {
            // If no weights, use simple average
            const totalPercentage = subjectGrades.reduce(
                (sum, grade) => {
                    // Prevent division by zero
                    if (grade.maxScore === 0) {
                        console.warn('Grade with maxScore of 0 detected, skipping');
                        return sum;
                    }
                    return sum + (grade.score / grade.maxScore) * 100;
                },
                0
            );
            const validGrades = subjectGrades.filter(g => g.maxScore > 0).length;
            return validGrades > 0 ? totalPercentage / validGrades : 0;
        }

        // Weighted average
        const weightedSum = subjectGrades.reduce(
            (sum, grade) => {
                // Prevent division by zero
                if (grade.maxScore === 0) {
                    console.warn('Grade with maxScore of 0 detected, skipping');
                    return sum;
                }
                return sum + ((grade.score / grade.maxScore) * 100 * grade.weight);
            },
            0
        );
        return weightedSum / totalWeight;
    };

    const getGradeStats = (): GradeStats => {
        // Group grades by subject
        const subjectMap = new Map<string, Grade[]>();
        grades.forEach(grade => {
            const existing = subjectMap.get(grade.subjectId) || [];
            subjectMap.set(grade.subjectId, [...existing, grade]);
        });

        // Calculate subject grades
        const subjectGrades: SubjectGrade[] = Array.from(subjectMap.entries()).map(
            ([subjectId, subjectGradesList]) => {
                const average = calculateSubjectAverage(subjectGradesList);
                return {
                    subjectId,
                    subjectName: subjectGradesList[0]?.subjectName || 'Unknown',
                    grades: subjectGradesList,
                    average,
                    letterGrade: getLetterGrade(average),
                    color: getSubjectColor(average),
                };
            }
        );

        // Calculate overall stats
        const overallPercentage =
            subjectGrades.length > 0
                ? subjectGrades.reduce((sum, sg) => sum + sg.average, 0) / subjectGrades.length
                : 0;

        const overallGPA = percentageToGPA(overallPercentage);
        const letterGrade = getLetterGrade(overallPercentage);

        // Calculate trend (simple: compare last 5 grades to previous 5)
        const sortedGrades = [...grades].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const recentGrades = sortedGrades.slice(0, 5);
        const olderGrades = sortedGrades.slice(5, 10);

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentGrades.length > 0 && olderGrades.length > 0) {
            const recentAvg =
                recentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
                recentGrades.length;
            const olderAvg =
                olderGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
                olderGrades.length;

            if (recentAvg > olderAvg + 2) trend = 'improving';
            else if (recentAvg < olderAvg - 2) trend = 'declining';
        }

        return {
            overallGPA,
            overallPercentage,
            letterGrade,
            subjectGrades,
            trend,
        };
    };

    return (
        <GradeContext.Provider
            value={{
                grades,
                addGrade,
                updateGrade,
                deleteGrade,
                getGradeStats,
                getSubjectGrades,
                gradingSystem,
                setGradingSystem,
            }}
        >
            {children}
        </GradeContext.Provider>
    );
}

export function useGrade() {
    const context = useContext(GradeContext);
    if (!context) {
        throw new Error('useGrade must be used within GradeProvider');
    }
    return context;
}

// Helper functions
function percentageToGPA(percentage: number): number {
    // CGPA conversion using international 10.0 scale
    // Linear mapping: CGPA ≈ percentage / 10
    if (percentage >= 95) return 10.0;  // Outstanding (95-100)
    if (percentage >= 90) return 9.5;   // Excellent (90-94)
    if (percentage >= 85) return 9.0;   // Very Good (85-89)
    if (percentage >= 80) return 8.5;   // Good (80-84)
    if (percentage >= 75) return 8.0;   // Above Average (75-79)
    if (percentage >= 70) return 7.5;   // Average (70-74)
    if (percentage >= 65) return 7.0;   // Satisfactory (65-69)
    if (percentage >= 60) return 6.5;   // Pass (60-64)
    if (percentage >= 55) return 6.0;   // Pass (55-59)
    if (percentage >= 50) return 5.5;   // Pass (50-54)
    if (percentage >= 45) return 5.0;   // Below Average (45-49)
    if (percentage >= 40) return 4.5;   // Poor (40-44)
    if (percentage >= 35) return 4.0;   // Very Poor (35-39)
    return percentage / 10;  // Below 35: proportional to percentage
}

function getSubjectColor(average: number): string {
    if (average >= 90) return 'emerald';
    if (average >= 80) return 'blue';
    if (average >= 70) return 'amber';
    return 'red';
}
