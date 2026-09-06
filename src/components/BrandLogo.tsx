import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'rounded' | 'circle';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'rounded',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const radiusMap = {
    rounded: size === 'xl' || size === 'lg' ? 'rounded-3xl' : 'rounded-2xl',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`${sizeMap[size]} ${radiusMap[variant]} overflow-hidden bg-slate-950 border border-amber-500/40 shadow-lg shadow-amber-500/20 shrink-0 p-0.5 relative group ${className}`}
    >
      <img
        src="./logo.png"
        alt="Logo PRATAMA BISNIS GRUP"
        className="w-full h-full object-cover rounded-[inherit] transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = './favicon.svg';
        }}
      />
    </div>
  );
};
