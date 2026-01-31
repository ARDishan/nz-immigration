import React from 'react';
import footerLogo from '../assets/MBIE_logo.png';

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upper Section */}
        <div className="flex flex-col min-[800px]:flex-row min-[800px]:items-center justify-between mb-6 gap-6 min-[800px]:gap-0">
          <div className="flex items-center gap-3">
            <img
              src={footerLogo}
              alt=""
              className="w-50 h-auto object-contain"
            />
          </div>

          <div className="text-left min-[800px]:text-right">
            <div className="text-sm font-semibold">
              New Zealand Government
            </div>
          </div>
        </div>

        {/* Lower Section */}
        <div className="border-t border-gray-700 pt-6 flex flex-col min-[800px]:flex-row justify-between items-start min-[800px]:items-center text-xs gap-6 min-[800px]:gap-0">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <button className="hover:text-gray-300 transition-colors">ACCESSIBILITY</button>
            <button className="hover:text-gray-300 transition-colors">PRIVACY</button>
            <button className="hover:text-gray-300 transition-colors">COPYRIGHT</button>
            <button className="hover:text-gray-300 transition-colors">TERMS OF USE</button>
            <button className="hover:text-gray-300 transition-colors">CONTACT US</button>
          </div>

          <div className="text-gray-400">
            &copy; 2026 IMMIGRATION NEW ZEALAND (20251211)
          </div>
        </div>
      </div>
    </footer>
  );
}
