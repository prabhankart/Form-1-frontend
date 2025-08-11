import React from 'react';
import { Blocks, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-2">
                <Blocks className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">Formify</span>
            </div>
            <p className="text-gray-400 text-base">
              The next generation of interactive form building.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white"><Github /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 md:flex md:items-center md:justify-between">
          <p className="mt-4 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; 2025 Formify, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
