import { useMemo, useState } from "react";
import Link from "next/link";
import BarcodeForm from "../components/BarcodeForm";
import BarcodeCanvas from "../components/BarcodeCanvas";

const STORAGE_KEY = "barcode_web_records_v1";

function buildPayload(values) {
  const compactDate = values.installationDate.replaceAll("-", "");
  return [
    encodeURIComponent(values.modelNo.trim()),
    encodeURIComponent(values.sequenceNumber.trim()),
    compactDate,
    encodeURIComponent(values.location.trim()),
  ].join("~");
}

function saveBarcodeRecord(values, payload) {
  if (typeof window === "undefined") return;

  const normalized = {
    modelNo: values.modelNo.trim() || "-",
    sequenceNumber: values.sequenceNumber.trim() || "-",
    installationDate: values.installationDate || "-",
    location: values.location.trim() || "-",
  };

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    const records = existing ? JSON.parse(existing) : {};
    records[`payload:${payload}`] = normalized;
    records[`sequence:${normalized.sequenceNumber}`] = normalized;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore local storage write failures.
  }
}

export default function GeneratePage() {
  const [formData, setFormData] = useState(null);

  const handleGenerate = (values) => {
    const payload = buildPayload(values);
    saveBarcodeRecord(values, payload);
    setFormData(values);
  };

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

      <BarcodeForm onGenerate={handleGenerate} />

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
