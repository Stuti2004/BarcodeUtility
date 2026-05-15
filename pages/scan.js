import { useMemo, useState } from "react";
import Link from "next/link";
import Scanner from "../components/Scanner";

const STORAGE_KEY = "barcode_web_records_v1";

function parsePayload(payload) {
  if (!payload) return null;
  const cleaned = payload.trim();
  if (!cleaned) return null;

  if (cleaned.includes("~")) {
    const parts = cleaned.split("~");
    if (parts.length === 4) {
      const rawDate = parts[2] || "";
      const normalizedDate =
        rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

      return {
        source: "compact",
        modelNo: decodeURIComponent(parts[0] || "") || "-",
        sequenceNumber: decodeURIComponent(parts[1] || "") || "-",
        installationDate: normalizedDate || "-",
        location: decodeURIComponent(parts[3] || "") || "-",
      };
    }
  }

  const parts = cleaned.split(";");
  const mapped = {};

  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (!key || rest.length === 0) continue;
    mapped[key] = decodeURIComponent(rest.join("="));
  }

  if (mapped.MODEL || mapped.SEQ || mapped.DATE || mapped.LOC) {
    return {
      source: "legacy",
      modelNo: mapped.MODEL || "-",
      sequenceNumber: mapped.SEQ || "-",
      installationDate: mapped.DATE || "-",
      location: mapped.LOC || "-",
    };
  }

  return {
    source: "generic",
    modelNo: "-",
    sequenceNumber: cleaned,
    installationDate: "-",
    location: "-",
  };
}

function findStoredDetails(decodedValue, parsedDetails) {
  if (typeof window === "undefined") return null;
  if (!decodedValue || !parsedDetails) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const records = JSON.parse(raw);
    const cleaned = decodedValue.trim();

    const byPayload = records[`payload:${cleaned}`];
    if (byPayload) {
      return {
        source: "lookup",
        modelNo: byPayload.modelNo || "-",
        sequenceNumber: byPayload.sequenceNumber || "-",
        installationDate: byPayload.installationDate || "-",
        location: byPayload.location || "-",
      };
    }

    if (parsedDetails.source === "generic") {
      const bySequence = records[`sequence:${parsedDetails.sequenceNumber}`];
      if (bySequence) {
        return {
          source: "lookup",
          modelNo: bySequence.modelNo || "-",
          sequenceNumber: bySequence.sequenceNumber || "-",
          installationDate: bySequence.installationDate || "-",
          location: bySequence.location || "-",
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export default function ScanPage() {
  const [decodedValue, setDecodedValue] = useState("");
  const details = useMemo(() => {
    const parsed = parsePayload(decodedValue);
    if (!parsed) return null;
    const stored = findStoredDetails(decodedValue, parsed);
    return stored || parsed;
  }, [decodedValue]);

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link href="/" className="text-link">
          Back
        </Link>
        <h1>Scan Barcode</h1>
      </header>

      <Scanner onDecode={setDecodedValue} />

      <section className="panel">
        <h2>Decoded Output</h2>
        {!decodedValue && (
          <p className="muted">
            Start camera scanning or upload an image to decode a barcode.
          </p>
        )}

        {decodedValue && (
          <>
            <p className="raw-output">{decodedValue}</p>
            {details && (
              <>
              <div className="details-grid">
                <div>
                  <strong>Model No.</strong>
                  <p>{details.modelNo}</p>
                </div>
                <div>
                  <strong>Sequence Number</strong>
                  <p>{details.sequenceNumber}</p>
                </div>
                <div>
                  <strong>Date of Installation</strong>
                  <p>{details.installationDate}</p>
                </div>
                <div>
                  <strong>Location</strong>
                  <p>{details.location}</p>
                </div>
              </div>
              {details.source === "generic" && (
                <p className="muted">
                  Generic barcode detected; mapped to Sequence Number.
                </p>
              )}
              {details.source === "lookup" && (
                <p className="muted">
                  Matched saved details from this device.
                </p>
              )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
