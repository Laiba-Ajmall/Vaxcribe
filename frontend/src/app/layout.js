import "./globals.css";

export const metadata = {
  title: "Vaxcribe — Transcribe Video to Text",
  description:
    "Upload a video or audio recording and get a transcript you can read, search, edit, and export.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}