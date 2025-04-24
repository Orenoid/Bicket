import { cn } from '@/lib/shadcn/utils';
import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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

export function ContainerOverlay({
  onClick,
  className = "bg-black opacity-50",
  children
}: {
  onClick?: () => void,
  className?: string,
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn("absolute inset-0 z-50", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function LoadingContainerOverlay() {
  return (
    <ContainerOverlay className="bg-white opacity-50">
      <div className="flex items-center justify-center h-full">
        <AiOutlineLoading3Quarters className="animate-spin" />
      </div>
    </ContainerOverlay>
  );
}
