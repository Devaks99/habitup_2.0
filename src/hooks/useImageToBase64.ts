import { useState, useEffect, useCallback } from 'react';

interface ImageStatus {
  base64: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
}

export function useImageToBase64(src: string): ImageStatus {
  const [state, setState] = useState<ImageStatus>({ base64: null, status: 'idle' });

  const loadImageToBase64 = useCallback(async (imageSrc: string) => {
    setState({ base64: null, status: 'loading' });
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Create a promise that resolves when image loads
      const loadPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Image load timeout'));
        }, 5000); // 5 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setState({ base64: dataUrl, status: 'ready' });
            resolve();
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load image: ${imageSrc}`));
        };
      });

      img.src = imageSrc;
      await loadPromise;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      setState({ base64: null, status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (src) {
      loadImageToBase64(src);
    } else {
      setState({ base64: null, status: 'idle' });
    }
  }, [src, loadImageToBase64]);

  return state;
}

