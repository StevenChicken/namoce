"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="it">
      <body
        style={{
          fontFamily: "Inter, Arial, Helvetica, sans-serif",
          margin: 0,
          padding: "40px 20px",
          background: "#ffffff",
          color: "#32373c",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Si è verificato un errore
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.5,
              color: "#666",
              marginBottom: "24px",
            }}
          >
            Stiamo lavorando per risolvere il problema. Riprova tra qualche
            istante.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: "#32373c",
              color: "#ffffff",
              borderRadius: "9999px",
              fontSize: "16px",
              padding: "12px 24px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  )
}
