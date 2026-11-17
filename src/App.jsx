import { useEffect, useRef, useState } from "react";

// relative url on purpose. vite proxy (dev) and nginx (prod) route it to the backend.
const API = "/api";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiUp, setApiUp] = useState(null);
  const fileInput = useRef(null);

  async function loadPosts() {
    try {
      const res = await fetch(`${API}/posts`);
      setPosts(await res.json());
    } catch {
      setError("could not reach the api");
    }
  }

  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => setApiUp(r.ok))
      .catch(() => setApiUp(false));
    loadPosts();
  }, []);

  // show a local preview before uploading
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview({ url, type: file.type });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // files must be sent as FormData, not JSON
    const data = new FormData();
    data.append("title", title);
    data.append("body", body);
    if (file) data.append("file", file);

    try {
      const res = await fetch(`${API}/posts`, { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "upload failed");
      setTitle("");
      setBody("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("delete this post?")) return;
    await fetch(`${API}/posts/${id}`, { method: "DELETE" });
    loadPosts();
  }

  return (
    <div className="wrap">
      <h1>learn deploy</h1>
      <p className="status">
        api:{" "}
        {apiUp === null ? "checking..." : apiUp ? "connected" : "not reachable"}
      </p>

      <form onSubmit={handleSubmit} className="card">
        <input
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="write something"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf,text/plain,application/zip"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />

        {preview && preview.type.startsWith("image/") && (
          <img className="media" src={preview.url} alt="preview" />
        )}
        {preview && preview.type.startsWith("video/") && (
          <video className="media" src={preview.url} controls />
        )}

        {error && <p className="error">{error}</p>}
        <button disabled={loading || !title.trim()}>
          {loading ? "uploading..." : "post"}
        </button>
      </form>

      <div className="list">
        {posts.length === 0 && <p className="muted">no posts yet</p>}
        {posts.map((p) => (
          <div className="card" key={p.id}>
            <div className="row">
              <h3>{p.title}</h3>
              <button
                className="ghost"
                aria-label="delete"
                title="delete"
                onClick={() => handleDelete(p.id)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                  <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
            {p.body && <p>{p.body}</p>}

            {p.file?.kind === "image" && (
              <img className="media" src={p.file.url} alt={p.file.name} />
            )}
            {p.file?.kind === "video" && (
              <video className="media" src={p.file.url} controls />
            )}
            {p.file?.kind === "file" && (
              <a href={p.file.url} target="_blank" rel="noreferrer">
                download {p.file.name}
              </a>
            )}
            <small className="muted">{p.createdAt}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
