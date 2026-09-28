
"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/status`
        );

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();
        setBackendStatus(data.message);
      } catch (error) {
        console.error(error);
        setBackendStatus("Backend unavailable");
      }
    }

    checkBackend();
  }, []);

  function handleFile(file) {
    if (!file) return;
    setSelectedFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleBrowse() {
    fileInputRef.current?.click();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F7F2] text-[#142235]">
      {/* BACKGROUND SHAPES */}
      <div className="pointer-events-none absolute right-[-70px] top-[120px] h-[300px] w-[300px] rounded-bl-full bg-[#DDE9E4]" />
      <div className="pointer-events-none absolute bottom-[600px] left-[-120px] h-[260px] w-[260px] rounded-tr-full bg-[#D7E5DF]" />
      <div className="pointer-events-none absolute bottom-[380px] right-[-100px] h-[280px] w-[280px] rounded-tl-full bg-[#EEE5D5]" />

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-[#E1E2DC] bg-[#F8F7F2]">
        <div className="mx-auto flex h-[86px] max-w-[1280px] items-center justify-between px-6 lg:px-10">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[15px] bg-[#2E7062]">
              <div className="relative flex items-center gap-[3px]">
                <span className="h-4 w-[3px] rounded-full bg-white" />
                <span className="h-6 w-[3px] rounded-full bg-white" />
                <span className="h-3 w-[3px] rounded-full bg-white" />
                <span className="ml-1 block h-0 w-0 border-y-[9px] border-l-[13px] border-y-transparent border-l-white" />
              </div>
            </div>

            <span className="text-[25px] font-bold tracking-[-0.8px] text-[#142235]">
              Vaxcribe
            </span>
          </div>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-9 md:flex">
            <a
              href="#features"
              className="text-[15px] text-[#304256] transition hover:text-[#2E7062]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-[15px] text-[#304256] transition hover:text-[#2E7062]"
            >
              How it works
            </a>

            <a
              href="#formats"
              className="text-[15px] text-[#304256] transition hover:text-[#2E7062]"
            >
              Supported formats
            </a>

            <a
              href="#why-vaxcribe"
              className="text-[15px] text-[#304256] transition hover:text-[#2E7062]"
            >
              Why Vaxcribe
            </a>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-[10px] border border-[#9EB9B1] px-6 py-3 text-[15px] font-semibold text-[#315E55] transition hover:bg-[#EDF3EF] sm:block">
              Sign in
            </button>

            <button
              onClick={handleBrowse}
              className="rounded-[10px] bg-[#2E7062] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#24594D]"
            >
              Get started
              <span className="ml-2">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pt-24">
          {/* LEFT */}
          <div className="max-w-[560px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#397366]">
              Video transcription
            </p>

            <h1 className="mt-5 text-[54px] font-bold leading-[1.04] tracking-[-2.6px] text-[#10233D] sm:text-[64px] lg:text-[70px]">
              Transcribe
              <br />
              video
              <br />
              <span className="text-[#2E7062]">to text.</span>
            </h1>

            <p className="mt-7 max-w-[500px] text-[19px] leading-[1.65] text-[#586878]">
              Turn spoken content from your videos into clear text you can
              read, search, edit, and reuse.
            </p>

            {/* SIMPLE FEATURES */}
            <div
              id="features"
              className="mt-10 border-t border-[#D8DDD8]"
            >
              <FeatureRow
                title="Accurate transcription"
                description="Convert spoken content into readable text."
              />

              <FeatureRow
                title="Common video & audio formats"
                description="Upload the files you already have."
              />

              <FeatureRow
                title="Searchable text"
                description="Find the words and sections you need."
              />

              <FeatureRow
                title="Ready to reuse"
                description="Review, copy, edit, and use your transcript."
              />
            </div>
          </div>

          {/* RIGHT — TRANSCRIPTION TOOL */}
          <div className="relative lg:-translate-y-10">
            <div className="bg-white p-2 shadow-[0_20px_70px_rgba(32,54,47,0.09)]">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`min-h-[500px] border px-8 py-12 transition sm:px-12 ${
                  dragActive
                    ? "border-[#2E7062] bg-[#F2F8F5]"
                    : "border-[#D8DEDA] bg-[#FCFCFA]"
                }`}
              >
                {/* TOOL LABEL */}
                <p className="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-[#397366]">
                  Upload
                </p>

                {/* UPLOAD TITLE */}
                <h2 className="mt-8 text-center text-[27px] font-bold tracking-[-0.8px] text-[#172B42]">
                  {selectedFile
                    ? selectedFile.name
                    : "Drop your video here"}
                </h2>

                <p className="mt-3 text-center text-[16px] text-[#71808A]">
                  {selectedFile
                    ? "Ready to upload"
                    : "or choose a file from your computer"}
                </p>

                {/* BUTTON */}
                <button
                  onClick={handleBrowse}
                  className="mt-8 flex w-full items-center justify-center gap-3 bg-[#2E7062] py-[18px] text-[17px] font-semibold text-white transition hover:bg-[#255C50]"
                >
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 16V4" />
                    <path d="m7 9 5-5 5 5" />
                    <path d="M5 20h14" />
                  </svg>

                  {selectedFile ? "Choose another file" : "Choose video"}
                </button>

                {/* FORMATS */}
                <p className="mt-4 text-center text-[14px] text-[#7C888C]">
                  MP4 · MOV · WEBM · AVI · MP3 · WAV
                </p>

                {/* DIVIDER */}
                <div className="my-9 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#DDE1DE]" />

                  <span className="text-[13px] uppercase tracking-[0.08em] text-[#8A9292]">
                    or
                  </span>

                  <div className="h-px flex-1 bg-[#DDE1DE]" />
                </div>

                {/* URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste video URL"
                    className="h-[56px] min-w-0 flex-1 border border-[#D8DEDA] bg-white px-4 text-[15px] text-[#203449] outline-none placeholder:text-[#9AA2A3] focus:border-[#6F9F93]"
                  />

                  <button
                    aria-label="Submit video URL"
                    className="flex h-[56px] w-[56px] shrink-0 items-center justify-center bg-[#2E7062] text-white transition hover:bg-[#255C50]"
                  >
                    <span className="text-[24px]">→</span>
                  </button>
                </div>

                {/* BACKEND STATUS */}
                <div className="mt-7 flex items-center justify-center gap-2 text-[13px] text-[#788486]">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      backendStatus === "Backend unavailable"
                        ? "bg-[#C96C5D]"
                        : "bg-[#55947E]"
                    }`}
                  />

                  <span>
                    {backendStatus === "Backend unavailable"
                      ? "Service temporarily unavailable"
                      : "Ready to transcribe"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="relative border-t border-[#E0E2DC] bg-[#F3F2EC]"
      >
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10">
          <div className="max-w-[700px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#397366]">
              How it works
            </p>

            <h2 className="mt-5 text-[42px] font-bold leading-[1.1] tracking-[-1.8px] text-[#142235] sm:text-[50px]">
              From video to text,
              <br />
              in three simple steps.
            </h2>

            <p className="mt-5 max-w-[650px] text-[18px] leading-8 text-[#69757D]">
              Upload your recording, let Vaxcribe handle the transcription,
              then work with the text instead of replaying the video.
            </p>
          </div>

          <div className="mt-16 grid border-t border-[#D5DAD5] md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Upload"
              description="Choose a video or audio file from your device."
            />

            <ProcessStep
              number="02"
              title="Transcribe"
              description="Vaxcribe turns the spoken content into written text."
            />

            <ProcessStep
              number="03"
              title="Use the text"
              description="Read, search, copy, edit, and reuse your transcript."
            />
          </div>
        </div>
      </section>

      {/* SUPPORTED FORMATS */}
      <section
        id="formats"
        className="border-t border-[#E0E2DC] bg-[#F8F7F2]"
      >
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#397366]">
                Supported formats
              </p>

              <h2 className="mt-5 max-w-[650px] text-[42px] font-bold leading-[1.1] tracking-[-1.7px] text-[#142235] sm:text-[48px]">
                Use the files you already have.
              </h2>

              <p className="mt-5 max-w-[620px] text-[18px] leading-8 text-[#69747B]">
                Upload common video and audio formats without changing the way
                you work.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              {["MP4", "MOV", "WEBM", "AVI", "MP3", "WAV"].map(
                (format) => (
                  <span
                    key={format}
                    className="border border-[#C8D6D0] bg-white px-5 py-3 text-[15px] font-semibold text-[#315E55]"
                  >
                    {format}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WHY VAXCRIBE */}
      <section
        id="why-vaxcribe"
        className="relative overflow-hidden bg-[#214943]"
      >
        <div className="mx-auto grid max-w-[1280px] gap-14 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          {/* LEFT */}
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#B7D5CD]">
              Why Vaxcribe
            </p>

            <h2 className="mt-5 max-w-[560px] text-[43px] font-bold leading-[1.08] tracking-[-1.8px] text-white sm:text-[52px]">
              Spend less time
              <br />
              replaying videos.
            </h2>

            <p className="mt-6 max-w-[540px] text-[18px] leading-[1.7] text-[#D1E0DC]">
              Turn spoken content into text that you can actually work with.
              Find information, review what was said, and reuse the transcript
              whenever you need it.
            </p>

            <button
              onClick={handleBrowse}
              className="mt-8 bg-white px-6 py-3.5 text-[15px] font-semibold text-[#214943] transition hover:bg-[#EDF4F1]"
            >
              Get started →
            </button>
          </div>

          {/* RIGHT */}
          <div className="border-t border-white/20">
            <WhyItem
              title="Readable"
              description="Turn spoken information into text you can comfortably read."
            />

            <WhyItem
              title="Searchable"
              description="Find important words and sections without replaying everything."
            />

            <WhyItem
              title="Reusable"
              description="Copy, review, edit, and reuse your finished transcript."
              last
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E0E2DC] bg-[#F8F7F2]">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 px-6 py-7 text-[14px] text-[#718087] sm:flex-row sm:items-center lg:px-10">
          <p>© 2026 Vaxcribe. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="#" className="transition hover:text-[#2E7062]">
              Privacy
            </a>

            <a href="#" className="transition hover:text-[#2E7062]">
              Terms
            </a>

            <a href="#" className="transition hover:text-[#2E7062]">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </main>
  );
}

/* FEATURE ROW */
function FeatureRow({ title, description }) {
  return (
    <div className="flex gap-5 border-b border-[#D8DDD8] py-5">
      <div className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full bg-[#2E7062]" />

      <div>
        <h3 className="text-[16px] font-semibold text-[#203449]">
          {title}
        </h3>

        <p className="mt-1 text-[15px] leading-6 text-[#69747B]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* PROCESS STEP */
function ProcessStep({ number, title, description }) {
  return (
    <div className="border-b border-[#D5DAD5] py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0">
      <span className="text-[12px] font-semibold tracking-[0.12em] text-[#66867D]">
        {number}
      </span>

      <h3 className="mt-5 text-[22px] font-bold text-[#142235]">
        {title}
      </h3>

      <p className="mt-3 max-w-[300px] text-[16px] leading-7 text-[#697278]">
        {description}
      </p>
    </div>
  );
}

/* WHY ITEM */
function WhyItem({ title, description, last = false }) {
  return (
    <div className={`py-7 ${last ? "" : "border-b border-white/20"}`}>
      <h3 className="text-[21px] font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-[520px] text-[16px] leading-[1.65] text-[#C8DAD6]">
        {description}
      </p>
    </div>
  );
}