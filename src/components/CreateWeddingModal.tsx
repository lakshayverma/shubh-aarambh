import React from 'react';
import { QuickWeddingWizard } from './wizard/QuickWeddingWizard';

interface CreateWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWeddingModal: React.FC<CreateWeddingModalProps> = ({ isOpen, onClose }) => {
  return <QuickWeddingWizard isOpen={isOpen} onClose={onClose} />;
};
