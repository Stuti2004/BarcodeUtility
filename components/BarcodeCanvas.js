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

        const pixelRatio =
          typeof window !== "undefined"
            ? Math.max(2, Math.ceil(window.devicePixelRatio || 2))
            : 2;

        // Draw at high internal resolution and display at smaller CSS size
        // for crisp exports and cleaner scan lines.
        const moduleWidth = 2;
        const barHeight = 62;
        const quietMargin = 8;

        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          lineColor: "#02027f",
          background: "#ffffff",
          width: moduleWidth * pixelRatio,
          height: barHeight * pixelRatio,
          displayValue: false,
          margin: quietMargin * pixelRatio,
          flat: true,
        });

        const renderedWidth = Math.max(
          1,
          Math.round(canvasRef.current.width / pixelRatio)
        );
        const renderedHeight = Math.max(
          1,
          Math.round(canvasRef.current.height / pixelRatio)
        );
        canvasRef.current.style.width = `${renderedWidth}px`;
        canvasRef.current.style.height = `${renderedHeight}px`;
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
          Download HQ PNG
        </button>
        <button onClick={() => downloadImage("jpg")} className="btn-secondary">
          Download HQ JPG
        </button>
      </div>
    </div>
  );
}
