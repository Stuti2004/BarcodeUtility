import { useEffect, useRef, useState } from "react";

const readers = [
  "code_128_reader",
  "code_39_reader",
  "ean_reader",
  "ean_8_reader",
  "upc_reader",
  "upc_e_reader",
  "codabar_reader",
  "i2of5_reader",
];

export default function Scanner({ onDecode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [hintText, setHintText] = useState("");
  const cameraContainerRef = useRef(null);
  const quaggaRef = useRef(null);
  const detectHandlerRef = useRef(null);
  const uploadInputRef = useRef(null);

  const getQuagga = async () => {
    if (quaggaRef.current) return quaggaRef.current;
    const imported = await import("quagga");
    quaggaRef.current = imported.default || imported;
    return quaggaRef.current;
  };

  const stopCamera = () => {
    const Quagga = quaggaRef.current;
    if (!Quagga) return;

    if (detectHandlerRef.current) {
      Quagga.offDetected(detectHandlerRef.current);
      detectHandlerRef.current = null;
    }

    try {
      Quagga.stop();
    } catch {
      // Ignore stop errors when stream is already stopped.
    }

    if (cameraContainerRef.current) {
      cameraContainerRef.current.innerHTML = "";
    }

    setIsScanning(false);
    setStatusText("");
  };

  const preflightCameraAccess = async () => {
    if (typeof window === "undefined") return false;

    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

    if (!window.isSecureContext && !isLocalhost) {
      setErrorText(
        "Camera access requires HTTPS on mobile. Open this site with HTTPS to enable scanning."
      );
      setHintText(
        `Current origin: ${window.location.origin}. For testing on phone, use an HTTPS tunnel URL.`
      );
      return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorText("This browser does not support camera access APIs.");
      return false;
    }

    try {
      if (navigator.permissions?.query) {
        const cameraPermission = await navigator.permissions.query({
          name: "camera",
        });

        if (cameraPermission.state === "denied") {
          setErrorText(
            "Camera permission is blocked for this site. Enable it in browser settings and retry."
          );
          return false;
        }
      }
    } catch {
      // Ignore permissions API differences across browsers.
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      setErrorText(
        "Camera permission was not granted. Please allow camera access and retry."
      );
      return false;
    }
  };

  const startCamera = async () => {
    setErrorText("");
    setHintText("");
    setStatusText("Starting camera scanner...");

    try {
      const canUseCamera = await preflightCameraAccess();
      if (!canUseCamera) {
        setStatusText("");
        return;
      }

      const Quagga = await getQuagga();
      stopCamera();

      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: cameraContainerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers,
          },
          locate: true,
        },
        (error) => {
          if (error) {
            setErrorText(
              "Camera could not start. Please allow camera permission and try again."
            );
            setStatusText("");
            return;
          }

          detectHandlerRef.current = (result) => {
            const code = result?.codeResult?.code;
            if (!code) return;
            onDecode(code);
            setStatusText("Barcode detected from camera.");
            stopCamera();
          };

          Quagga.onDetected(detectHandlerRef.current);
          Quagga.start();
          const videoElement = cameraContainerRef.current?.querySelector("video");
          if (videoElement) {
            videoElement.setAttribute("playsinline", "true");
            videoElement.setAttribute("autoplay", "true");
            videoElement.muted = true;
          }
          setIsScanning(true);
          setStatusText("Camera active. Point at a barcode.");
        }
      );
    } catch {
      setErrorText("Scanner failed to initialize.");
      setStatusText("");
      setIsScanning(false);
    }
  };

  const decodeUploadedImage = async (event) => {
    setErrorText("");
    setStatusText("");
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const Quagga = await getQuagga();
      const imageUrl = URL.createObjectURL(file);
      setStatusText("Decoding uploaded image...");

      Quagga.decodeSingle(
        {
          src: imageUrl,
          numOfWorkers: 0,
          locate: true,
          decoder: {
            readers,
          },
        },
        (result) => {
          URL.revokeObjectURL(imageUrl);
          if (uploadInputRef.current) {
            uploadInputRef.current.value = "";
          }

          const code = result?.codeResult?.code;
          if (!code) {
            setErrorText("No barcode was detected in the uploaded image.");
            setStatusText("");
            return;
          }

          onDecode(code);
          setStatusText("Barcode detected from uploaded image.");
        }
      );
    } catch {
      setErrorText("Unable to read uploaded image.");
      setStatusText("");
    }
  };

  useEffect(() => stopCamera, []);

  return (
    <section className="panel">
      <h2>Scan Options</h2>
      <p className="muted">
        Option 1: scan using camera. Option 2: upload an image from gallery.
      </p>

      <div className="button-row">
        {!isScanning ? (
          <button className="btn-primary" onClick={startCamera}>
            Start Camera Scan
          </button>
        ) : (
          <button className="btn-secondary" onClick={stopCamera}>
            Stop Camera
          </button>
        )}
      </div>

      <div className="camera-box" ref={cameraContainerRef} />

      <label className="upload-label">
        Upload Barcode Image
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          onChange={decodeUploadedImage}
        />
      </label>

      {statusText && <p className="status-text">{statusText}</p>}
      {errorText && <p className="error-text">{errorText}</p>}
      {hintText && <p className="muted">{hintText}</p>}
    </section>
  );
}
