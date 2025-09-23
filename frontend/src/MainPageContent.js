import React, { useEffect, useRef, useState, useCallback } from "react";

const API_URL = 'http://127.0.0.1:8000';

// Accept isImageCachingEnabled as a prop
export default function MainPageContent({ isImageCachingEnabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const unknownInputRef = useRef(null);
  const knownInputRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(true);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [knownFiles, setKnownFiles] = useState([]);

  const startCamera = useCallback(async (facingMode = useFrontCamera ? "user" : "environment") => {
    try {
      setError("");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setIsStreaming(true);
    } catch (e) {
      console.error(e);
      setError(e.message || "Unable to access camera. Check permissions or HTTPS.");
      setIsStreaming(false);
    }
  }, [useFrontCamera]);

  const stopCamera = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedBlob(null);
    setPreviewUrl(null);
    setResult(null);

    if (unknownInputRef.current) unknownInputRef.current.value = "";

    startCamera();
  }, [previewUrl, startCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const flipCamera = async () => {
    setUseFrontCamera((prev) => !prev);
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
      setError("Video not ready yet.");
      return;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    }, "image/jpeg", 0.95);
  };

  const submitToBackend = async () => {
    if (!capturedBlob) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", capturedBlob, "capture.jpg");

      knownFiles.forEach((f) => form.append("known_faces", f, f.name));

      const res = await fetch(`${API_URL}/recognize/`, {
        method: "POST",
        body: form
      });

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      setResult(await res.json());

      if (!isImageCachingEnabled) {        
        setKnownFiles([]); 
        if (knownInputRef.current) knownInputRef.current.value = "";
        stopCamera();
      }

    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  const onFilePick = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(URL.createObjectURL(file));
    setCapturedBlob(file);
  };

  const onKnownPick = (e) => {
    const files = Array.from(e.target.files || []);
    setKnownFiles(files);
  };

  const onKnownReset = (e) => {
    if (knownInputRef.current) knownInputRef.current.value = "";
    setKnownFiles([]);
  };

  return (
    <div className="main-content">
      <button onClick={() => window.location.reload()} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }} className="button button-danger">Reset App</button>
      <h1>Face Recognition Camera</h1>
      <p>Take or upload an image, then send it to the backend for recognition.</p>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="video-container">
            {!previewUrl && <video ref={videoRef} playsInline autoPlay muted />}
            {previewUrl && <img src={previewUrl} alt="preview" />}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <div className="card" style={{ marginTop: '.5rem' }}>
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {!isStreaming ? (
                <button className="button button-primary" onClick={() => startCamera()}>Start Camera</button>
              ) : (
                <>
                  <button className="button button-secondary" onClick={flipCamera}>Flip Camera</button>
                  {!previewUrl && <button className="button button-primary" onClick={captureFrame}>Take Picture</button>}
                  <button className="button button-secondary" onClick={stopCamera}>Reset</button>
                  <button className="button button-secondary" onClick={onKnownReset}>Reset Known Faces</button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="button button-secondary" style={{ cursor: 'pointer' }}>
                Upload Unknown Face
                <input ref={unknownInputRef} type="file" accept="image/*" className="hidden" onChange={onFilePick} />
              </label>
              <label className="button button-secondary" style={{ cursor: 'pointer' }}>
                Upload Known Faces
                <input
                  ref={knownInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onKnownPick}
                />
              </label>
            </div>
            {knownFiles.length > 0 && (
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {knownFiles.length} known face{knownFiles.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h2>Submit for Recognition</h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Backend URL: <code>{API_URL}</code></p>
            <button
              disabled={!capturedBlob || loading}
              onClick={submitToBackend}
              className={`button button-success ${!capturedBlob || loading ? 'button-disabled' : ''}`}
            >
              Recognize this face!
            </button>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="spinner large-spinner">⏳</span>
                <span>Submitting...</span>
              </div>
            )}
          </div>
          <div className="card">
            <h2>Classification</h2>
            {!result && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No result yet.</p>
            )}
            {result && (
              <div style={{ fontSize: '0.875rem', color: '#111', lineHeight: '1.5' }}>
                <p>
                  <strong>Recognized:</strong> {result.result}
                </p>
                {result.distance !== undefined && (
                  <p>
                    <strong>Distance:</strong> {result.distance.toFixed(3)}
                  </p>
                )}
                {result.distances && (
                  <div>
                    <strong>All Distances:</strong>
                    <ul style={{ marginLeft: '1rem' }}>
                      {Object.entries(result.distances).map(([name, dist]) => (
                        <li key={name}>
                          {name}: {dist.toFixed(3)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="card">
            <h2>Additional Known Faces</h2>
            {knownFiles.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                No additional known faces added.
              </p>
            ) : (
              <ul style={{ fontSize: "0.875rem", color: "#111", lineHeight: "1.5" }}>
                {knownFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}