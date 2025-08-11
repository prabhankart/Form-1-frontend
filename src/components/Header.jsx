import React from 'react';
import { Blocks } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0 flex items-center gap-2">
              <Blocks className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Formify</span>
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Features</a>
              <a href="#" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
              <a href="#" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;