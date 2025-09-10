import React from 'react';
import PCConfigForm from '@/components/PCConfigForm';

interface PCBuilderProps {
  onNavigate?: (tabId: string) => void;
}

const PCBuilder: React.FC<PCBuilderProps> = ({ onNavigate }) => {
  return (
    <div className="h-full">
      <PCConfigForm onNavigate={onNavigate} />
    </div>
  );
};

export default PCBuilder;
