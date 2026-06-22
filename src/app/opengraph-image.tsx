import { ImageResponse } from "next/og";

export const alt = "Brajesh Kumar — Salesforce Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          color: "white",
          background: "linear-gradient(135deg, #06172c 0%, #0a335a 60%, #0176d3 100%)",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 5, textTransform: "uppercase", color: "#79cfff" }}>
          Salesforce Developer
        </div>
        <div style={{ marginTop: 28, fontSize: 82, fontWeight: 800, letterSpacing: -4 }}>
          Brajesh Kumar
        </div>
        <div style={{ marginTop: 22, maxWidth: 900, fontSize: 32, lineHeight: 1.35, color: "#c7dced" }}>
          Field Service · Service Cloud · Apex · LWC · Flow · Agentforce
        </div>
      </div>
    ),
    size,
  );
}
