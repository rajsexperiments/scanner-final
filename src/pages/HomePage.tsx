import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useInventoryStore } from '../store/inventoryStore';
import { logScanToGoogleSheets } from '../api/googleSheetClient';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function HomePage() {
  const [scannerState, setScannerState] = useState<'idle' | 'ready' | 'scanning' | 'error'>('idle');
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const userLocation = useInventoryStore((state) => state.userLocation);
  const scanEvent = useInventoryStore((state) => state.scanEvent);

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
        return;
      }

      console.log('[SCANNER_INIT] Camera device found, initializing scanner');

      const scanner = new Html5QrcodeScanner(
        'qr-reader', // HTML element ID
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }, // Use object format
          aspectRatio: 1.0,
          disableFlip: false,
          useBarCodeDetectorIfSupported: false, // CRITICAL: Disable BarcodeDetector
          rememberLastUsedCamera: true,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          showTorchButtonIfSupported: true,
          videoConstraints: {
            facingMode: 'environment', // Back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        /* verbose= */ true // Enable logging
      );

      scannerRef.current = scanner;

      // Success callback
      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`[SCAN_SUCCESS] QR Code detected: ${decodedText}`);
        console.log(`[TIMESTAMP] ${new Date().toISOString()}`);
        console.log(`[FULL_RESULT]`, decodedResult);

        setLastScannedValue(decodedText);
        setScannerState('scanning');

        // Temporarily show success, then reset
        setTimeout(() => {
          handleScanResult(decodedText);
        }, 800);
      };

      // Error callback - don't log every frame
      const onScanFailure = (error: any) => {
        // Silently fail on normal "not found" errors
        if (typeof error === 'string' && error.includes('NotFoundException')) {
          return;
        }
        console.warn(`[SCAN_ERROR] ${error}`);
      };

      // Render the scanner
      scanner.render(onScanSuccess, onScanFailure);
      setScannerState('ready');

      console.log('[SCANNER_INIT] Scanner initialized successfully');

      // Monitor scanner state after 2 seconds
      setTimeout(() => {
        try {
          const state = scanner.getState?.();
          console.log(`[SCANNER_STATE_CHECK] Current state: ${state}`);
        } catch (e) {
          console.log('[SCANNER_STATE_CHECK] State check not supported');
        }
      }, 7000);

    } catch (error: any) {
      console.error('[SCANNER_INIT_ERROR]', error);
      setScanError(error.message || 'Failed to initialize scanner');
      setScannerState('error');
    }
  };

  const handleScanResult = async (qrValue: string) => {
    setIsLogging(true);
    try {
      // Log to Google Sheets
      await logScanToGoogleSheets({
        serialNumber: qrValue,
        scanEvent: scanEvent,
        location: userLocation,
        timestamp: new Date().toISOString(),
        clientId: '' // Optional: add B2B client if needed
      });

      console.log('[SCAN_LOG_SUCCESS] Scan logged to Google Sheets');
      setScanError(null);

      // Show success feedback
      alert(`✓ Scanned: ${qrValue}`);
      setLastScannedValue(null);

    } catch (error: any) {
      console.error('[SCAN_LOG_ERROR]', error);
      setScanError(`Failed to log scan: ${error.message}`);
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
