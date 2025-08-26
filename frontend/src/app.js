import React, { useEffect, useRef, useState, useCallback } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function CameraCaptureApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(true);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async (facingMode = useFrontCamera ? "user" : "environment") => {
    try {
      setError("");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const constraints = {
        audio: false,
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // For iOS Safari: muted + playsInline + autoplay attributes are set in JSX
        await video.play();
      }
      setIsStreaming(true);
    } catch (e) {
      console.error(e);
      setError(
        (e && e.message) ||
          "Unable to access camera. Check permissions and that you're on HTTPS or localhost."
      );
      setIsStreaming(false);
    }
  }, [useFrontCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const flipCamera = async () => {
    setUseFrontCamera((prev) => !prev);
    // Restart with new facing mode
    const nextFacing = !useFrontCamera ? "user" : "environment";
    await startCamera(nextFacing);
  };

  const captureFrame = () => {
    setError("");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      setError("Video not ready yet. Try again in a moment.");
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      },
      "image/jpeg",
      0.95
    );
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedBlob(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const submitToBackend = async () => {
    if (!capturedBlob) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      // Name matters for FastAPI's form parser; match your backend parameter (e.g., file: UploadFile)
      form.append("file", capturedBlob, "capture.jpg");

      const res = await fetch(`${API_URL}/recognize`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error (${res.status}): ${text}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to submit to backend.");
    } finally {
      setLoading(false);
    }
  };

  const onFilePick = async (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCapturedBlob(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Face Recognition Camera</h1>
        <p className="mb-4 text-sm text-gray-600">
          Use your device camera to capture an image, then send it to the backend for recognition.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="aspect-video bg-black/5 rounded-xl overflow-hidden flex items-center justify-center border">
              {/* Live video preview */}
              {!previewUrl && (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
              )}

              {/* Captured preview */}
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              )}

              {/* Hidden canvas just for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex flex-wrap gap-2">
              {!isStreaming ? (
                <button
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700"
                >
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={flipCamera}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                  >
                    Flip Camera
                  </button>
                  {!previewUrl && (
                    <button
                      onClick={captureFrame}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700"
                    >
                      Capture
                    </button>
                  )}
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                  >
                    Stop
                  </button>
                </>
              )}

              {previewUrl && (
                <button
                  onClick={retake}
                  className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Retake
                </button>
              )}

              <label className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer">
                Upload File
                <input type="file" accept="image/*" className="hidden" onChange={onFilePick} />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-white">
              <h2 className="font-medium mb-2">Submission</h2>
              <p className="text-xs text-gray-600 mb-3">
                Backend URL: <code className="bg-gray-100 px-1 rounded">{API_URL}</code>
              </p>
              <button
                disabled={!capturedBlob || loading}
                onClick={submitToBackend}
                className={`px-4 py-2 rounded-xl text-white shadow ${
                  !capturedBlob || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading ? "Submitting..." : "Send to /recognize"}
              </button>
            </div>

            <div className="p-4 rounded-xl border bg-white">
              <h2 className="font-medium mb-2">Result</h2>
              {!result && <p className="text-sm text-gray-500">No result yet.</p>}
              {result && (
                <pre className="text-xs overflow-auto p-2 bg-gray-50 rounded-lg">
{JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>

            <div className="p-4 rounded-xl border bg-white">
              <h2 className="font-medium mb-2">Tips</h2>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>On iOS Safari, camera requires HTTPS (or localhost) and <code>playsInline</code>.</li>
                <li>If the camera fails, try the file upload fallback.</li>
                <li>Use <code>VITE_API_URL</code> (Vite) or <code>REACT_APP_API_URL</code> (CRA) to configure the backend.</li>
                <li>The capture uses <code>canvas.toBlob()</code> with JPEG quality 0.95; adjust as needed.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}