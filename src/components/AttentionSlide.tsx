
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AttentionSlideProps {
  title: string;
  content: string;
  imageUrl?: string;
}

const AttentionSlide: React.FC<AttentionSlideProps> = ({ title, content, imageUrl }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <AlertTriangle className="w-12 h-12 text-[#d61c00]" />
        <h2 className="text-4xl font-bold text-[#d61c00] font-roboto">
          {title}
        </h2>
        <AlertTriangle className="w-12 h-12 text-[#d61c00]" />
      </div>
      
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 shadow-lg border-2 border-[#d61c00]">
        <div className="text-center space-y-6">
          {imageUrl && (
            <div className="flex justify-center">
              <img 
                src={imageUrl} 
                alt={title}
                className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
              />
            </div>
          )}
          <p className="text-lg text-[#52555b] font-opensans leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttentionSlide;
