
import React, { useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';
import translatedContents from '../../data/translated_contents.json';
import ArrowSvg from '../../assets/arrow.svg?react';

const ServiceSatisfactionForm = ({ onClose }) => {
  const { language } = useLanguage();
  const t = translatedContents.service_satisfaction_form;
  
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    marital_status: '',
    education_level: '',
    employment_status: '',
    district: '',
    visits: '',
    service_requested: [],
    // Satisfaction questions
    q1: '', q2: '', q3: '', q4: '', q5: '',
    q6: '', q7: '', q8: '', q9: '', q10: '', q11: '',
    additional_comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Helper to get translated text or fallback
  const getText = (obj) => obj?.[language] || obj?.['am'] || "";

  const messages = {
    requiredField: {
      en: 'This field is required',
      am: 'ይህ መስክ አስፈላጊ ነው',
      or: 'Dirreen kun barbaachisaa dha'
    },
    requiredQuestion: {
      en: 'Please answer this question',
      am: 'እባክዎ ይህን ጥያቄ ይመልሱ',
      or: 'Maaloo gaaffii kana deebisaa'
    },
    requiredService: {
      en: 'Please select at least one service',
      am: 'እባክዎ ቢኖር አንድ አገልግሎት ቢያንስ ይምረጡ',
      or: 'Maaloo tajaajila tokko qofaa taʼus filadhaa'
    }
  };

  const getMessage = (msgObj) => getText(msgObj || {});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.gender) newErrors.gender = getMessage(messages.requiredField);
    if (!formData.age) newErrors.age = getMessage(messages.requiredField);
    if (!formData.marital_status) newErrors.marital_status = getMessage(messages.requiredField);
    if (!formData.education_level) newErrors.education_level = getMessage(messages.requiredField);
    if (!formData.employment_status) newErrors.employment_status = getMessage(messages.requiredField);
    if (!formData.district.trim()) newErrors.district = getMessage(messages.requiredField);

    if (!formData.service_requested || formData.service_requested.length === 0) {
      newErrors.service_requested = getMessage(messages.requiredService);
    }

    const questionIds = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11'];
    questionIds.forEach(id => {
      if (!formData[id]) {
        newErrors[id] = getMessage(messages.requiredQuestion);
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e, value) => {
    const { checked } = e.target;
    setFormData(prev => {
        const currentSelected = prev.service_requested || [];
        if (checked) {
            const updated = [...currentSelected, value];
            if (errors.service_requested && updated.length > 0) {
              setErrors(prevErrors => ({ ...prevErrors, service_requested: undefined }));
            }
            return { ...prev, service_requested: updated };
        } else {
            const updated = currentSelected.filter(item => item !== value);
            return { ...prev, service_requested: updated };
        }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        visits: formData.visits ? Number(formData.visits) : null,
      };

      const response = await fetch('/api/service-satisfaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit satisfaction form');
      }

      localStorage.setItem('serviceSatisfactionSubmitted', 'true');
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting satisfaction form:', error);
      setSubmitError(error.message || getText(t.messages?.error));
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
         <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold font-goldman text-gray-800 mb-2">{getText(t.messages.success)}</h3>
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-roboto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-y-auto relative font-roboto">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-white relative">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="pr-10">
                <h2 className="text-2xl md:text-3xl font-goldman font-bold text-[#3A3A3A] mb-2">{getText(t.title)}</h2>
                <div className="text-sm text-gray-500">{getText(t.introduction)}</div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 space-y-8 bg-gray-50/50">
            <form id="satisfaction-form" onSubmit={handleSubmit} className="space-y-8">
                {submitError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                )}
                
                {/* SECTION I: Personal Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-goldman font-bold text-gray-800 mb-6 border-b pb-2">{getText(t.sections.personal_info.title)}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">{getText(t.sections.personal_info.fields.gender.label)} <span className="text-red-500">*</span></label>
                            <div className="flex gap-4 flex-wrap">
                                {Object.entries(t.sections.personal_info.fields.gender.options).map(([key, labelObj]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        <input type="radio" name="gender" value={key} required checked={formData.gender === key} onChange={handleChange} className="w-4 h-4 text-[#FACC14] focus:ring-[#FACC14]" />
                                        <span className="text-sm text-gray-600">{getText(labelObj)}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.gender && (
                              <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                            )}
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">{getText(t.sections.personal_info.fields.age.label)} <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select name="age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC14]/50 appearance-none bg-white border-gray-300">
                                    <option value="">{{ en: 'Select Age', am: 'ዕድሜ ይምረጡ', or: 'Umurii filadhu' }[language]}</option>
                                    {Object.entries(t.sections.personal_info.fields.age.options).map(([key, val]) => (
                                        <option key={key} value={key}>{val}</option>
                                    ))}
                                </select>
                                <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400'/>
                            </div>
                            {errors.age && (
                              <p className="text-xs text-red-500 mt-1">{errors.age}</p>
                            )}
                        </div>

                         {/* Marital Status */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">{getText(t.sections.personal_info.fields.marital_status.label)} <span className="text-red-500">*</span></label>
                            <div className="flex gap-4 flex-wrap">
                                {Object.entries(t.sections.personal_info.fields.marital_status.options).map(([key, labelObj]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        <input type="radio" name="marital_status" value={key} required checked={formData.marital_status === key} onChange={handleChange} className="w-4 h-4 text-[#FACC14] focus:ring-[#FACC14]" />
                                        <span className="text-sm text-gray-600">{getText(labelObj)}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.marital_status && (
                              <p className="text-xs text-red-500 mt-1">{errors.marital_status}</p>
                            )}
                        </div>

                         {/* Education */}
                         <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">{getText(t.sections.personal_info.fields.education_level.label)} <span className="text-red-500">*</span></label>
                             <div className="relative">
                                <select name="education_level" value={formData.education_level} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC14]/50 appearance-none bg-white border-gray-300">
                                    <option value="">{{ en: 'Select Education Level', am: 'የትምህርት ደረጃ ይምረጡ', or: 'Sadarkaa barnootaa filadhu' }[language]}</option>
                                    {Object.entries(t.sections.personal_info.fields.education_level.options).map(([key, labelObj]) => (
                                        <option key={key} value={key}>{getText(labelObj)}</option>
                                    ))}
                                </select>
                                <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400'/>
                             </div>
                             {errors.education_level && (
                               <p className="text-xs text-red-500 mt-1">{errors.education_level}</p>
                             )}
                        </div>

                         {/* Employment */}
                         <div className="space-y-2 md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700">{getText(t.sections.personal_info.fields.employment_status.label)} <span className="text-red-500">*</span></label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.entries(t.sections.personal_info.fields.employment_status.options).map(([key, labelObj]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 transition-all">
                                        <input type="radio" name="employment_status" value={key} required checked={formData.employment_status === key} onChange={handleChange} className="w-4 h-4 text-[#FACC14] focus:ring-[#FACC14]" />
                                        <span className="text-sm text-gray-600">{getText(labelObj)}</span>
                                    </label>
                                ))}
                             </div>
                             {errors.employment_status && (
                               <p className="text-xs text-red-500 mt-1">{errors.employment_status}</p>
                             )}
                        </div>

                        {/* District */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">{getText(t.sections.personal_info.fields.district.label)} <span className="text-red-500">*</span></label>
                             <input type="text" name="district" value={formData.district} onChange={handleChange} required placeholder={getText(t.sections.personal_info.fields.district.placeholder)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC14]/50" />
                             {errors.district && (
                               <p className="text-xs text-red-500 mt-1">{errors.district}</p>
                             )}
                        </div>

                        {/* Visits */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">{getText(t.sections.personal_info.fields.visits.label)}</label>
                             <input type="number" name="visits" min="0" value={formData.visits} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC14]/50" />
                        </div>

                        {/* Service Requested */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{getText(t.sections.personal_info.fields.service_requested.label)} <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-4">
                                {Object.entries(t.sections.personal_info.fields.service_requested.options).map(([key, labelObj]) => {
                                    const isChecked = formData.service_requested.includes(key);
                                    return (
                                        <label key={key} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${isChecked ? 'bg-[#FACC14]/10 border-[#FACC14]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                            <input type="checkbox" checked={isChecked} onChange={(e) => handleCheckboxChange(e, key)} className="hidden" />
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-[#FACC14] border-[#FACC14]' : 'border-gray-400'}`}>
                                                {isChecked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                            <span className={`text-sm ${isChecked ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{getText(labelObj)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.service_requested && (
                              <p className="text-xs text-red-500 mt-2">{errors.service_requested}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION II: Satisfaction Questions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-goldman font-bold text-gray-800 mb-2 border-b pb-2">{getText(t.sections.satisfaction_questions.title)}</h3>
                    <p className="text-sm text-gray-500 mb-6 italic">{getText(t.sections.satisfaction_questions.instruction)}</p>

                    <div className="space-y-8">
                        {/* Likert Scale Header (Desktop) */}
                        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 pb-2 mb-4 text-xs font-bold text-gray-500 text-center uppercase tracking-wider sticky top-0 bg-white z-10 py-2">
                            <div className="col-span-5 text-left pl-2">Questions</div>
                            <div className="col-span-7 grid grid-cols-5">
                                <div>{getText(t.sections.satisfaction_questions.options.very_high)}</div>
                                <div>{getText(t.sections.satisfaction_questions.options.high)}</div>
                                <div>{getText(t.sections.satisfaction_questions.options.medium)}</div>
                                <div>{getText(t.sections.satisfaction_questions.options.low)}</div>
                                <div>{getText(t.sections.satisfaction_questions.options.very_low)}</div>
                            </div>
                        </div>

                        {/* Questions */}
                        {t.sections.satisfaction_questions.questions.map((question, idx) => (
                            <div key={question.id} className="md:grid md:grid-cols-12 md:gap-4 items-center hover:bg-gray-50 p-3 rounded-lg transition-colors">
                                <div className="md:col-span-5 mb-3 md:mb-0">
                                    <p className="text-sm font-medium text-gray-800">{getText(question.text)} <span className="text-red-500 text-xs">*</span></p>
                                </div>
                                <div className="md:col-span-7 grid grid-cols-5 gap-1">
                                    {['very_high', 'high', 'medium', 'low', 'very_low'].map((optionKey) => (
                                        <label key={optionKey} className="flex flex-col items-center cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name={question.id} 
                                                value={optionKey} 
                                                required 
                                                checked={formData[question.id] === optionKey} 
                                                onChange={handleChange} 
                                                className="hidden" 
                                            />
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData[question.id] === optionKey ? 'border-[#FACC14] bg-[#FACC14]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                {formData[question.id] === optionKey && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                            </div>
                                            <span className="md:hidden text-xs mt-1 text-center text-gray-500">{getText(t.sections.satisfaction_questions.options[optionKey])}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors[question.id] && (
                                  <div className="md:col-span-12 mt-2">
                                    <p className="text-xs text-red-500">{errors[question.id]}</p>
                                  </div>
                                )}
                            </div>
                        ))}

                        {/* Q12 Additional Comments */}
                        <div className="pt-6 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{getText(t.sections.satisfaction_questions.additional_comments.label)}</label>
                            <textarea 
                                name="additional_comments" 
                                value={formData.additional_comments} 
                                onChange={handleChange} 
                                placeholder={getText(t.sections.satisfaction_questions.additional_comments.placeholder)} 
                                rows="4" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC14]/50 resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
             <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-roboto font-medium hover:bg-gray-200 transition-colors"
             >
                {getText(t.actions.cancel)}
             </button>
             <button
                type="submit"
                form="satisfaction-form"
                disabled={isSubmitting}
                className="bg-[#3A3A3A] hover:bg-[#FACC14] hover:text-[#1E1E1E] text-white font-bold font-roboto py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
             >
                {isSubmitting ? { en: 'Submitting...', am: 'እየተላከ ነው...', or: "Erguuf jira..." }[language] : getText(t.actions.submit)}
             </button>
        </div>

      </div>
    </div>
  );
};

export default ServiceSatisfactionForm;
