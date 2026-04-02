import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import ServiceSatisfactionForm from './ServiceSatisfactionForm';

const GlobalSatisfactionTrigger = () => {
    const { language } = useLanguage();
    const location = useLocation();
    const [showTrigger, setShowTrigger] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Check if form has been submitted
        const hasSubmitted = localStorage.getItem('serviceSatisfactionSubmitted');
        
        // Hide on admin routes or if already submitted
        const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/auth');
        
        if (!hasSubmitted && !isAdminRoute) {
            setShowTrigger(true);
        } else {
            setShowTrigger(false);
        }
    }, [location.pathname, showForm]); // Re-check when location changes or form closes (in case it was just submitted)

    const handleFormClose = () => {
        setShowForm(false);
        // Check again if we should hide the trigger (e.g. if just submitted)
        const hasSubmitted = localStorage.getItem('serviceSatisfactionSubmitted');
        if (hasSubmitted) {
            setShowTrigger(false);
        }
    };

    if (!showTrigger) return null;

    return (
        <>
            {/* Desktop View: Full Card */}
            <div className="hidden md:block fixed bottom-6 right-6 z-[49] bg-white p-4 rounded-xl shadow-2xl border border-gray-200 max-w-xs animate-fade-in-up font-roboto group hover:scale-105 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-goldman font-bold text-lg text-[#3A3A3A] leading-tight">
                        {language === 'am' ? 'የአገልግሎት እርካታ መጠይቅ' : 'Service Satisfaction Survey'}
                    </h3>
                    <button 
                        onClick={() => setShowTrigger(false)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Close survey offer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                    {language === 'am' 
                        ? 'አገልግሎታችንን ለማሻሻል እንዲረዳን እባክዎ ይህን አጭር መጠይቅ ይሙሉ' 
                        : 'Please help us improve our services by filling out this short survey'
                    }
                </p>
                <button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-[#3A3A3A] text-white hover:bg-[#FACC14] hover:text-[#1E1E1E] font-bold font-roboto py-2 px-4 rounded-full text-sm transition-all duration-300 shadow-md transform active:scale-95"
                >
                    {language === 'am' ? 'መጠይቁን ይሙሉ' : 'Take Survey'}
                </button>
            </div>

            {/* Mobile View: Compact Pill/FAB */}
            <div className="md:hidden fixed bottom-20 right-4 z-[49] animate-fade-in-up">
                {/* Close 'x' for mobile wrapper - optional, maybe just let them ignore it or have a tiny x above it */}
                <div className="relative group">
                    <button 
                         onClick={() => setShowTrigger(false)}
                         className="absolute -top-2 -left-2 bg-gray-200 rounded-full p-1 text-gray-500 hover:bg-red-100 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    <button 
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-[#3A3A3A] text-white hover:bg-[#FACC14] hover:text-[#1E1E1E] px-4 py-3 rounded-full shadow-xl transition-all duration-300 active:scale-95 border border-white/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="font-goldman font-bold text-sm">
                            {language === 'am' ? 'መጠይቅ' : 'Survey'}
                        </span>
                    </button>
                </div>
            </div>

            {showForm && (
                <ServiceSatisfactionForm onClose={handleFormClose} />
            )}
        </>
    );
};

export default GlobalSatisfactionTrigger;
