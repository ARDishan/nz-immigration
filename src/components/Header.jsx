import React from 'react';
import logo from '../assets/NZ-Immigration.png';

export default function Header() {
  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Immigration New Zealand Logo"
            className="w-35 h-auto object-contain"
          />
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-8">
          <button className="pb-3 text-m font-bold text-gray-300 hover:text-white transition-colors">
            Request an NZeTA
          </button>
          <button className="pb-3 text-m font-bold text-white border-b-2 border-white">
            Check your NZeTA status
          </button>
          <button className="pb-3 text-m font-bold text-gray-300 hover:text-white transition-colors">
            Update your NZeTA
          </button>
        </nav>
      </div>
    </header>
  );
}
