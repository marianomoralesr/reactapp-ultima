import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface IDScannerProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const IDScanner: React.FC<IDScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('La cámara no es soportada en este navegador.');
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use the rear camera
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Error accessing camera:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en la configuración de tu navegador.');
        } else {
          setError('No se pudo acceder a la cámara. Intenta con otra cámara o reinicia tu navegador.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop the stream when the component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run only once on mount

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to a file
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `id_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9); // 90% quality JPEG
  };
  
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center" role="dialog" aria-modal="true">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
        onCanPlay={() => setIsLoading(false)}
      ></video>
      
      {/* Overlay and Guide */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg">
          <div className="w-full aspect-[85.6/54] border-4 border-dashed border-white/80 rounded-2xl shadow-lg"></div>
           <p className="text-white text-center mt-4 font-semibold text-lg drop-shadow-md">
            Posiciona tu identificación dentro del recuadro
          </p>
        </div>
      </div>
      
      {isLoading && (
         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p>Iniciando cámara...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Error de Cámara</h3>
            <p className="text-sm">{error}</p>
            <button
                onClick={handleClose}
                className="mt-6 bg-white text-black font-semibold py-2 px-6 rounded-lg"
            >
                Cerrar
            </button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center items-center">
        <button
          onClick={handleCapture}
          disabled={isLoading || !!error}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/50 disabled:opacity-50"
          aria-label="Capturar imagen de ID"
        >
          <Camera className="w-10 h-10 text-gray-800" />
        </button>
      </div>

      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white p-2 bg-black/30 rounded-full"
        aria-label="Cerrar escáner"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Hidden canvas for processing the image */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default IDScanner;