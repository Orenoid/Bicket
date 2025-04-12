import React from 'react';

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ children, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {children}
    </div>
  );
};

export function SemiTransparentOverlay({ onClick }: { onClick: () => void }) {
    return <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={onClick}></div>
}

export function TransparentOverlay({ onClick }: { onClick: () => void }) {
    return <div className="fixed inset-0 bg-transparent z-40" onClick={onClick}></div>
}