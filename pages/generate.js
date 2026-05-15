import { useMemo, useState } from "react";
import Link from "next/link";
import BarcodeForm from "../components/BarcodeForm";
import BarcodeCanvas from "../components/BarcodeCanvas";

function buildPayload(values) {
  const compactDate = values.installationDate.replaceAll("-", "");
  return [
    encodeURIComponent(values.modelNo.trim()),
    encodeURIComponent(values.sequenceNumber.trim()),
    compactDate,
    encodeURIComponent(values.location.trim()),
  ].join("~");
}

export default function GeneratePage() {
  const [formData, setFormData] = useState(null);

  const barcodeValue = useMemo(() => {
    if (!formData) return "";
    return buildPayload(formData);
  }, [formData]);

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link href="/" className="text-link">
          Back
        </Link>
        <h1>Generate Barcode</h1>
      </header>

      <BarcodeForm onGenerate={setFormData} />

      <section className="panel">
        <h2>Barcode Preview</h2>
        {barcodeValue ? (
          <BarcodeCanvas value={barcodeValue} />
        ) : (
          <p className="muted">
            Fill the form and click generate to preview your barcode.
          </p>
        )}
      </section>
    </main>
  );
}
