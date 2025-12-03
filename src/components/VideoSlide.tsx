
import React from 'react';

interface VideoSlideProps {
  title: string;
  videoUrl: string;
  description?: string;
}

const VideoSlide: React.FC<VideoSlideProps> = ({ title, videoUrl, description }) => {
  // Converter URL do YouTube para formato embed
  const getEmbedUrl = (url: string) => {
    const videoId = url.split('/').pop()?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Sanitização básica do HTML
  const sanitizeHtml = (html: string) => {
    // Permitir apenas tags seguras: span, a, br, strong, em
    const allowedTags = ['span', 'a', 'br', 'strong', 'em', 'b', 'i', 'u'];
    const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    
    return html.replace(tagPattern, (match, tag) => {
      if (allowedTags.includes(tag.toLowerCase())) {
        return match;
      }
      return '';
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#52555b] font-roboto text-center">
        {title}
      </h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="aspect-video w-full">
          <iframe
            src={getEmbedUrl(videoUrl)}
            title={title}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {description && (
          <div 
            className="mt-6 pt-4 border-t text-center text-[#52555b] font-opensans leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoSlide;
