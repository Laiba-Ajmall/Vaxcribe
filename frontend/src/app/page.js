"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState([]);
  const [language, setLanguage] = useState("");
  const [processingComplete, setProcessingComplete] = useState(false);
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

  async function handleFile(file) {
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus("Uploading...");
    setUploadError("");
    setTranscript("");
    setSegments([]);
    setLanguage("");
    setProcessingComplete(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/process`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "File processing failed."
        );
      }

      setUploadStatus("Transcription complete.");
      setTranscript(data.transcript || "");
      setSegments(data.segments || []);
      setLanguage(data.language || "");
      setProcessingComplete(true);
    } catch (error) {
      console.error("Processing error:", error);
      setUploadStatus("");
      setUploadError(
        error.message || "Unable to process this file."
      );
      setProcessingComplete(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();

    if (isProcessing) return;

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleBrowse() {
    if (isProcessing) return;

    fileInputRef.current?.click();
  }

  function handleUrlSubmit() {
    if (!videoUrl.trim()) return;

    console.log("Video URL:", videoUrl);
  }

  async function handleCopyTranscript() {
    if (!transcript) return;

    try {
      await navigator.clipboard.writeText(transcript);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  function handleDownloadTranscript() {
    if (!transcript) return;

    const blob = new Blob([transcript], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedFile?.name || "vaxcribe-transcript"}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const isProcessing =
    uploadStatus === "Uploading..." ||
    uploadStatus === "Processing..." ||
    uploadStatus === "Transcribing...";

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#142235]">
      <header className="border-b border-[#DFE1DC] bg-[#F8F7F2]">
        <div className="mx-auto flex h-[82px] max-w-[1280px] items-center justify-between px-6 lg:px-10">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[#2E6B5D]">
              <div className="flex items-center gap-[3px]">
                <span className="h-4 w-[2px] rounded-full bg-white" />
                <span className="h-6 w-[2px] rounded-full bg-white" />
                <span className="h-3 w-[2px] rounded-full bg-white" />
                <span className="ml-1 block h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-white" />
              </div>
            </div>

            <span className="text-[24px] font-bold tracking-[-0.7px] text-[#142235]">
              Vaxcribe
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-[15px] text-[#405064] transition hover:text-[#2E6B5D]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-[15px] text-[#405064] transition hover:text-[#2E6B5D]"
            >
              How it works
            </a>

            <a
              href="#formats"
              className="text-[15px] text-[#405064] transition hover:text-[#2E6B5D]"
            >
              Supported formats
            </a>

            <a
              href="#why-vaxcribe"
              className="text-[15px] text-[#405064] transition hover:text-[#2E6B5D]"
            >
              Why Vaxcribe
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-[8px] border border-[#9DB7B0] bg-transparent px-6 py-2.5 text-[15px] font-semibold text-[#315E55] transition hover:bg-[#EEF3F0] sm:block">
              Sign in
            </button>

            <button
              onClick={handleBrowse}
              disabled={isProcessing}
              className="rounded-[8px] bg-[#2E6B5D] px-6 py-2.5 text-[15px] font-semibold text-white transition hover:bg-[#255A4E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Get started
              <span className="ml-2">→</span>
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-[#DFE1DC]">
        <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#55796F]">
                Video transcription
              </p>

              <h1 className="max-w-[590px] text-[52px] font-bold leading-[1.02] tracking-[-2.2px] text-[#142235] sm:text-[60px]">
                Turn your video
                <br />
                into <span className="text-[#2E6B5D]">text.</span>
              </h1>

              <p className="mt-6 max-w-[570px] text-[18px] leading-8 text-[#596878]">
                Convert spoken content from your videos into clear text you
                can read, search, edit, and reuse.
              </p>

              <div className="mt-9 grid max-w-[560px] gap-5 border-t border-[#D9DDD8] pt-7">
                <SimpleFeature
                  title="Accurate transcription"
                  description="Turn spoken content into written text."
                />

                <SimpleFeature
                  title="Easy to upload"
                  description="Drop a video or choose a file from your computer."
                />

                <SimpleFeature
                  title="Search and reuse"
                  description="Find the words you need without replaying the entire video."
                />
              </div>
            </div>

            <div className="w-full">
              <div className="border border-[#D5DAD5] bg-white p-5">
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className="border border-[#D8DED9] bg-[#FCFCFA] px-6 py-12 sm:px-10"
                >
                  <p className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5C8177]">
                    Upload
                  </p>

                  <h2 className="mt-6 text-center text-[28px] font-bold tracking-[-0.8px] text-[#172B40]">
                    {selectedFile ? selectedFile.name : "Drop your video here"}
                  </h2>

                  <p className="mt-3 text-center text-[16px] text-[#697782]">
                    or choose a file from your computer
                  </p>

                  <button
                    onClick={handleBrowse}
                    disabled={isProcessing}
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-[6px] bg-[#2E6B5D] py-[17px] text-[16px] font-semibold text-white transition hover:bg-[#255A4E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg
                      width="20"
                      height="20"
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

                    {isProcessing
                      ? "Processing..."
                      : selectedFile
                        ? "Choose another file"
                        : "Choose video"}
                  </button>

                  <p className="mt-4 text-center text-[14px] text-[#7B8589]">
                    MP4 · MOV · WEBM · AVI · MP3 · WAV
                  </p>

                  {isProcessing && (
                    <div className="mt-5 flex items-center justify-center gap-3 text-[14px] font-medium text-[#397260]">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#C9DDD6] border-t-[#2E6B5D]" />
                      Processing your recording and creating the transcript...
                    </div>
                  )}

                  {processingComplete && (
                    <div className="mt-5 flex items-center justify-center gap-2 text-[14px] font-medium text-[#397260]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E4F0EB]">
                        ✓
                      </span>
                      Transcription completed successfully
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-5 border border-[#E4D2CE] bg-[#FBF3F1] px-4 py-3 text-center text-[14px] text-[#9A5147]">
                      {uploadError}
                    </div>
                  )}

                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#DDE1DD]" />

                    <span className="text-[13px] uppercase tracking-[0.08em] text-[#89918F]">
                      or
                    </span>

                    <div className="h-px flex-1 bg-[#DDE1DD]" />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      placeholder="Paste video URL"
                      className="h-[52px] flex-1 rounded-[6px] border border-[#D5DCD7] bg-white px-4 text-[15px] text-[#203449] outline-none placeholder:text-[#969E9E] focus:border-[#6C9B90]"
                    />

                    <button
                      onClick={handleUrlSubmit}
                      className="h-[52px] rounded-[6px] bg-[#2E6B5D] px-6 text-[15px] font-semibold text-white transition hover:bg-[#255A4E]"
                    >
                      Continue →
                    </button>
                  </div>

                  <div className="mt-7 flex items-center justify-center gap-2 text-[13px] text-[#788482]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        backendStatus === "Backend unavailable"
                          ? "bg-[#B9685D]"
                          : "bg-[#4C8C77]"
                      }`}
                    />

                    <span>
                      {backendStatus === "Backend unavailable"
                        ? "Service unavailable"
                        : "Ready to transcribe"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {transcript && (
            <div className="mt-12 border border-[#D5DAD5] bg-white">
              <div className="flex flex-col gap-4 border-b border-[#D9DDD8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#55796F]">
                    Transcript
                  </p>

                  <h2 className="mt-1 text-[24px] font-bold tracking-[-0.5px] text-[#172B40]">
                    {selectedFile?.name || "Your recording"}
                  </h2>

                  {language && (
                    <p className="mt-1 text-[13px] text-[#788482]">
                      Detected language: {language.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyTranscript}
                    className="flex items-center gap-2 border border-[#CBD5D0] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#315E55] transition hover:bg-[#F2F6F3]"
                  >
                    <SmallIcon type="copy" />
                    Copy
                  </button>

                  <button
                    onClick={handleDownloadTranscript}
                    className="flex items-center gap-2 border border-[#CBD5D0] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#315E55] transition hover:bg-[#F2F6F3]"
                  >
                    <SmallIcon type="download" />
                    Download
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_300px]">
                <div className="px-6 py-7 sm:px-8">
                  <div className="whitespace-pre-wrap text-[16px] leading-8 text-[#334454]">
                    {transcript}
                  </div>
                </div>

                {segments.length > 0 && (
                  <div className="border-t border-[#D9DDD8] bg-[#F8F9F6] px-6 py-6 lg:border-l lg:border-t-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#55796F]">
                      Timeline
                    </p>

                    <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-2">
                      {segments.map((segment, index) => (
                        <div
                          key={`${segment.start}-${index}`}
                          className="border-l-2 border-[#B8CCC5] pl-3"
                        >
                          <p className="text-[11px] font-semibold tracking-[0.06em] text-[#6B817B]">
                            {formatTime(segment.start)}
                            {" — "}
                            {formatTime(segment.end)}
                          </p>

                          <p className="mt-1 text-[13px] leading-5 text-[#53636A]">
                            {segment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="formats" className="border-b border-[#DFE1DC] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#55796F]">
                Supported formats
              </p>

              <h2 className="mt-2 text-[27px] font-bold tracking-[-0.7px] text-[#172B40]">
                Use the files you already have.
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {["MP4", "MOV", "WEBM", "AVI", "MP3", "WAV"].map((format) => (
                <span
                  key={format}
                  className="border border-[#D1DAD5] bg-[#F8FAF8] px-4 py-2 text-[14px] font-medium text-[#405F58]"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-b border-[#DFE1DC] bg-[#F8F7F2]"
      >
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <div className="max-w-[650px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#55796F]">
              How it works
            </p>

            <h2 className="mt-3 text-[40px] font-bold leading-[1.1] tracking-[-1.5px] text-[#142235] sm:text-[46px]">
              Three simple steps.
            </h2>

            <p className="mt-4 text-[17px] leading-7 text-[#64717A]">
              Upload your recording, let Vaxcribe process the speech, and work
              with the resulting text.
            </p>
          </div>

          <div className="mt-14 grid border-y border-[#D9DDD8] md:grid-cols-3">
            <ProcessStep
              number="01"
              icon="upload"
              title="Upload"
              description="Choose a video or audio file from your device."
            />

            <ProcessStep
              number="02"
              icon="transcribe"
              title="Transcribe"
              description="Vaxcribe processes the spoken content and creates a transcript."
            />

            <ProcessStep
              number="03"
              icon="text"
              title="Use your text"
              description="Read, search, copy, edit, and reuse the finished transcript."
            />
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[#DFE1DC] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#55796F]">
                What you can do
              </p>

              <h2 className="mt-3 max-w-[480px] text-[40px] font-bold leading-[1.1] tracking-[-1.4px] text-[#142235]">
                Get more from the words in your videos.
              </h2>
            </div>

            <div className="grid border-t border-[#D9DDD8] sm:grid-cols-2">
              <FeatureBlock
                icon="search"
                title="Search"
                description="Find specific words and sections in your transcript."
              />

              <FeatureBlock
                icon="edit"
                title="Edit"
                description="Review and clean up the text after transcription."
              />

              <FeatureBlock
                icon="copy"
                title="Copy"
                description="Take the text you need and use it somewhere else."
              />

              <FeatureBlock
                icon="download"
                title="Download"
                description="Save your finished transcript for later use."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#DFE1DC] bg-[#F3F4EF]">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#55796F]">
            Built for real recordings
          </p>

          <h2 className="mt-3 max-w-[700px] text-[40px] font-bold leading-[1.1] tracking-[-1.4px] text-[#142235]">
            From lectures to meetings, interviews, and recordings.
          </h2>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "Lectures",
              "Meetings",
              "Interviews",
              "Podcasts",
              "Presentations",
              "Research",
              "Recordings",
              "Videos",
            ].map((item) => (
              <span
                key={item}
                className="border border-[#CBD5D0] bg-white px-5 py-3 text-[15px] text-[#405C56]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="why-vaxcribe"
        className="border-b border-[#DFE1DC] bg-[#214943]"
      >
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#B8D2CB]">
                Why Vaxcribe
              </p>

              <h2 className="mt-4 max-w-[500px] text-[40px] font-bold leading-[1.1] tracking-[-1.4px] text-white sm:text-[46px]">
                Stop replaying the same video to find one sentence.
              </h2>

              <p className="mt-5 max-w-[500px] text-[17px] leading-7 text-[#D2E0DC]">
                Vaxcribe turns spoken information into text you can actually
                work with.
              </p>

              <button
                onClick={handleBrowse}
                disabled={isProcessing}
                className="mt-7 rounded-[6px] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#214943] transition hover:bg-[#EDF2EF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Get started →
              </button>
            </div>

            <div className="border-t border-white/20">
              <WhyRow
                title="Readable"
                description="Turn spoken information into text you can comfortably read."
              />

              <WhyRow
                title="Searchable"
                description="Find important words and sections without replaying everything."
              />

              <WhyRow
                title="Reusable"
                description="Copy, review, edit, and use the finished transcript wherever you need it."
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#F8F7F2]">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 px-6 py-7 text-[14px] text-[#718087] sm:flex-row sm:items-center lg:px-10">
          <p>© 2026 Vaxcribe. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="#" className="transition hover:text-[#2E6B5D]">
              Privacy
            </a>

            <a href="#" className="transition hover:text-[#2E6B5D]">
              Terms
            </a>

            <a href="#" className="transition hover:text-[#2E6B5D]">
              Contact
            </a>
          </div>
        </div>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </main>
  );
}

function formatTime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function SimpleFeature({ title, description }) {
  return (
    <div className="grid grid-cols-[170px_1fr] gap-4">
      <h3 className="text-[15px] font-semibold text-[#203449]">{title}</h3>

      <p className="text-[15px] leading-6 text-[#68757C]">{description}</p>
    </div>
  );
}

function ProcessStep({ number, icon, title, description }) {
  return (
    <div className="border-b border-[#D9DDD8] px-0 py-7 md:border-b-0 md:px-7 md:py-8 md:first:border-r md:last:border-l">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center border border-[#C9D5D0] bg-[#F7FAF8] text-[#2E6B5D]">
          <SmallIcon type={icon} />
        </div>

        <span className="text-[12px] font-semibold tracking-[0.14em] text-[#63877D]">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-[21px] font-bold text-[#172B40]">{title}</h3>

      <p className="mt-2 max-w-[310px] text-[15px] leading-6 text-[#69767D]">
        {description}
      </p>
    </div>
  );
}

function FeatureBlock({ icon, title, description }) {
  return (
    <div className="border-b border-[#D9DDD8] px-0 py-6 sm:px-7 sm:first:border-r">
      <div className="flex h-9 w-9 items-center justify-center border border-[#C9D5D0] bg-[#F7FAF8] text-[#2E6B5D]">
        <SmallIcon type={icon} />
      </div>

      <h3 className="mt-4 text-[19px] font-semibold text-[#172B40]">
        {title}
      </h3>

      <p className="mt-2 max-w-[340px] text-[15px] leading-6 text-[#69767D]">
        {description}
      </p>
    </div>
  );
}

function WhyRow({ title, description }) {
  return (
    <div className="border-b border-white/20 py-7 last:border-b-0">
      <h3 className="text-[20px] font-semibold text-white">{title}</h3>

      <p className="mt-2 max-w-[600px] text-[16px] leading-7 text-[#C8D9D5]">
        {description}
      </p>
    </div>
  );
}

function SmallIcon({ type }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "search") {
    return (
      <svg {...commonProps}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (type === "edit") {
    return (
      <svg {...commonProps}>
        <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
        <path d="m14.5 7.5 3 3" />
      </svg>
    );
  }

  if (type === "copy") {
    return (
      <svg {...commonProps}>
        <rect x="8" y="8" width="11" height="11" rx="1.5" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </svg>
    );
  }

  if (type === "download") {
    return (
      <svg {...commonProps}>
        <path d="M12 4v11" />
        <path d="m7.5 11 4.5 4.5 4.5-4.5" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  if (type === "upload") {
    return (
      <svg {...commonProps}>
        <path d="M12 15V4" />
        <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  if (type === "transcribe") {
    return (
      <svg {...commonProps}>
        <path d="M8 5v14" />
        <path d="M12 8v8" />
        <path d="M16 6v12" />
        <path d="M5 10v4" />
        <path d="M19 9v6" />
      </svg>
    );
  }

  if (type === "text") {
    return (
      <svg {...commonProps}>
        <path d="M5 5h14" />
        <path d="M12 5v14" />
        <path d="M8 19h8" />
      </svg>
    );
  }

  return null;
}