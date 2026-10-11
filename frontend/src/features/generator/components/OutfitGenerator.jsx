import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw, UploadCloud, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const occasions = [
  { name: 'Business Meeting', icon: '💼', subtitle: 'Work, interviews & corporate' },
  { name: 'Casual Weekend', icon: '☕', subtitle: 'Everyday, coffee & errands' },
  { name: 'Smart Dinner', icon: '🍷', subtitle: 'Date night & fine dining' },
  { name: 'Night Out', icon: '✨', subtitle: 'Parties, clubs & celebrations' },
  { name: 'Activewear', icon: '🏃', subtitle: 'Gym, running & athleisure' },
  { name: 'Vacation & Resort', icon: '🌴', subtitle: 'Travel, holidays & sunny days' }
];

const OCCASION_STYLES = {
  'Business Meeting': [
    {
      name: 'Corporate Sharp',
      desc: 'Crisp collared shirts, blazers, and tailored trousers.',
      img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Smart Casual',
      desc: 'Polished button-downs or knitwear with clean chinos.',
      img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Modern Executive',
      desc: 'Understated monochrome palette with structured clean lines.',
      img: 'https://images.unsplash.com/photo-1434389678369-1834224d5885?auto=format&fit=crop&q=80&w=600'
    }
  ],
  'Casual Weekend': [
    {
      name: 'Relaxed Streetwear',
      desc: 'Urban graphic tees, casual denim, and comfortable sneakers.',
      img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Effortless Casual',
      desc: 'Comfortable everyday cotton tees, chinos, and easy layers.',
      img: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Minimalist Clean',
      desc: 'Neutral tones, clean silhouettes, and timeless essentials.',
      img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600'
    }
  ],
  'Smart Dinner': [
    {
      name: 'Elegant Evening',
      desc: 'Sophisticated dark tones, tailored trousers, and sharp cuts.',
      img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Refined Smart Casual',
      desc: 'Tailored button-downs paired with clean pressed pants.',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Monochrome Luxe',
      desc: 'Sleek all-black or deep charcoal modern evening aesthetic.',
      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600'
    }
  ],
  'Night Out': [
    {
      name: 'Edgy Nightlife',
      desc: 'Dark statement layers, leather accents, and bold attitude.',
      img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Party Chic',
      desc: 'Elevated evening contrasts, stylish jackets, and standout pieces.',
      img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Modern Midnight',
      desc: 'Sleek dark monochrome styling with contemporary silhouettes.',
      img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600'
    }
  ],
  'Activewear': [
    {
      name: 'High Performance',
      desc: 'Athletic moisture-wicking tees and active training shorts.',
      img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Urban Athleisure',
      desc: 'Sporty joggers, comfortable hoodies, and stylish sneakers.',
      img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Outdoor & Utility',
      desc: 'Durable, breathable layers built for active all-day movement.',
      img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=600'
    }
  ],
  'Vacation & Resort': [
    {
      name: 'Breezy Linen',
      desc: 'Lightweight breathable fabrics, airy cuts, and sun-washed neutrals.',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Resort Smart Casual',
      desc: 'Camp-collar shirts, relaxed tailored shorts, and casual luxury.',
      img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Tropical Vibes',
      desc: 'Playful vacation prints, relaxed summer shorts, and pool wear.',
      img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600'
    }
  ]
};

