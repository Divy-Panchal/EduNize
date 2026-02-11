import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, Calendar, X, Link as LinkIcon, Video, File, Check, Eye, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSubject } from '../context/SubjectContext';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

export function SubjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { themeConfig } = useTheme();
    const { subjects, addTopic, deleteTopic, toggleTopic, addResource, deleteResource } = useSubject();

    const subject = subjects.find(s => s.id === id);

    // Modal states
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);

    // Form states
    const [topicName, setTopicName] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [resourceType, setResourceType] = useState<'link' | 'file' | 'video'>('link');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const blobUrlsRef = useRef<string[]>([]);

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>
                        Subject not found
                    </h2>
                    <button
                        onClick={() => navigate('/subjects')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold"
                    >
                        Back to Subjects
                    </button>
                </div>
            </div>
        );
    }

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
            blobUrlsRef.current = [];
        };
    }, []);



    const handleAddTopic = () => {
        if (topicName.trim() && id) {
            addTopic(id, { name: topicName.trim(), completed: false });
            setTopicName('');
            setShowTopicModal(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setResourceTitle(file.name);
        }
    };

    const handleAddResource = async () => {
        if (!id) return;

        setIsUploading(true);
        try {
            if (resourceType === 'file' && selectedFile) {
                // Check file size (5MB limit to prevent localStorage overflow)
                const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if (selectedFile.size > maxSize) {
                    toast.error('File size must be less than 5MB. Please choose a smaller file.');
                    setIsUploading(false);
                    return;
                }

                // Convert file to base64
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const base64 = reader.result as string;
                        addResource(id, {
                            title: resourceTitle.trim() || selectedFile.name,
                            url: '', // Not used for files
                            type: 'file',
                            fileName: selectedFile.name,
                            fileData: base64,
                        });
                        toast.success('File added successfully!');
                        setResourceTitle('');
                        setResourceUrl('');
                        setSelectedFile(null);
                        setResourceType('link');
                        setShowResourceModal(false);
                        setIsUploading(false);
                    } catch (err) {
                        if (import.meta.env.DEV) {
                            console.error('Error saving file:', err);
                        }
                        toast.error('Failed to save file. Storage limit may be exceeded.');
                        setIsUploading(false);
                    }
                };
                reader.onerror = () => {
                    toast.error('Failed to read file');
                    setIsUploading(false);
                };
                reader.readAsDataURL(selectedFile);
            } else if (resourceType === 'file' && !selectedFile) {
                toast.error('Please select a file to upload');
                setIsUploading(false);
            } else if (resourceTitle.trim() && resourceUrl.trim()) {
                addResource(id, { title: resourceTitle.trim(), url: resourceUrl.trim(), type: resourceType });
                toast.success(`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} added successfully!`);
                setResourceTitle('');
                setResourceUrl('');
                setResourceType('link');
                setShowResourceModal(false);
                setIsUploading(false);
            } else {
                // Provide specific error messages
                if (!resourceTitle.trim() && !resourceUrl.trim()) {
                    toast.error('Please fill in both the title and URL fields');
                } else if (!resourceTitle.trim()) {
                    toast.error('Please enter a resource title');
                } else if (!resourceUrl.trim()) {
                    toast.error('Please enter a URL');
                }
                setIsUploading(false);
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error adding resource:', error);
            }
            toast.error('Failed to add resource');
            setIsUploading(false);
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5" />;
            case 'file': return <File className="w-5 h-5" />;
            default: return <LinkIcon className="w-5 h-5" />;
        }
    };

    // Check if file can be viewed in browser
    const isFileViewableInBrowser = (fileName: string) => {
        if (!fileName) return false;
        const extension = fileName.toLowerCase().split('.').pop();
        const viewableExtensions = [
            'pdf',           // PDF files
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',  // Images
            'txt', 'md', 'json', 'xml', 'csv',  // Text files
            'mp4', 'webm', 'ogg',  // Videos
            'mp3', 'wav',   // Audio
        ];
        return viewableExtensions.includes(extension || '');
    };

    // Convert base64 to Blob URL and track for cleanup
    const createBlobUrl = (base64: string) => {
        try {
            if (!base64 || typeof base64 !== 'string') {
                if (import.meta.env.DEV) {
                    console.error('Invalid base64 data');
                }
                return '';
            }

            if (!base64.startsWith('data:')) {
                if (import.meta.env.DEV) {
                    console.error('Not a valid data URL');
                }
                return base64;
            }

            const parts = base64.split(',');
            if (parts.length !== 2) {
                if (import.meta.env.DEV) {
                    console.error('Invalid data URL format');
                }
                return base64;
            }

            const base64Data = parts[1];
            const mimeTypePart = parts[0];
            const mimeTypeMatch = mimeTypePart.match(/data:([^;]+)/);

            if (!mimeTypeMatch) {
                if (import.meta.env.DEV) {
                    console.error('Could not extract MIME type');
                }
                return base64;
            }

            const mimeType = mimeTypeMatch[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);

            // Track blob URL for cleanup
            blobUrlsRef.current.push(blobUrl);

            return blobUrl;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error creating blob URL:', error);
            }
            return base64;
        }
    };

    const handleOpenFile = async (fileData: string, fileName: string, mimeType?: string) => {
        if (!fileData || !fileName) return;

        // Native Platform Logic
        if (Capacitor.isNativePlatform()) {
            try {
                // Remove data:image/png;base64, prefix if present
                const base64Data = fileData.split(',')[1] || fileData;

                // Determine mime type if not provided
                let finalMimeType = mimeType;
                if (!finalMimeType) {
                    const ext = fileName.split('.').pop()?.toLowerCase();
                    if (ext === 'pdf') finalMimeType = 'application/pdf';
                    else if (['jpg', 'jpeg', 'png'].includes(ext || '')) finalMimeType = `image/${ext}`;
                    else finalMimeType = 'application/octet-stream'; // Default
                }

                // Write file to cache directory
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                });

                // Open file
                await FileOpener.open({
                    filePath: result.uri,
                    contentType: finalMimeType,
                });

            } catch (error) {
                console.error('Error opening file natively:', error);
                toast.error('Could not open file. Please try downloading it.');
            }
        }
        // Web Logic
        else {
            const blobUrl = createBlobUrl(fileData);
            window.open(blobUrl, '_blank');
            // Clean up blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
    };

    return (
        <div className={`min-h-screen ${themeConfig.background} space-y-6 pb-20`}>
            {/* Header with Back Button */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <button
                    onClick={() => navigate('/subjects')}
                    className={`flex items-center gap-2 ${themeConfig.textSecondary} hover:${themeConfig.text} transition-colors mb-4`}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Subjects</span>
                </button>

                {/* Subject Header Card */}
                <div className={`bg-gradient-to-r ${subject.color} rounded-2xl p-1 shadow-lg`}>
                    <div className={`${themeConfig.card} rounded-xl p-6`}>
                        <div className="flex items-center gap-4">
                            <div className={`bg-gradient-to-r ${subject.color} p-4 rounded-xl`}>
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-3xl font-bold ${themeConfig.text}`}>
                                    {subject.name}
                                </h1>
                                <p className={`${themeConfig.textSecondary} text-sm mt-1`}>
                                    Subject Details & Resources
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-4 grid grid-cols-2 gap-3"
            >
                <div className={`${themeConfig.card} rounded-xl p-4 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} `}>
                    <Calendar className={`w-6 h-6 mx-auto mb-2 ${themeConfig.textSecondary} `} />
                    <p className={`text-2xl font-bold ${themeConfig.text} `}>{subject.topics.length}</p>
                    <p className={`text-xs ${themeConfig.textSecondary} `}>Topics</p>
                </div>
                <div className={`${themeConfig.card} rounded-xl p-4 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} `}>
                    <BookOpen className={`w-6 h-6 mx-auto mb-2 ${themeConfig.textSecondary} `} />
                    <p className={`text-2xl font-bold ${themeConfig.text} `}>{subject.resources.length}</p>
                    <p className={`text-xs ${themeConfig.textSecondary} `}>Resources</p>
                </div>
            </motion.div>

            <div className="px-4 space-y-4">

                {/* Topics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className={`text-xl font-bold ${themeConfig.text} mb-3`}>Topics</h2>

                    {subject.topics.length > 0 && (
                        <div className="space-y-2 mb-3">
                            <AnimatePresence>
                                {subject.topics.map((topic, index) => (
                                    <motion.div
                                        key={topic.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <button
                                                onClick={() => id && toggleTopic(id, topic.id)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${topic.completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : `border-gray-400 ${themeConfig.card}`
                                                    } `}
                                            >
                                                {topic.completed && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                            <span className={`${topic.completed ? 'line-through ' + themeConfig.textSecondary : themeConfig.text} `}>
                                                {topic.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => id && deleteTopic(id, topic.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTopicModal(true)}
                        className={`w-full rounded-2xl p-6 border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Plus className={`w-6 h-6 ${themeConfig.textSecondary} `} />
                            <span className={`font-semibold ${themeConfig.text} `}>Add Topic</span>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Resources Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className={`text-xl font-bold ${themeConfig.text} mb-3`}>Resources</h2>

                    {subject.resources.length > 0 && (
                        <div className="space-y-3 mb-3">
                            <AnimatePresence>
                                {subject.resources.map((resource, index) => (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`${themeConfig.textSecondary} mt-1`}>
                                                    {getResourceIcon(resource.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold ${themeConfig.text} mb-1 break-all`}>{resource.title}</h3>
                                                    {resource.type === 'file' && resource.fileData ? (
                                                        <div className="flex gap-2 mt-2">
                                                            {/* Show Open button only for viewable file types (PDF, images, text) */}
                                                            {isFileViewableInBrowser(resource.fileName || resource.title) && (
                                                                <button
                                                                    onClick={() => handleOpenFile(resource.fileData!, resource.fileName || resource.title)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    Open
                                                                </button>
                                                            )}
                                                            {/* Always show Download button for all file types */}
                                                            <button
                                                                onClick={() => {
                                                                    if (Capacitor.isNativePlatform()) {
                                                                        // Native Download
                                                                        (async () => {
                                                                            try {
                                                                                const base64Data = resource.fileData!.split(',')[1] || resource.fileData!;
                                                                                await Filesystem.writeFile({
                                                                                    path: resource.fileName || resource.title,
                                                                                    data: base64Data,
                                                                                    directory: Directory.Documents,
                                                                                });
                                                                                toast.success('File saved to Documents folder');
                                                                            } catch (error) {
                                                                                console.error('Download error:', error);
                                                                                toast.error('Failed to save file');
                                                                            }
                                                                        })();
                                                                    } else {
                                                                        // Web Download
                                                                        const blobUrl = createBlobUrl(resource.fileData!);
                                                                        const link = document.createElement('a');
                                                                        link.href = blobUrl;
                                                                        link.download = resource.fileName || resource.title;
                                                                        link.click();
                                                                        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                                                                    }
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                {Capacitor.isNativePlatform() ? 'Save' : 'Download'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 mt-2">
                                                            {/* Open button for link and video resources */}
                                                            <button
                                                                onClick={() => {
                                                                    window.open(resource.url, '_blank');
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors flex-shrink-0"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Open
                                                            </button>
                                                            {/* Show URL as secondary info */}
                                                            <span className={`text-xs ${themeConfig.textSecondary} self-center break-all line-clamp-1`}>
                                                                {resource.url}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => id && deleteResource(id, resource.id)}
                                                className="text-red-500 hover:text-red-600 ml-2"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowResourceModal(true)}
                        className={`w-full rounded-2xl p-6 border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Plus className={`w-6 h-6 ${themeConfig.textSecondary} `} />
                            <span className={`font-semibold ${themeConfig.text} `}>Add Resource</span>
                        </div>
                    </motion.button>
                </motion.div>
            </div >



            {/* Add Topic Modal */}
            <AnimatePresence>
                {
                    showTopicModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowTopicModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className={`${themeConfig.card} rounded-2xl p-6 max-w-sm w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} `}
                            >
                                <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>Add Topic</h2>
                                <input
                                    type="text"
                                    value={topicName}
                                    onChange={(e) => setTopicName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                                    placeholder="Topic name"
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-4`}
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowTopicModal(false)}
                                        className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddTopic}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Add Topic
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Add Resource Modal */}
            <AnimatePresence>
                {
                    showResourceModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowResourceModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className={`${themeConfig.card} rounded-2xl p-6 max-w-sm w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} `}
                            >
                                <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>Add Resource</h2>

                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold ${themeConfig.text} mb-2`}>Type</label>
                                    <div className="flex gap-2">
                                        {(['link', 'video', 'file'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setResourceType(type)}
                                                className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${resourceType === type
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                    : `${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'}`
                                                    } `}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {resourceType === 'file' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={resourceTitle}
                                            onChange={(e) => setResourceTitle(e.target.value)}
                                            placeholder="Resource title (optional)"
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                        />
                                        <div className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all mb-3`}>
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                className="w-full"
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className={`cursor-pointer ${themeConfig.text} `}>
                                                {selectedFile ? `Selected: ${selectedFile.name} ` : 'Choose a file'}
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            value={resourceTitle}
                                            onChange={(e) => setResourceTitle(e.target.value)}
                                            placeholder="Resource title"
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                            autoFocus
                                        />
                                        <input
                                            type="text"
                                            value={resourceUrl}
                                            onChange={(e) => setResourceUrl(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddResource()}
                                            placeholder="URL (e.g., https://example.com)"
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                        />
                                    </>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowResourceModal(false)}
                                        className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddResource}
                                        disabled={isUploading}
                                        className={`flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isUploading ? 'Adding...' : 'Add Resource'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}

