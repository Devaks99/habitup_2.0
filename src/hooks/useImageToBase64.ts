import { useState, useEffect, useCallback } from 'react';

export function useImageToBase64(src: string): string | null {
  const [base64, setBase64] = useState<string | null>(null);

  const loadImageToBase64 = useCallback(async (imageSrc: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle potential CORS if external
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          setBase64(dataUrl);
        } else {
          setBase64(null);
        }
      };
      img.onerror = () => {
        console.error('Failed to load image:', imageSrc);
        setBase64(null);
      };
      img.src = imageSrc;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      setBase64(null);
    }
  }, []);

  useEffect(() => {
    if (src) {
      loadImageToBase64(src);
    } else {
      setBase64(null);
    }
  }, [src, loadImageToBase64]);

  return base64;
}