const OutfitGenerator = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState('');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Real Wardrobe Data
  const [availableItems, setAvailableItems] = useState([]);
  const [outfitRecommendations, setOutfitRecommendations] = useState([]);
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
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
  const [tryOnTarget, setTryOnTarget] = useState('both'); // 'both' | 'top' | 'bottom'
  const vtonFileInputRef = React.useRef(null);

  // Determine current contextual styles based on occasion
  const currentStyles = (occasion && OCCASION_STYLES[occasion]) || OCCASION_STYLES['Business Meeting'];

  // Determine the best upper-body garment from the generated outfit
  const getTopGarment = (outfit) => {
    if (!Array.isArray(outfit) || outfit.length === 0) return null;
    const UPPER_BODY_CATEGORIES = ['tops', 'top', 'shirt', 'tshirt', 't-shirt', 'jacket', 'hoodie', 'outerwear', 'blouse', 'sweater'];
    const UPPER_BODY_KEYWORDS = ['shirt', 'tshirt', 't-shirt', 'tee', 'top', 'jacket', 'hoodie', 'blouse', 'sweater', 'cardigan', 'coat'];
    
    // 1. First try to match by category field (most reliable)
    const byCategory = outfit.find(item => 
      UPPER_BODY_CATEGORIES.includes(item?.category?.toLowerCase())
    );
    if (byCategory) return byCategory;

    // 2. Fall back to name keyword matching
    const byName = outfit.find(item =>
      UPPER_BODY_KEYWORDS.some(kw => item?.name?.toLowerCase().includes(kw))
    );
    if (byName) return byName;

    // 3. Last resort: return first item
    return outfit[0];
  };

  // Determine the best lower-body garment from the generated outfit
  const getBottomGarment = (outfit) => {
    if (!Array.isArray(outfit) || outfit.length === 0) return null;
    const LOWER_BODY_CATEGORIES = ['bottoms', 'bottom', 'pants', 'trousers', 'jeans', 'shorts', 'skirt'];
    const LOWER_BODY_KEYWORDS = ['pant', 'pants', 'trouser', 'trousers', 'jeans', 'jean', 'shorts', 'short', 'skirt', 'chinos', 'joggers', 'slacks'];

    const top = getTopGarment(outfit);

    // Filter candidate bottoms excluding the chosen top piece if possible
    const candidates = outfit.length > 1 ? outfit.filter(item => item !== top && item?._id !== top?._id) : outfit;

    // 1. First try category match
    const byCategory = candidates.find(item =>
      LOWER_BODY_CATEGORIES.includes(item?.category?.toLowerCase())
    );
    if (byCategory) return byCategory;

    // 2. Fall back to name keyword matching
    const byName = candidates.find(item =>
      LOWER_BODY_KEYWORDS.some(kw => item?.name?.toLowerCase().includes(kw))
    );
    if (byName) return byName;

    return candidates[0] !== top ? candidates[0] : (outfit.length > 1 ? outfit[1] : null);
  };

  useEffect(() => {
    const fetchClothes = () => {
      const url = user?.id
        ? `${API_URL}/api/wardrobe?userId=${encodeURIComponent(user.id)}`
        : `${API_URL}/api/wardrobe`;
      fetch(url)
        .then(res => res.json())
        .then(data => setAvailableItems(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    };

    fetchClothes();

    const handleWardrobeUpdated = () => fetchClothes();
    window.addEventListener('wardrobe_updated', handleWardrobeUpdated);
    return () => window.removeEventListener('wardrobe_updated', handleWardrobeUpdated);
  }, [user?.id]);

  const handleSelectOutfit = (index) => {
    if (outfitRecommendations[index]) {
      setActiveOutfitIndex(index);
      setGeneratedOutfit(outfitRecommendations[index].items || []);
      setStylingReason(outfitRecommendations[index].styling_reason || '');
    }
  };

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
        if (Array.isArray(data.outfits) && data.outfits.length > 0) {
          setOutfitRecommendations(data.outfits);
          setActiveOutfitIndex(0);
          setGeneratedOutfit(data.outfits[0].items || []);
          setStylingReason(data.outfits[0].styling_reason || data.styling_reason);
        } else {
          const selected = availableItems.filter(item => data.selected_ids?.includes(item._id));
          const fallbackLook = {
            id: 'look_1',
            title: 'Look 1: Signature Pairing',
            badge: 'Top Match',
            matchScore: 98,
            items: selected,
            styling_reason: data.styling_reason || `A curated ${style} look for ${occasion}.`,
          };
          setOutfitRecommendations([fallbackLook]);
          setActiveOutfitIndex(0);
          setGeneratedOutfit(selected);
          setStylingReason(fallbackLook.styling_reason);
        }
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

      // 1. Identify clothing items from outfit using unified helpers
      const topItem = getTopGarment(generatedOutfit) || generatedOutfit[0];
      const bottomItem = getBottomGarment(generatedOutfit);

      let finalResult = null;

      // PASS 1: Upper body (or selected single garment)
      if (tryOnTarget === 'bottom' && bottomItem) {
        setTryOnStep('Applying lower garment to your photo...');
        const formData = new FormData();
        formData.append('modelImage', vtonFile);
        formData.append('human_image', vtonFile);
        formData.append('garmentUrl', bottomItem.imageUrl);
        formData.append('garmentImageUrl', bottomItem.imageUrl);
        formData.append('garmentName', bottomItem.name);
        formData.append('category', 'lower');

        const res = await fetch(`${API_URL}/api/ai/try-on`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lower garment try-on failed');
        finalResult = data.resultImageUrl || data.image_url;
      } else {
        // Apply Top
        setTryOnStep(bottomItem && tryOnTarget === 'both' ? 'Step 1/2: Applying top garment...' : 'Applying garment to your photo...');
        const formData = new FormData();
        formData.append('modelImage', vtonFile);
        formData.append('human_image', vtonFile);
        formData.append('garmentUrl', topItem.imageUrl);
        formData.append('garmentImageUrl', topItem.imageUrl);
        formData.append('garmentName', topItem.name);
        formData.append('category', 'upper');

        const res = await fetch(`${API_URL}/api/ai/try-on`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Top garment try-on failed');
        finalResult = data.resultImageUrl || data.image_url;

        // PASS 2: Lower body (sequential chaining for full outfit!)
        if (bottomItem && tryOnTarget === 'both' && finalResult) {
          setTryOnStep('Step 2/2: Applying bottom garment over the look...');

          const intermediateRes = await fetch(finalResult);
          const intermediateBlob = await intermediateRes.blob();
          const intermediateFile = new File([intermediateBlob], 'pass1_result.jpg', { type: 'image/jpeg' });

          const formData2 = new FormData();
          formData2.append('modelImage', intermediateFile);
          formData2.append('human_image', intermediateFile);
          formData2.append('garmentUrl', bottomItem.imageUrl);
          formData2.append('garmentImageUrl', bottomItem.imageUrl);
          formData2.append('garmentName', bottomItem.name);
          formData2.append('category', 'lower');

          const res2 = await fetch(`${API_URL}/api/ai/try-on`, {
            method: 'POST',
            body: formData2,
            signal: controller.signal
          });

          const data2 = await res2.json();
          const pass2Result = data2.resultImageUrl || data2.image_url;
          if (res2.ok && pass2Result) {
            finalResult = pass2Result;
          } else {
            console.warn('Pass 2 (lower) failed, falling back to Pass 1 result');
          }
        }
      }

      if (!finalResult) {
        throw new Error('AI server was unable to generate the garment. Please try again.');
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
    <div className="flex-1 bg-white overflow-y-auto min-h-screen relative pb-24 md:pb-0">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-100 rounded-full blur-[100px] opacity-60 -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-5xl mx-auto p-6 sm:p-10 lg:p-14">
        
        {/* Header */}
        <div className="mb-10 sm:mb-14 flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 flex items-center gap-3">
              <Sparkles className="text-accent w-7 h-7" /> AI Stylist Studio
            </h2>
            <p className="text-sm sm:text-base text-gray-500">Curate occasion-matched outfits tailored to your aesthetic.</p>
          </div>
          <div className="hidden md:flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i && !isGenerating ? 'w-12 bg-primary' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-200 text-sm">
            {errorMsg}
          </div>
        )}

        {!user ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-xl mx-auto my-12 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-700 mx-auto flex items-center justify-center mb-5 shadow-xs">
              <Lock size={28} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Sign In to Use AI Stylist</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md mx-auto">
              Our AI Stylist selects and curates outfits exclusively from your personal digitized wardrobe. Sign in to start styling your clothes.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Occasion */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
                <div className="mb-6">
                  <span className="text-xs font-extrabold text-accent uppercase tracking-wider block mb-1">Step 1 of 2</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Where are you heading?</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Select the event or occasion so our AI can curate contextually appropriate aesthetics.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                  {occasions.map(occ => (
                    <button
                      key={occ.name}
                      onClick={() => {
                        setOccasion(occ.name);
                        setStyle(''); // Reset style selection when changing occasion
                      }}
                      className={`group flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-200 text-left ${
                        occasion === occ.name 
                          ? 'border-primary bg-primary text-white shadow-xl scale-[1.02]' 
                          : 'border-gray-100 bg-gray-50/80 hover:border-gray-300 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <span className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">{occ.icon}</span>
                      <span className="font-extrabold text-base leading-tight mb-1">{occ.name}</span>
                      <span className={`text-[11px] leading-snug ${occasion === occ.name ? 'text-gray-200' : 'text-gray-400'}`}>
                        {occ.subtitle}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button 
                    disabled={!occasion}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm disabled:opacity-30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    Continue to Aesthetics <ArrowRight size={17} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contextual Preferences */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
                <div className="mb-6">
                  <button 
                    onClick={() => setStep(1)} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors mb-2"
                  >
                    <ArrowLeft size={14} /> Change Occasion
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-accent uppercase tracking-wider">Step 2 of 2</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{occasion}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What's your styling aesthetic?</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Styles filtered and curated specifically for <strong>{occasion}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {currentStyles.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setStyle(s.name)}
                      className={`relative overflow-hidden text-left transition-all duration-300 rounded-[2rem] h-72 group ${
                        style === s.name ? 'ring-4 ring-primary shadow-2xl scale-[1.02]' : 'hover:shadow-xl'
                      }`}
                    >
                      <img src={s.img} alt={s.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 p-6 w-full">
                        <div className="flex justify-between items-end">
                          <div className="pr-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-2">
                              {occasion}
                            </span>
                            <h4 className="text-xl font-black text-white mb-1">{s.name}</h4>
                            <p className="text-gray-300 text-xs leading-relaxed">{s.desc}</p>
                          </div>
                          {style === s.name && (
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary flex-shrink-0 shadow-lg">
                              <CheckCircle2 size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setStep(1)} 
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm transition-colors"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button 
                    disabled={!style || isGenerating}
                    onClick={handleGenerate}
                    className="flex items-center gap-2.5 bg-accent text-white px-8 py-4 rounded-2xl font-bold text-sm disabled:opacity-50 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                  >
                    Generate Outfit <Sparkles size={17} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <motion.div key="loading" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center py-28 text-center">
                <div className="relative w-28 h-28 mb-8">
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse w-9 h-9" />
                </div>
                <h4 className="text-2xl font-extrabold text-primary mb-2">Curating Your Outfit...</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  Analyzing color palettes, formality rules, and garment silhouettes for <strong>{occasion}</strong> ({style}).
                </p>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 3 && !isGenerating && (() => {
              const activeLook = outfitRecommendations[activeOutfitIndex] || (outfitRecommendations.length > 0 ? outfitRecommendations[0] : null);
              const topPiece = getTopGarment(generatedOutfit);
              const bottomPiece = getBottomGarment(generatedOutfit);

              return (
                <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                  
                  {/* Look Switcher Bar */}
                  {outfitRecommendations.length > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-extrabold text-accent uppercase tracking-wider">AI Curations</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs font-bold text-gray-500">{outfitRecommendations.length} Curated Combinations</span>
                        </div>
                        <h4 className="text-lg font-black text-gray-900">Choose Your Favorite Look</h4>
                      </div>

                      <div className="flex items-center p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200/80 gap-1.5 overflow-x-auto">
                        {outfitRecommendations.map((look, idx) => (
                          <button
                            key={look.id || idx}
                            onClick={() => handleSelectOutfit(idx)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                              activeOutfitIndex === idx
                                ? 'bg-white text-gray-950 shadow-sm ring-1 ring-black/5 scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${activeOutfitIndex === idx ? 'bg-accent' : 'bg-gray-300'}`} />
                            <span>Look {idx + 1}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                              activeOutfitIndex === idx ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {look.matchScore}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Hero Card for Active Look */}
                  <div className="bg-gray-50 p-8 sm:p-12 rounded-[3rem] border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl opacity-50 -z-0"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700 shadow-xs border border-gray-100">
                            <CheckCircle2 className="text-accent" size={14} /> {activeLook?.badge || 'AI Formality Match'}
                          </span>
                          <span className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold">
                            {occasion}
                          </span>
                          <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold">
                            {style}
                          </span>
                          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black">
                            {activeLook?.matchScore || 98}% Match
                          </span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight text-gray-900">
                          {activeLook?.title || `The Perfect ${style} Look`}
                        </h3>

                        <p className="text-base text-gray-600 leading-relaxed mb-6 italic bg-white/70 p-4 sm:p-5 rounded-2xl border border-gray-100">
                          "{activeLook?.styling_reason || stylingReason}"
                        </p>

                        {/* Item Pills */}
                        <div className="mb-8 flex flex-wrap gap-2">
                          {generatedOutfit.map((item, i) => (
                            <div key={item._id || i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-700 shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-accent"></span>
                              <span className="capitalize">{item.color} {item.name}</span>
                              <span className="text-[10px] text-gray-400 uppercase">({item.category})</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* VTON Button */}
                        <button 
                          onClick={() => setShowVtonModal(true)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-neutral-800 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                        >
                          <Sparkles size={17} /> Virtual Try-On This Look (AI Warp)
                        </button>
                      </div>

                      <div className="flex-1 w-full grid grid-cols-2 gap-4">
                        {generatedOutfit.length > 0 ? (
                          <>
                            {topPiece ? (
                              <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] shadow-lg bg-white">
                                <img src={topPiece.imageUrl} alt={topPiece.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                                  Top Piece
                                </span>
                                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 block">{topPiece.category}</span>
                                  <p className="font-bold text-base leading-snug">{topPiece.name}</p>
                                  <p className="text-xs text-gray-300 capitalize">{topPiece.color}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                <p className="text-xs">No top item</p>
                              </div>
                            )}

                            {bottomPiece ? (
                              <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] shadow-lg bg-white">
                                <img src={bottomPiece.imageUrl} alt={bottomPiece.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                                  Bottom Piece
                                </span>
                                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 block">{bottomPiece.category}</span>
                                  <p className="font-bold text-base leading-snug">{bottomPiece.name}</p>
                                  <p className="text-xs text-gray-300 capitalize">{bottomPiece.color}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                <p className="text-xs">No second item</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="col-span-2 text-center p-10 bg-white rounded-3xl text-gray-500">
                            AI couldn't find a good combination from your current closet. Try uploading more items!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compare All Combinations Section */}
                  {outfitRecommendations.length > 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-extrabold text-gray-900">Compare All Recommendations</h4>
                          <p className="text-xs sm:text-sm text-gray-500">Click any card below to activate and preview that outfit pairing.</p>
                        </div>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                          {outfitRecommendations.length} Curated Looks
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {outfitRecommendations.map((look, idx) => {
                          const isSelected = activeOutfitIndex === idx;
                          return (
                            <div
                              key={look.id || idx}
                              onClick={() => handleSelectOutfit(idx)}
                              className={`cursor-pointer rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between ${
                                isSelected
                                  ? 'border-primary bg-primary/[0.02] shadow-xl ring-2 ring-primary/20 scale-[1.01]'
                                  : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    Look {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-accent">
                                    {look.matchScore}% Match
                                  </span>
                                </div>

                                <h5 className="font-extrabold text-sm text-gray-900 mb-3 leading-snug">
                                  {look.title}
                                </h5>

                                {/* Dual garment preview thumbnail */}
                                {(() => {
                                  const lookTop = getTopGarment(look.items || []);
                                  const lookBottom = getBottomGarment(look.items || []);
                                  const displayItems = [lookTop, lookBottom].filter(Boolean);
                                  return (
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                      {displayItems.map((item, itemIdx) => (
                                        <div key={item._id || itemIdx} className="relative rounded-2xl overflow-hidden aspect-square bg-gray-50 border border-gray-100">
                                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                                          <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                            {item === lookTop ? 'Top' : 'Bottom'}
                                          </span>
                                          <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate capitalize">
                                            {item.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}

                                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4 italic bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                  "{look.styling_reason}"
                                </p>
                              </div>

                              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                                  {isSelected ? '✓ Active Look' : 'Click to select'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOutfit(idx);
                                    setShowVtonModal(true);
                                  }}
                                  className="text-[11px] font-extrabold px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white rounded-xl transition-colors text-gray-700"
                                >
                                  Try On 👗
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center pt-2">
                    <button 
                      onClick={() => { setStep(1); setOccasion(''); setStyle(''); }} 
                      className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-2xl font-bold text-sm transition-all"
                    >
                      <RefreshCw size={16} /> Choose Another Occasion
                    </button>
                  </div>
                </motion.div>
              );
            })()}

          </AnimatePresence>
        </div>
        )}
      </div>

      {/* Virtual Try On Modal */}
      <AnimatePresence>
        {showVtonModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
                    <>
                      <img src={vtonPreviewUrl} alt="Model Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold text-sm">Change Photo</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-50 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud size={24} />
                      </div>
                      <p className="font-bold text-gray-700 mb-1">Click to upload your photo</p>
                      <p className="text-xs text-gray-400">Full-body, standing straight works best</p>
                    </div>
                  )}
                </div>
                
                {/* Combination switcher inside Try-On modal */}
                {outfitRecommendations.length > 1 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Look to Try On</p>
                    <div className="flex bg-gray-200/90 p-1 rounded-2xl gap-1">
                      {outfitRecommendations.map((look, i) => (
                        <button
                          key={look.id || i}
                          type="button"
                          onClick={() => handleSelectOutfit(i)}
                          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all ${
                            activeOutfitIndex === i
                              ? 'bg-white shadow-xs text-primary'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Look {i + 1} ({look.matchScore}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show which garment will be tried on */}
                {generatedOutfit.length > 0 && (() => {
                  const top = getTopGarment(generatedOutfit);
                  const bottom = getBottomGarment(generatedOutfit);
                  const itemsToTryOn = [top?.name, bottom?.name].filter(Boolean).join(' + ');
                  const activeLookTitle = outfitRecommendations[activeOutfitIndex]?.title || `Look ${activeOutfitIndex + 1}`;
                  
                  return itemsToTryOn ? (
                    <div className="bg-white/80 p-3 rounded-2xl border border-gray-200/70 mb-4 shadow-2xs">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-extrabold text-primary">{activeLookTitle}</span>
                        <span className="text-[11px] font-bold text-accent">{outfitRecommendations[activeOutfitIndex]?.matchScore || 98}% Match</span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize">
                        Pieces: <span className="font-bold text-gray-800">{itemsToTryOn}</span>
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* Target Garment Selector */}
                <div className="flex bg-gray-200 p-1 rounded-2xl mb-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setTryOnTarget('both')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${tryOnTarget === 'both' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    ✨ Full Outfit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTryOnTarget('top')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${tryOnTarget === 'top' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    👕 Top Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setTryOnTarget('bottom')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${tryOnTarget === 'bottom' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    👖 Bottom Only
                  </button>
                </div>

                <button 
                  disabled={!vtonFile || isTryingOn}
                  onClick={handleTryOn}
                  className="w-full bg-accent text-white py-4 rounded-full font-bold hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isTryingOn ? (
                    <><RefreshCw className="animate-spin" size={20} /> {tryOnStep || 'Generating Try-On...'}</>
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
                    <p className="text-xs text-center text-gray-400">Powered by Kwai-Kolors Virtual Try-On</p>
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
                      Stitching outfit garments with Kwai-Kolors diffusion. Hang tight!
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
