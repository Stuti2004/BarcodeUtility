import { useEffect, useRef, useState } from "react";

export default function BarcodeCanvas({ value }) {
  const canvasRef = useRef(null);
  const [drawError, setDrawError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function drawBarcode() {
      if (!canvasRef.current || !value) return;
      setDrawError("");

      try {
        const imported = await import("jsbarcode");
        const JsBarcode = imported.default || imported;

        if (cancelled || !canvasRef.current) return;

        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          lineColor: "#111827",
          background: "#ffffff",
          width: 1.3,
          height: 88,
          displayValue: true,
          fontSize: 12,
          margin: 6,
        });
      } catch {
        setDrawError("Could not render barcode. Please try again.");
      }
    }

    drawBarcode();

    return () => {
      cancelled = true;
    };
  }, [value]);

  const downloadImage = (type) => {
    if (!canvasRef.current) return;
    const mimeType = type === "jpg" ? "image/jpeg" : "image/png";
    const extension = type === "jpg" ? "jpg" : "png";
    const url = canvasRef.current.toDataURL(mimeType, 1);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `barcode.${extension}`;
    anchor.click();
  };

  return (
    <div className="barcode-preview">
      {drawError && <p className="error-text">{drawError}</p>}
      <canvas ref={canvasRef} className="barcode-canvas" />
      <div className="button-row">
        <button onClick={() => downloadImage("png")} className="btn-secondary">
          Download PNG
        </button>
        <button onClick={() => downloadImage("jpg")} className="btn-secondary">
          Download JPG
        </button>
      </div>
    </div>
  );
}
