import React from 'react';

export const HomeHero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&auto=format&fit=crop&q=80" 
          alt="Cloudian Blog Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/45"></div>
      </div>
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 text-center space-y-4">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight font-heading text-white drop-shadow-md animate-fade-up">
          Cloudian's Journey
        </h1>
        <p className="text-xl md:text-2xl text-slate-200 font-bold tracking-wide italic drop-shadow-md animate-fade-up delay-200">
          It's never over.
        </p>
      </div>
    </section>
  );
};
