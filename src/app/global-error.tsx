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
          padding: 0,
          background: "#ffffff",
          color: "#32373c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            textAlign: "center",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(207, 46, 46, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cf2e2e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "12px",
              color: "#32373c",
            }}
          >
            Si è verificato un errore
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#abb8c3",
              marginBottom: "32px",
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
              fontSize: "15px",
              fontWeight: 500,
              padding: "12px 32px",
              border: "none",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  )
}
