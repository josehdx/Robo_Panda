"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, AlertCircle, RefreshCw } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Initialize the scanner on the DOM element with ID 'qr-reader'
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Prioritize the rear camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }, // Defines the scanning area
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // On success, stop the camera to save battery and trigger the callback
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // html5-qrcode throws an error on every frame that doesn't contain a QR code.
          // We ignore these expected failures to prevent console spam.
        }
      );
      setIsLoading(false);
    } catch (err) {
      console.error("Scanner initialization failed:", err);
      setError("Camera access denied or no camera found. Please ensure permissions are granted.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startScanner();

    // Cleanup: Stop the camera stream when the component unmounts
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-gray-900 shadow-xl border border-gray-800">
      {/* Target Container for the Html5Qrcode video feed */}
      <div id="qr-reader" className="w-full h-full min-h-[300px]" />

      {/* Loading State */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 text-white">
          <Camera className="w-8 h-8 mb-4 animate-pulse" />
          <p className="text-sm font-medium">Requesting camera access...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 text-white p-6 text-center">
          <AlertCircle className="w-10 h-10 mb-4 text-red-500" />
          <p className="text-sm text-gray-300 mb-6">{error}</p>
          <button
            onClick={startScanner}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Scanning Overlay (Targeting Box) */}
      {!isLoading && !error && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="relative w-[250px] h-[250px]">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl" />
            
            {/* Animated scanning line */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>
      )}
    </div>
  );
}