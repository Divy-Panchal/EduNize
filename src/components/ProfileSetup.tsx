import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, School, GraduationCap, ArrowRight, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileSetupProps {
    onComplete: (data: ProfileData) => void;
}

interface ProfileData {
    fullName: string;
    class: string;
    institution: string;
    phone: string;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
    const [formData, setFormData] = useState<ProfileData>({
        fullName: '',
        class: '',
        institution: '',
        phone: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !formData.class.trim() || !formData.institution.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        onComplete(formData);
    };

    const handleSkip = () => {
        // Pass minimal data when skipping
        onComplete({
            fullName: '',
            class: '',
            institution: '',
            phone: '',
        });
        toast.success('Profile setup skipped. You can update your profile anytime!');
    };

    return (
        <div className="min-h-screen blue-background relative overflow-hidden">
            {/* Enhanced floating dots - more variety */}
            <div className="floating-dot dot-white w-3 h-3 top-[10%] left-[5%] animate-float-slow" />
            <div className="floating-dot dot-outline w-4 h-4 top-[8%] left-[8%] animate-pulse-slow" />
            <div className="floating-dot dot-white w-2 h-2 top-[15%] right-[10%] animate-float-medium" />
            <div className="floating-dot dot-outline w-5 h-5 top-[20%] right-[5%] animate-float-slow" style={{ animationDelay: '1s' }} />
            <div className="floating-dot dot-filled-light w-3 h-3 bottom-[15%] left-[8%] animate-float-medium" style={{ animationDelay: '0.5s' }} />
            <div className="floating-dot dot-white w-2 h-2 bottom-[10%] right-[12%] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            <div className="floating-dot dot-outline w-3 h-3 top-[50%] left-[3%] animate-float-slow" style={{ animationDelay: '2s' }} />
            <div className="floating-dot dot-white w-2 h-2 bottom-[30%] right-[5%] animate-float-medium" style={{ animationDelay: '0.8s' }} />

            {/* Additional floating elements for more dynamism */}
            <div className="floating-dot dot-white w-4 h-4 top-[35%] right-[15%] animate-float-slow" style={{ animationDelay: '1.2s' }} />
            <div className="floating-dot dot-outline w-3 h-3 top-[60%] left-[12%] animate-pulse-slow" style={{ animationDelay: '0.3s' }} />
            <div className="floating-dot dot-filled-light w-2 h-2 top-[25%] left-[20%] animate-float-medium" style={{ animationDelay: '1.8s' }} />
            <div className="floating-dot dot-white w-3 h-3 bottom-[40%] right-[20%] animate-float-slow" style={{ animationDelay: '2.5s' }} />
            <div className="floating-dot dot-outline w-2 h-2 top-[70%] right-[8%] animate-pulse-slow" style={{ animationDelay: '1.1s' }} />
            <div className="floating-dot dot-filled-light w-4 h-4 bottom-[25%] left-[15%] animate-float-medium" style={{ animationDelay: '0.7s' }} />

            {/* Animated gradient orbs for depth */}
            <motion.div
                animate={{
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[10%] w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-2xl"
            />
            <motion.div
                animate={{
                    y: [0, 25, 0],
                    x: [0, -15, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-gradient-to-br from-cyan-400/25 to-blue-500/25 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    x: [0, 15, 0],
                    scale: [1, 1.15, 1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[50%] right-[5%] w-36 h-36 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl"
            />

            {/* Pulsing accent circles */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[30%] left-[25%] w-20 h-20 bg-white/20 rounded-full blur-xl"
            />
            <motion.div
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-[35%] right-[30%] w-24 h-24 bg-white/15 rounded-full blur-xl"
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                    className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                        >
                            <User className="w-8 h-8 text-white" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
                        >
                            Welcome to EduNize! 👋
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-600 text-sm md:text-base"
                        >
                            Let's set up your profile to get started
                        </motion.p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <User size={18} className="text-blue-600" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </motion.div>

                        {/* Class/Grade */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <GraduationCap size={18} className="text-blue-600" />
                                Class / Year
                            </label>
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleInputChange}
                                placeholder="e.g., 10th Grade, 2nd Year, etc."
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </motion.div>

                        {/* University/School */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <School size={18} className="text-blue-600" />
                                University / School Name
                            </label>
                            <input
                                type="text"
                                name="institution"
                                value={formData.institution}
                                onChange={handleInputChange}
                                placeholder="Enter your institution name"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </motion.div>

                        {/* Phone Number (Optional) */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <Phone size={18} className="text-blue-600" />
                                Phone Number <span className="text-xs text-gray-600">(Optional)</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="e.g., +91 98765 43210"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
                        >
                            Continue
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </motion.div>
                        </motion.button>

                        {/* Skip Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 }}
                            whileHover={{ scale: 1.03, borderColor: "rgb(59, 130, 246)" }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleSkip}
                            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md border-2 border-gray-300 hover:shadow-lg"
                        >
                            Skip for now
                        </motion.button>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center text-xs text-gray-600 mt-6"
                    >
                        You can update this information later in your profile settings
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
