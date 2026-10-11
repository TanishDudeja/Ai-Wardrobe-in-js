import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

const HorizontalScrollCarousel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-66%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-neutral-900">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-16 px-10">
          
          {/* Card 1: Digitization */}
          <div className="group relative h-[450px] w-[600px] overflow-hidden bg-neutral-200 rounded-3xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 p-10 text-white">
              <h3 className="text-4xl font-bold mb-4">1. Digitize</h3>
              <p className="text-lg text-neutral-300">Upload photos of your real-world clothing. Our system automatically crops, tags, and organizes everything into your digital closet.</p>
            </div>
          </div>

          {/* Card 2: Visual Matching */}
          <div className="group relative h-[450px] w-[600px] overflow-hidden bg-neutral-200 rounded-3xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 p-10 text-white">
              <h3 className="text-4xl font-bold mb-4">2. Visual Matching</h3>
              <p className="text-lg text-neutral-300">Powered by FashionCLIP. Our AI calculates mathematical embeddings of your clothes to find pieces that visually complement each other.</p>
            </div>
          </div>

          {/* Card 3: Contextual Styling */}
          <div className="group relative h-[450px] w-[600px] overflow-hidden bg-neutral-200 rounded-3xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 p-10 text-white">
              <h3 className="text-4xl font-bold mb-4">3. Contextual Styling</h3>
              <p className="text-lg text-neutral-300">LLaMA 3 acts as your personal stylist. It considers the occasion, season, and your preferences to pick the absolute perfect outfit.</p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-primary">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 lg:px-12 glass sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">AI Wardrobe</Link>
        <div className="space-x-3 flex items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-gray-600">
                Hi, <span className="font-bold text-gray-900">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
              </span>
              <Link to="/dashboard" className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-full hover:bg-opacity-90 transition-all shadow-md">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-accent transition-colors">Log in</Link>
              <Link to="/signup" className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-full hover:bg-opacity-90 transition-all shadow-md">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section (Split Layout) */}
      <section className="flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 min-h-[85vh] max-w-7xl mx-auto gap-12">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left mt-16 lg:mt-0"
        >
          <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
            Scan. Style. <br/><span className="text-accent">Slay.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Your digital closet and personal AI stylist. Digitize your real-world clothing and let our AI engine curate perfect outfits for any occasion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-10 py-4 text-xl font-bold bg-accent text-white rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all text-center">
              Digitize Your Closet
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 text-xl font-bold bg-gray-100 text-primary rounded-full hover:bg-gray-200 transition-colors text-center">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Right: Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full relative pb-12 lg:pb-0"
        >
          {/* Decorative background blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gray-100 rounded-full blur-3xl -z-10"></div>
          
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" 
            alt="AI Stylist Fashion" 
            className="w-full h-auto max-h-[600px] object-cover rounded-[3rem] shadow-2xl border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
          />
          
          {/* Floating UI Element */}
          <div className="absolute -bottom-6 -left-6 lg:-left-12 glass p-4 rounded-2xl flex items-center gap-4 animate-bounce">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">✓</div>
            <div>
              <p className="font-bold text-gray-900">99% Match</p>
              <p className="text-sm text-gray-500">Perfect Outfit Found</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Horizontal Scroll Section */}
      <div className="bg-neutral-900 py-16">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">The Magic Behind the Wardrobe.</h2>
          <p className="text-xl text-neutral-400 max-w-2xl">Scroll down to see how our dual-engine AI pipeline works to make you look your best.</p>
        </div>
      </div>
      <HorizontalScrollCarousel />

      {/* Pricing / Vision Section (Vertical) */}
      <section className="py-32 px-4 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-8">Start for Free. Upgrade for Magic.</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left mt-16">
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100">
              <h3 className="text-3xl font-bold mb-4">Free Tier</h3>
              <p className="text-gray-600 mb-6">Perfect for trying it out.</p>
              <ul className="space-y-4 font-medium">
                <li className="flex items-center gap-3">✓ Up to 15 items in closet</li>
                <li className="flex items-center gap-3">✓ Basic outfit generation</li>
                <li className="flex items-center gap-3">✓ Standard matching</li>
              </ul>
            </div>
            <div className="p-10 rounded-3xl bg-primary text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
              <h3 className="text-3xl font-bold mb-4">Pro Tier <span className="text-lg font-normal text-gray-300">/ $9.99 mo</span></h3>
              <p className="text-gray-300 mb-6">For the fashion forward.</p>
              <ul className="space-y-4 font-medium">
                <li className="flex items-center gap-3">✓ Unlimited closet size</li>
                <li className="flex items-center gap-3">✓ Advanced FashionCLIP matching</li>
                <li className="flex items-center gap-3 text-accent font-bold">✨ Coming Soon: Virtual Try-On</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
