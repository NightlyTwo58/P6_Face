import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function FaceLibraryManager() {
  const [faces, setFaces] = useState([]);
  const [file, setFile] = useState(null);

  const fetchFaces = async () => {
    const res = await fetch(`${API_URL}/faces`);
    const data = await res.json();
    setFaces(data.faces);
  };

  useEffect(() => {
    fetchFaces();
  }, []);

  const uploadFace = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await fetch(`${API_URL}/faces/upload`, { method: "POST", body: form });
    setFile(null);
    fetchFaces();
  };

  const deleteFace = async (name) => {
    await fetch(`${API_URL}/faces/delete/${name}`, { method: "DELETE" });
    fetchFaces();
  };

  return (
    <div className="card">
      <h2>Face Library</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button className="button button-success" onClick={uploadFace}>
        Upload Face
      </button>

      <ul>
        {faces.map((f) => (
          <li key={f}>
            {f}
            <button
              className="button button-danger"
              style={{ marginLeft: "1rem" }}
              onClick={() => deleteFace(f)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
