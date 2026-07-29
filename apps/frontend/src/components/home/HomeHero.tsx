import React from 'react';

export const HomeHero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1603376277241-70b32265cf10?q=80&w=1467&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
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
