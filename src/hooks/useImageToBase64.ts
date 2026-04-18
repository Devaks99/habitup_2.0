import { useState, useEffect, useCallback } from 'react';

interface ImageStatus {
  base64: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
}

const imageBase64Cache = new Map<string, string>();
const imageBase64Promises = new Map<string, Promise<string>>();

async function convertImageToBase64(imageSrc: string): Promise<string> {
  const cached = imageBase64Cache.get(imageSrc);
  if (cached) {
    return cached;
  }

  const pending = imageBase64Promises.get(imageSrc);
  if (pending) {
    return pending;
  }

  const promise = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    const timeout = window.setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 7000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = async () => {
      try {
        await img.decode().catch(() => undefined);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        imageBase64Cache.set(imageSrc, dataUrl);
        cleanup();
        resolve(dataUrl);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };

    img.src = imageSrc;
  }).finally(() => {
    imageBase64Promises.delete(imageSrc);
  });

  imageBase64Promises.set(imageSrc, promise);
  return promise;
}

export function useImageToBase64(src: string): ImageStatus {
  const [state, setState] = useState<ImageStatus>(() => {
    if (src && imageBase64Cache.has(src)) {
      return { base64: imageBase64Cache.get(src) ?? null, status: 'ready' };
    }
    return { base64: null, status: 'idle' };
  });

  const loadImageToBase64 = useCallback(async (imageSrc: string) => {
    const cached = imageBase64Cache.get(imageSrc);
    if (cached) {
      setState({ base64: cached, status: 'ready' });
      return;
    }

    setState({ base64: null, status: 'loading' });
    try {
      const dataUrl = await convertImageToBase64(imageSrc);
      setState({ base64: dataUrl, status: 'ready' });
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

