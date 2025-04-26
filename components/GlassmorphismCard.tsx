import { ReactNode } from 'react';

type GlassmorphismCardProps = {
  children: ReactNode;
  className?: string;
};

const GlassmorphismCard = ({ children, className = '' }: GlassmorphismCardProps) => {
  return (
    <div
      className={`
        relative bg-black/40 border-2 border-white/10 /* Slightly thicker border */
        rounded-sm overflow-hidden group transition-all duration-500
        hover:bg-black/50 hover:border-white/20
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlassmorphismCard;