import { useState } from "react";

const today = new Date().toISOString().split("T")[0];

export default function BarcodeForm({ onGenerate }) {
  const [modelNo, setModelNo] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState("");
  const [installationDate, setInstallationDate] = useState(today);
  const [location, setLocation] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    onGenerate({
      modelNo,
      sequenceNumber,
      installationDate,
      location,
    });
  };

  return (
    <section className="panel">
      <h2>Enter Details</h2>
      <form className="form-stack" onSubmit={onSubmit}>
        <label>
          Model No.
          <input
            type="text"
            placeholder="Ex: AX-600"
            value={modelNo}
            onChange={(event) => setModelNo(event.target.value)}
            required
          />
        </label>

        <label>
          Sequence Number
          <input
            type="text"
            placeholder="Ex: 000143"
            value={sequenceNumber}
            onChange={(event) => setSequenceNumber(event.target.value)}
            required
          />
        </label>

        <label>
          Date of Installation
          <input
            type="date"
            value={installationDate}
            onChange={(event) => setInstallationDate(event.target.value)}
            required
          />
        </label>

        <label>
          Location
          <input
            type="text"
            placeholder="Ex: Plant A - Bay 3"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn-primary">
          Generate Barcode
        </button>
      </form>
    </section>
  );
}
