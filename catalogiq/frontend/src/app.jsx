import { useState } from "react"

function App() {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState([])
  const [seo, setSeo] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const res = await fetch(`http://localhost:8000/search?query=${query}&k=8`, { method: "POST" })
    const data = await res.json()
    setProducts(data.results)
    setLoading(false)
  }

  const handleSeo = async (id) => {
    setLoading(true)
    const res = await fetch(`http://localhost:8000/seo/${id}`, { method: "POST" })
    const data = await res.json()
    setSeo(data.seo)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>CatalogIQ</h1>
      <p style={{ color: "#666" }}>AI Product Intelligence | CLIP + FAISS + Gemini 1.5 Flash</p>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. red running shoes" style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
        <button onClick={handleSearch} style={{ padding: "12px 20px", background: "black", color: "white", borderRadius: 8 }}>Search</button>
      </div>

      {loading && <p>Thinking...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 30 }}>
        {products.map((p, i) => (
          <div key={i} onClick={()=>handleSeo(i)} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, cursor: "pointer" }}>
            <div style={{ height: 100, background: "#f5f5f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>IMG</div>
            <p style={{ fontWeight: 600, marginTop: 8 }}>{p.productDisplayName?.slice(0,40)}</p>
            <small>{p.articleType} | {p.baseColour}</small>
          </div>
        ))}
      </div>

      {seo && (
        <div style={{ marginTop: 30, background: "#0a0a0a", color: "#00ff88", padding: 20, borderRadius: 12 }}>
          <h3>Generated SEO (Gemini)</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{seo}</pre>
        </div>
      )}
    </div>
  )
}
export default App