import { useState } from "react"
import { getCategoryStyle } from "./categoryVisuals"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #F7F8FA; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 48px 24px; font-family: 'Inter', sans-serif; color: #0B0E14; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .brand-mark { width: 30px; height: 30px; border-radius: 8px; background: #0B0E14; display: flex; align-items: center; justify-content: center; color: #12D6A0; font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 14px; }
  h1 { font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
  .tagline { color: #8B90A0; font-size: 14px; font-family: 'JetBrains Mono', monospace; margin: 8px 0 32px; }
  .search-row { display: flex; gap: 10px; }
  .search-box { flex: 1; display: flex; align-items: center; background: #0B0E14; border-radius: 10px; padding: 0 16px; }
  .search-box span { color: #5B5FEF; font-family: 'JetBrains Mono', monospace; font-size: 15px; margin-right: 6px; }
  .search-box input { flex: 1; background: transparent; border: none; outline: none; color: #F7F8FA; font-family: 'JetBrains Mono', monospace; font-size: 15px; padding: 16px 0; }
  .search-box input::placeholder { color: #4A4E5C; }
  .btn { padding: 0 26px; background: #5B5FEF; color: white; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.15s; }
  .btn:hover { background: #4548CC; }
  .error-banner { margin-top: 16px; padding: 12px 16px; background: #2A1216; border: 1px solid #5E2028; color: #FF8A8A; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
  .empty { margin-top: 60px; text-align: center; color: #8B90A0; font-family: 'JetBrains Mono', monospace; font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 32px; }
  .card { background: white; border: 1px solid #E8E9ED; border-radius: 14px; padding: 14px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(11,14,20,0.08); }
  .visual { height: 150px; border-radius: 10px; background: #F1F2F6; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; position: relative; }
  .visual .icon { font-size: 40px; }
  .tag { position: absolute; top: 10px; left: 10px; font-size: 10px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: white; padding: 3px 9px; border-radius: 20px; }
  .name { font-weight: 600; font-size: 14px; margin: 12px 0 4px; line-height: 1.3; }
  .meta { color: #8B90A0; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
  .skeleton { height: 150px; border-radius: 10px; background: linear-gradient(90deg, #EEF0F3 25%, #E4E6EB 50%, #EEF0F3 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
  .skeleton-line { height: 12px; background: #EEF0F3; border-radius: 4px; margin-top: 12px; width: 70%; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .seo-panel { margin-top: 36px; background: #0B0E14; border-radius: 14px; padding: 24px; }
  .seo-panel h3 { font-family: 'Space Grotesk', sans-serif; color: #12D6A0; margin: 0 0 12px; font-size: 15px; }
  .seo-panel pre { white-space: pre-wrap; color: #D6D8E0; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; margin: 0; }
`

function ProductVisual({ articleType, baseColour }) {
  const { icon, tag } = getCategoryStyle(articleType)
  return (
    <div className="visual">
      <span className="tag" style={{ background: tag }}>{articleType || "item"}</span>
      <span className="icon">{icon}</span>
      {baseColour && <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#8B90A0" }}>{baseColour}</span>}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton" />
      <div className="skeleton-line" />
    </div>
  )
}

function App() {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState([])
  const [seo, setSeo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSeo(null)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}&k=8`, { method: "POST" })
      if (!res.ok) throw new Error(`Backend returned ${res.status}`)
      const data = await res.json()
      setProducts(data.results || [])
      setSearched(true)
    } catch (err) {
      setError(err.message || "Could not reach the search API")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSeo = async (id) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/seo/${id}`, { method: "POST" })
      if (!res.ok) throw new Error(`SEO request returned ${res.status}`)
      const data = await res.json()
      setSeo(data.seo || data.description)
    } catch (err) {
      setError(err.message || "Could not generate SEO copy")
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wrap">
        <div className="brand">
          <div className="brand-mark">C</div>
          <h1>CatalogIQ</h1>
        </div>
        <p className="tagline">clip · faiss · gemini-2.0-flash — semantic product search</p>

        <div className="search-row">
          <div className="search-box">
            <span>▸</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="search the catalog — e.g. red running shoes"
            />
          </div>
          <button className="btn" onClick={handleSearch}>Search</button>
        </div>

        {error && <div className="error-banner">⚠ {error}</div>}

        <div className="grid">
          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          {!loading && products.map((p, i) => (
            <div className="card" key={p._product_id ?? i} onClick={() => handleSeo(p._product_id ?? i)}>
              <ProductVisual articleType={p.articleType} baseColour={p.baseColour} />
              <p className="name">{p.productDisplayName?.slice(0, 42)}</p>
              <p className="meta">{p.articleType} · {p.baseColour}</p>
            </div>
          ))}
        </div>

        {!loading && searched && products.length === 0 && !error && (
          <div className="empty">no matches for "{query}" — try a different search</div>
        )}

        {seo && (
          <div className="seo-panel">
            <h3>generated_listing.json</h3>
            <pre>{seo}</pre>
          </div>
        )}
      </div>
    </>
  )
}

export default App