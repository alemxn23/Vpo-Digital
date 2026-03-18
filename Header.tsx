import React from 'react';
import { Trophy, Club, Hexagon, Sprout, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full h-24 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm flex items-center justify-between px-6 border-b border-white/5 relative z-50">
      {/* Logo Area */}
      <div className="flex items-center">
        <h1 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.8)] tracking-tighter">
          Trevol<span className="text-sm align-top opacity-80 text-neon-cyan">.bet</span>
        </h1>
      </div>

      {/* Navigation Icons */}
      <nav className="hidden md:flex items-center gap-12">
        <NavItem icon={<Trophy size={24} />} label="SPORTBOOK" color="text-cyan-400" />
        <NavItem icon={<Club size={24} />} label="POKER" color="text-neon-green" active />
        <NavItem icon={<div className="font-bold text-xl border-2 border-fuchsia-500 rounded px-1">777</div>} label="SLOTS" color="text-fuchsia-500" />
        <NavItem icon={<Hexagon size={24} />} label="CASINO" color="text-blue-400" />
        <NavItem icon={<Sprout size={24} />} label="NFT" color="text-yellow-400" />
      </nav>

      {/* User Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 p-[2px]">
              <img 
                src="https://picsum.photos/100/100" 
                alt="User" 
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
          </div>
          <div className="hidden lg:block font-rajdhani">
            <div className="text-white text-sm font-bold">Hola,</div>
            <div className="text-neon-cyan text-lg font-bold leading-none tracking-wide">USUARIO</div>
            <div className="text-neon-green text-sm font-semibold">10,000 SC</div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <LogOut size={28} />
        </button>
      </div>
    </header>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; color: string; active?: boolean }> = ({ icon, label, color, active }) => (
  <div className={`flex flex-col items-center gap-1 cursor-pointer group ${active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
    <div className={`${color} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-110 duration-300`}>
      {icon}
    </div>
    <span className={`${color} text-[10px] font-orbitron tracking-widest font-bold`}>{label}</span>
    {active && <div className={`w-8 h-1 ${color.replace('text-', 'bg-')} rounded-full shadow-[0_0_10px_currentColor] mt-1`} />}
  </div>
);
