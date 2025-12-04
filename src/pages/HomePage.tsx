import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useInventoryStore } from '@/hooks/use-inventory';
import { useAuthStore } from '@/hooks/use-auth';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

export function HomePage() {
  const [scannerState, setScannerState] = useState<'idle' | 'ready' | 'scanning' | 'error'>('idle');
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [scanEvent, setScanEvent] = useState<string>('PRODUCTION_SCAN');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { addScan } = useInventoryStore();
  const { currentUser } = useAuthStore();
  const userLocation = currentUser?.location || 'Unknown';

  useEffect(() => {
    initializeScanner();
    return () => {
      cleanupScanner();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      setScannerState('idle');
      setScanError(null);

      // Check camera availability first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');

      if (!hasCamera) {
        setScanError('No camera device found on this device');
        setScannerState('error');
        toast.error('No camera found', {
          description: 'Please ensure your device has a camera and permissions are granted.'
        });
        return;
      }

      console.log('[SCANNER_INIT] Camera device found, initializing scanner');

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          useBarCodeDetectorIfSupported: false,
          rememberLastUsedCamera: true,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          showTorchButtonIfSupported: true,
          videoConstraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      // Success callback
      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`[SCAN_SUCCESS] QR Code detected: ${decodedText}`);
        console.log(`[TIMESTAMP] ${new Date().toISOString()}`);

        setLastScannedValue(decodedText);
        setScannerState('scanning');

        handleScanResult(decodedText);
      };

      // Error callback - silently fail on normal "not found" errors
      const onScanFailure = (error: any) => {
        if (typeof error === 'string' && error.includes('NotFoundException')) {
          return;
        }
      };

      scanner.render(onScanSuccess, onScanFailure);
      setScannerState('ready');
      toast.success('Scanner ready', {
        description: 'Point your camera at a QR code to scan'
      });

      console.log('[SCANNER_INIT] Scanner initialized successfully');

    } catch (error: any) {
      console.error('[SCANNER_INIT_ERROR]', error);
      setScanError(error.message || 'Failed to initialize scanner');
      setScannerState('error');
      toast.error('Scanner initialization failed', {
        description: error.message || 'Please check camera permissions'
      });
    }
  };

  const handleScanResult = async (qrValue: string) => {
    setIsLogging(true);
    try {
      await addScan(qrValue, scanEvent as any, userLocation);

      console.log('[SCAN_LOG_SUCCESS] Scan logged successfully');
      setScanError(null);

      // Show success toast
      toast.success('Scan logged successfully!', {
        description: `${qrValue} - ${scanEvent}`,
        duration: 3000
      });

      // Reset after a delay
      setTimeout(() => {
        setLastScannedValue(null);
        setScannerState('ready');
      }, 1500);

    } catch (error: any) {
      console.error('[SCAN_LOG_ERROR]', error);
      const errorMessage = error.message || 'Failed to log scan';
      setScanError(errorMessage);
      toast.error('Failed to log scan', {
        description: errorMessage,
        duration: 5000
      });
      setScannerState('ready');
    } finally {
      setIsLogging(false);
    }
  };

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(error => {
          console.error('[SCANNER_CLEANUP_ERROR]', error);
        });
      } catch (error) {
        console.error('[SCANNER_CLEANUP_FATAL]', error);
      }
      scannerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600">
          Scanning as: <span className="font-semibold">{scanEvent}</span> at <span className="font-semibold">{userLocation}</span>
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        {scannerState === 'idle' && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-2">
            <Loader size={16} className="animate-spin" />
            Initializing...
          </div>
        )}
        {scannerState === 'ready' && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full flex items-center gap-2">
            <CheckCircle size={16} />
            Camera Ready
          </div>
        )}
        {scannerState === 'scanning' && (
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2">
            <Loader size={16} className="animate-spin" />
            Processing scan...
          </div>
        )}
        {scannerState === 'error' && (
          <div className="px-4 py-2 bg-red-100 text-red-800 rounded-full flex items-center gap-2">
            <AlertCircle size={16} />
            Error
          </div>
        )}
      </div>

      {/* Scanner Container */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <div
          id="qr-reader"
          className="w-full"
          style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111827'
          }}
        />
      </div>

      {/* Error Display */}
      {scanError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-red-900">⚠️ Error</p>
          <p className="text-red-700 text-sm">{scanError}</p>
          <button
            onClick={initializeScanner}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Last Scan Result */}
      {lastScannedValue && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Last Scan:</p>
          <p className="text-lg font-mono font-bold text-green-900">{lastScannedValue}</p>
          {isLogging && (
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
              <Loader size={14} className="animate-spin" />
              Logging to database...
            </p>
          )}
        </div>
      )}

      {/* Debug Info */}
      <details className="bg-gray-100 rounded-lg p-4 text-xs text-gray-700">
        <summary className="cursor-pointer font-semibold mb-2">🔧 Debug Info</summary>
        <pre className="bg-white p-2 rounded border border-gray-300 overflow-x-auto">
          {`Scanner State: ${scannerState}
Camera Ready: ${scannerState === 'ready' || scannerState === 'scanning'}
Last Scan: ${lastScannedValue || 'None'}
Scan Event: ${scanEvent}
Location: ${userLocation}
Time: ${new Date().toLocaleString()}`}
        </pre>
      </details>
    </div>
  );
}
