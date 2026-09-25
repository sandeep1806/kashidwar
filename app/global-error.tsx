"use client";

/** Root error boundary: no layout exists here, so it carries its own html/body and inline tokens. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="hi">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0B0A14", color: "#D9D4C7", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
        <div style={{ padding: "2rem" }}>
          <p style={{ color: "#FFD27A", letterSpacing: "0.3em", fontSize: 12 }}>काशी · KASHI</p>
          <h1 style={{ color: "#F6F1E7", fontWeight: 600, fontSize: "2rem", margin: "1rem 0" }}>दीया बुझ गया · The lamp went out</h1>
          <p>कुछ गड़बड़ हो गई। · Something went wrong.</p>
          {error.digest && <p style={{ opacity: 0.5, fontSize: 12 }}>{error.digest}</p>}
          <button onClick={reset} style={{ marginTop: "2rem", background: "#E0782A", color: "#0B0A14", border: 0, borderRadius: 12, padding: "0.9rem 1.8rem", fontSize: 16, cursor: "pointer" }}>
            फिर से जलाएँ · Light it again
          </button>
        </div>
      </body>
    </html>
  );
}
