import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">barcode-web</p>
        <h1>Barcode Utility</h1>
        <p className="subtext">
          Generate a barcode from installation details or scan an existing
          barcode to extract its data.
        </p>
      </section>

      <section className="card-grid">
        <Link href="/generate" className="action-card">
          <h2>Generate Barcode</h2>
          <p>
            Create a barcode from model, sequence, installation date, and
            location.
          </p>
          <span>Open Generator</span>
        </Link>

        <Link href="/scan" className="action-card">
          <h2>Scan Barcode</h2>
          <p>Use your camera or upload an image to decode barcode details.</p>
          <span>Open Scanner</span>
        </Link>
      </section>
    </main>
  );
}
