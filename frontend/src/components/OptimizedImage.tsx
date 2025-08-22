
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackIcon?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width = 50,
  height = 30,
  fallbackIcon = '🚛'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  useEffect(() => {
    if (retryCount <= maxRetries && !loaded) {
      const img = new Image();
      
      img.onload = () => {
        setLoaded(true);
        setError(false);
      };
      
      img.onerror = () => {
        if (retryCount < maxRetries) {
          console.log(`Tentativa ${retryCount + 1} falhou, tentando novamente...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        } else {
          setError(true);
        }
      };
      
      img.src = src;
    }
  }, [src, retryCount, loaded]);

  if (error) {
    return (
      <span 
        className={className}
        style={{ fontSize: '1.2em' }}
      >
        {fallbackIcon}
      </span>
    );
  }

  if (!loaded) {
    return (
      <span 
        className={className}
        style={{ 
          fontSize: '1.2em',
          opacity: 0.7,
          animation: retryCount > 0 ? 'pulse 1s infinite' : 'none'
        }}
      >
        🔄
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default OptimizedImage;