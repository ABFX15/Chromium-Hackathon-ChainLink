"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark", // Using 'dark' theme to match the site's aesthetic
  securityLevel: "loose",
  fontFamily: "monospace",
  logLevel: 4, // 1=debug, 2=info, 3=warn, 4=error, 5=fatal
  // Overriding theme variables for a more custom look
  themeVariables: {
    background: "#0d1117",
    primaryColor: "#1e293b", // Darker background for nodes
    primaryTextColor: "#e2e8f0", // Light text
    primaryBorderColor: "#38bdf8", // Cyan border for nodes
    lineColor: "#334155", // Greyish lines for arrows
    secondaryColor: "#38bdf8",
    tertiaryColor: "#1e293b",
  },
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chart && containerRef.current) {
      // Generate a unique ID for each render to avoid conflicts
      const id = `mermaid-diagram-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      mermaid
        .render(id, chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error("Mermaid render error:", err);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<p class="text-red-400">Error rendering diagram.</p>`;
          }
        });
    }
  }, [chart]);

  return <div ref={containerRef} className="w-full h-full" />;
}
