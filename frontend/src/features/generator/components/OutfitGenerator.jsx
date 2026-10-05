import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RefreshCw, UploadCloud, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const occasions = [
  { name: 'Casual Weekend', icon: '☕' },
  { name: 'Business Meeting', icon: '💼' },
  { name: 'Smart Dinner', icon: '🍷' },
  { name: 'Night Out', icon: '✨' },
  { name: 'Activewear', icon: '🏃' }
];

const styles = [
  { name: 'Minimalist', desc: 'Clean lines, neutral colors', img: 'https://images.unsplash.com/photo-1434389678369-1834224d5885?auto=format&fit=crop&q=80&w=400' },
  { name: 'Streetwear', desc: 'Bold, comfortable, trendy', img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=400' },
  { name: 'Classic', desc: 'Timeless and structured', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400' }
];

const OutfitGenerator = () => {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState('');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Real Wardrobe Data
  const [availableItems, setAvailableItems] = useState([]);
  const [generatedOutfit, setGeneratedOutfit] = useState([]);
  const [stylingReason, setStylingReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // VTON State
  const [showVtonModal, setShowVtonModal] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryOnStep, setTryOnStep] = useState('');
  const [vtonResult, setVtonResult] = useState(null);
  const [vtonError, setVtonError] = useState('');
  const [vtonFile, setVtonFile] = useState(null);
  const [vtonPreviewUrl, setVtonPreviewUrl] = useState(null);
  const vtonFileInputRef = React.useRef(null);

  // Determine the best upper-body garment from the generated outfit
  const getTopGarment = (outfit) => {
    const UPPER_BODY_CATEGORIES = ['tops', 'top', 'shirt', 'tshirt', 't-shirt', 'jacket', 'hoodie', 'outerwear', 'blouse', 'sweater'];
    const UPPER_BODY_KEYWORDS = ['shirt', 'tshirt', 't-shirt', 'tee', 'top', 'jacket', 'hoodie', 'blouse', 'sweater', 'cardigan', 'coat'];
    
    // 1. First try to match by category field (most reliable)
    const byCategory = outfit.find(item => 
      UPPER_BODY_CATEGORIES.includes(item.category?.toLowerCase())
    );
    if (byCategory) return byCategory;

    // 2. Fall back to name keyword matching
    const byName = outfit.find(item =>
      UPPER_BODY_KEYWORDS.some(kw => item.name?.toLowerCase().includes(kw))
    );
    if (byName) return byName;

    // 3. Last resort: return first item
    return outfit[0];
  };

  useEffect(() => {
    // Fetch user's real wardrobe items on mount
    fetch(`${API_URL}/api/wardrobe`)
      .then(res => res.json())
      .then(data => setAvailableItems(data))
      .catch(err => console.error(err));
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    
    try {
      // Pass currently shown outfit IDs so backend avoids repeating the same combo
      const excludeIds = generatedOutfit.map(i => i._id);

      const res = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, style, availableItems, excludeIds })
      });

      const data = await res.json();
      
      if (res.ok) {
        const selected = availableItems.filter(item => data.selected_ids.includes(item._id));
        setGeneratedOutfit(selected);
        setStylingReason(data.styling_reason);
        setStep(3);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error trying to reach AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryOn = async () => {
    if (!vtonFile) return;
    setIsTryingOn(true);
    setVtonError('');
    setVtonResult(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000); // 3 min for two passes

      // Find top and bottom garments from the outfit
      const UPPER_BODY_CATEGORIES = ['tops', 'top', 'shirt', 'tshirt', 't-shirt', 'jacket', 'hoodie', 'outerwear', 'blouse', 'sweater'];
      const UPPER_BODY_KEYWORDS = ['shirt', 'tshirt', 't-shirt', 'tee', 'top', 'jacket', 'hoodie', 'blouse', 'sweater', 'cardigan', 'coat'];
      const LOWER_BODY_KW = ['pant', 'pants', 'trouser', 'jeans', 'shorts', 'skirt', 'bottom', 'lower'];

      const topGarment = getTopGarment(generatedOutfit);
      const bottomGarment = generatedOutfit.find(item =>
        LOWER_BODY_KW.some(kw => item.name?.toLowerCase().includes(kw) || item.category?.toLowerCase().includes(kw))
      );

      // Helper to convert base64 to File
      const base64ToFile = (base64, filename) => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
      };

      // Helper to call the backend try-on endpoint
      const doTryOn = (garment, imageFile) => {
        const formData = new FormData();
        formData.append('human_image', imageFile);
        formData.append('garmentUrl', garment.imageUrl);
        formData.append('garmentName', `${garment.color || ''} ${garment.name}`.trim());
        return fetch(`${API_URL}/api/ai/try-on`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        }).then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Try-on failed');
          return data.image_url;
        });
      };

      let currentImageFile = vtonFile;
      let finalResult = null;

      if (topGarment) {
        setTryOnStep('Stitching Top...');
        finalResult = await doTryOn(topGarment, currentImageFile);
        if (finalResult && bottomGarment) {
          currentImageFile = base64ToFile(finalResult, 'temp_top.jpg');
        }
      }

      if (bottomGarment) {
        setTryOnStep('Stitching Bottom...');
        finalResult = await doTryOn(bottomGarment, currentImageFile);
      }

      clearTimeout(timeout);
      setVtonResult(finalResult);

    } catch (err) {
      if (err.name === 'AbortError') {
        setVtonError('Request timed out. HuggingFace may be busy — please try again.');
      } else {
        setVtonError(err.message || 'Something went wrong.');
      }
      console.error(err);
    } finally {
      setIsTryingOn(false);
      setTryOnStep('');
    }
  };

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto min-h-screen relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-100 rounded-full blur-[100px] opacity-60 -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-5xl mx-auto p-8 lg:p-16">
        
        {/* Header */}
        <div className="mb-16 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold text-primary mb-3 flex items-center gap-3">
              <Sparkles className="text-accent w-8 h-8" /> AI Stylist
            </h2>
            <p className="text-lg text-gray-500">Curate your perfect look in seconds.</p>
          </div>
          <div className="hidden md:flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i && !isGenerating ? 'w-12 bg-primary' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Occasion */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
                <h3 className="text-3xl font-bold mb-8">Where are you going?</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                  {occasions.map(occ => (
                    <button
                      key={occ.name}
                      onClick={() => setOccasion(occ.name)}
                      className={`group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-300 ${
                        occasion === occ.name 
                          ? 'border-primary bg-primary text-white shadow-2xl scale-105' 
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <span className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{occ.icon}</span>
                      <span className="font-semibold text-center leading-tight">{occ.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button 
                    disabled={!occasion}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-full font-bold text-lg disabled:opacity-30 hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    Continue <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
                <h3 className="text-3xl font-bold mb-8">What's your vibe today?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {styles.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setStyle(s.name)}
                      className={`relative overflow-hidden text-left transition-all duration-300 rounded-[2rem] h-64 group ${
                        style === s.name ? 'ring-4 ring-primary shadow-2xl scale-[1.02]' : 'hover:shadow-xl'
                      }`}
                    >
                      <img src={s.img} alt={s.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 p-8 w-full">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="text-2xl font-bold text-white mb-1">{s.name}</h4>
                            <p className="text-gray-300 text-sm">{s.desc}</p>
                          </div>
                          {style === s.name && (
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary">
                              <CheckCircle2 size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-primary font-bold text-lg transition-colors">← Back</button>
                  <button 
                    disabled={!style || isGenerating}
                    onClick={handleGenerate}
                    className="flex items-center gap-3 bg-accent text-white px-10 py-5 rounded-full font-bold text-lg disabled:opacity-50 hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    Generate Magic <Sparkles size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <motion.div key="loading" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center py-32 text-center">
                <div className="relative w-32 h-32 mb-10">
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-3">Styling your look...</h3>
                <p className="text-lg text-gray-500 max-w-sm">LLaMA 3 is analyzing your wardrobe to curate the perfect {style.toLowerCase()} combination.</p>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 3 && !isGenerating && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                
                <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-50"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm mb-6">
                        <CheckCircle2 className="text-accent" size={16} /> 99% Match
                      </div>
                      <h3 className="text-4xl font-extrabold mb-6 leading-tight">The Perfect {style} Look</h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-8 italic">
                        "{stylingReason}"
                      </p>
                      
                      {/* VTON Button */}
                      <button 
                        onClick={() => setShowVtonModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-gray-800 text-white px-6 py-4 rounded-full font-bold hover:shadow-2xl hover:-translate-y-1 transition-all"
                      >
                        <Sparkles size={18} /> Pro Feature: Try It On
                      </button>

                    </div>

                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                      {generatedOutfit.length > 0 ? (
                        <>
                          <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] shadow-lg">
                            <img src={generatedOutfit[0]?.imageUrl} alt="Primary" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-white" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                              <p className="font-bold text-lg">{generatedOutfit[0]?.name}</p>
                            </div>
                          </div>
                          <div className="grid grid-rows-2 gap-4">
                            {generatedOutfit.slice(1, 3).map(item => (
                              <div key={item._id} className="relative group rounded-3xl overflow-hidden shadow-lg bg-white">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                                  <p className="font-bold">{item.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 text-center p-10 bg-white rounded-3xl text-gray-500">
                          AI couldn't find a good combination from your current closet. Try uploading more items!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={() => {setStep(1); setOccasion(''); setStyle('');}} 
                    className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full font-bold transition-all"
                  >
                    <RefreshCw size={18} /> Generate Another
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Virtual Try On Modal */}
      <AnimatePresence>
        {showVtonModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => {
                  setShowVtonModal(false); 
                  setVtonResult(null);
                  setVtonFile(null);
                  setVtonPreviewUrl(null);
                  setVtonError('');
                  setTryOnStep('');
                }} 
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Left Side: Upload */}
              <div className="flex-1 p-10 bg-gray-50 flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-2">Virtual Try-On</h3>
                <p className="text-gray-500 mb-8">Upload a full-body photo to see how this outfit looks on you.</p>
                
                <input type="file" accept="image/*" onChange={(e) => {
                  const selected = e.target.files[0];
                  if (selected) {
                    setVtonFile(selected);
                    setVtonPreviewUrl(URL.createObjectURL(selected));
                  }
                }} ref={vtonFileInputRef} className="hidden" />
                
                <div 
                  onClick={() => vtonFileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all mb-6 relative overflow-hidden min-h-[200px]
                    ${vtonPreviewUrl ? 'border-transparent' : 'border-gray-300 bg-white hover:border-primary hover:bg-gray-50'}`}
                >
                  {vtonPreviewUrl ? (
                    <img src={vtonPreviewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={48} className="text-gray-400 mb-4" />
                      <p className="font-bold text-gray-700">Click to upload photo</p>
                      <p className="text-sm text-gray-400 mt-2">JPG or PNG (max 5MB)</p>
                    </>
                  )}
                </div>
                
                {/* Show which garment will be tried on */}
                {generatedOutfit.length > 0 && (() => {
                  const top = getTopGarment(generatedOutfit);
                  const LOWER_BODY_KW = ['pant', 'pants', 'trouser', 'jeans', 'shorts', 'skirt', 'bottom', 'lower'];
                  const bottom = generatedOutfit.find(item =>
                    LOWER_BODY_KW.some(kw => item.name?.toLowerCase().includes(kw) || item.category?.toLowerCase().includes(kw))
                  );
                  const itemsToTryOn = [top?.name, bottom?.name].filter(Boolean).join(' + ');
                  
                  return itemsToTryOn ? (
                    <p className="text-xs text-gray-400 mb-3">Will try on: <span className="font-bold text-gray-600">{itemsToTryOn}</span></p>
                  ) : null;
                })()}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-xs text-blue-800 font-medium mb-1">💡 For best VTON results:</p>
                  <ul className="text-xs text-blue-600 list-disc pl-4 space-y-1">
                    <li>Use a plain, solid-colored background</li>
                    <li>Keep your arms straight at your sides (no hands in pockets)</li>
                    <li>Ensure good lighting</li>
                  </ul>
                </div>

                <button 
                  onClick={handleTryOn}
                  disabled={isTryingOn || !vtonFile}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold disabled:opacity-50 hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  {isTryingOn ? (
                    <><RefreshCw size={20} className="animate-spin" /> Stitching Image...</>
                  ) : vtonResult ? (
                    <><RefreshCw size={20} /> Try Again</>
                  ) : (
                    <><Sparkles size={20} /> Generate Try-On</>
                  )}
                </button>

                {vtonError && (
                  <p className="mt-3 text-sm text-red-500 font-medium text-center">{vtonError}</p>
                )}
              </div>

              {/* Right Side: Result */}
              <div className="flex-1 bg-gray-100 flex flex-col gap-3 min-h-[400px] p-6 relative">
                {vtonResult ? (
                  <div className="flex flex-col gap-3 h-full">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-2 min-h-0">
                      <p className="text-sm font-bold text-gray-700 text-center uppercase tracking-wider">✨ Full Outfit Look</p>
                      <img 
                        src={vtonResult} 
                        alt="Full Outfit Try-On" 
                        className="w-full h-full object-contain bg-white rounded-3xl shadow-lg"
                      />
                    </motion.div>
                    <p className="text-xs text-center text-gray-400">Powered by IDM-VTON & OOTDiffusion</p>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="text-gray-400" size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">Your generated image will appear here</p>
                      <p className="text-xs text-gray-400 mt-2">Both top & bottom will be tried on</p>
                    </div>
                  </div>
                )}
                
                {isTryingOn && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[3rem]">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-primary">{tryOnStep || 'AI is working...'}</p>
                    <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                      Stitching a full outfit takes a bit longer as we run multiple AI models. Hang tight!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OutfitGenerator;
