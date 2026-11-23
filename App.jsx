import { useRef, useState } from 'react'
import { Activity, Upload, Image as ImageIcon, X, ScanLine, ShieldCheck, Zap, TrendingUp, CircleHelp } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const inputRef = useRef(null)
  const [image, setImage] = useState(null)
  const [file, setFile] = useState(null)
  const [market, setMarket] = useState('Forex')
  const [timeframe, setTimeframe] = useState('15m')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function chooseFile(selected) {
    if (!selected) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type)) {
      setError('Use a PNG, JPG or WEBP chart screenshot.')
      return
    }
    if (selected.size > 12 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 12 MB.')
      return
    }
    setFile(selected)
    setImage(URL.createObjectURL(selected))
    setResult(null)
    setError('')
  }

  async function analyse() {
    if (!file) {
      setError('Upload a chart screenshot first.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const body = new FormData()
      body.append('image', file)
      body.append('market', market)
      body.append('timeframe', timeframe)
      const response = await fetch(`${API_URL}/api/analyse`, { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Analysis failed.')
      setResult(data)
    } catch (e) {
      setError(e.message || 'Could not connect to the analysis server.')
    } finally {
      setLoading(false)
    }
  }

  const signal = result?.signal || 'NO TRADE'
  const signalClass = signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral'

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Activity size={21}/></span><span>PipGenius <b>AI</b></span></a>
      <span className="status"><i/> ANALYSIS STUDIO</span>
    </header>

    <main>
      <section className="hero">
        <div className="eyebrow"><span/> SMART CHART INTELLIGENCE</div>
        <h1>Read the chart.<br/><em>Trade with clarity.</em></h1>
        <p>Upload a Forex or Gold chart screenshot for structured technical analysis.</p>
      </section>

      <section className="panel">
        <div className="section-heading"><div><span className="step">01</span><h2>Chart input</h2></div><span className="muted">PNG · JPG · WEBP</span></div>
        <div className="selectors">
          <label>MARKET<select value={market} onChange={e => setMarket(e.target.value)}><option>Forex</option><option>Gold</option></select></label>
          <label>TIMEFRAME<select value={timeframe} onChange={e => setTimeframe(e.target.value)}>{['1m','5m','15m','30m','1H','4H','1D'].map(t => <option key={t}>{t}</option>)}</select></label>
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => chooseFile(e.target.files?.[0])}/>
        {!image ? <button className="dropzone" onClick={() => inputRef.current?.click()}>
          <span className="upload-icon"><Upload size={22}/></span><strong>Upload chart screenshot</strong><span>Tap to choose an image · Maximum 12 MB</span>
        </button> : <div className="preview-wrap">
          <img src={image} alt="Uploaded chart preview"/>
          <button className="remove-image" aria-label="Remove image" onClick={() => {setImage(null);setFile(null);setResult(null)}}><X size={17}/></button>
          <div className="image-caption"><ImageIcon size={15}/>{file?.name}</div>
        </div>}
        <button className="analyse-btn" onClick={analyse} disabled={!file || loading}>{loading ? <><span className="spinner"/> Analysing chart…</> : <><ScanLine size={18}/> Analyse chart</>}</button>
        {error && <p className="error">{error}</p>}
        <p className="privacy"><ShieldCheck size={14}/> Your screenshot is sent securely to the analysis server when connected.</p>
      </section>

      {result && <section className="panel result-panel">
        <div className="section-heading"><div><span className="step">02</span><h2>Analysis result</h2></div><span className="muted">AI + technical checks</span></div>
        <div className={`signal ${signalClass}`}><span>MARKET BIAS</span><strong>{signal}</strong><small>{result.confidence ? `${result.confidence}% confidence` : 'Confidence not provided'}</small></div>
        <p className="explanation">{result.summary || 'No explanation was returned.'}</p>
        <div className="levels">
          {['entry','stop_loss','take_profit_1','take_profit_2','take_profit_3'].map((key,i) => <div key={key}><span>{['ENTRY','STOP LOSS','TAKE PROFIT 1','TAKE PROFIT 2','TAKE PROFIT 3'][i]}</span><b>{result[key] ?? '—'}</b></div>)}
        </div>
        <p className="disclaimer">Educational chart analysis only. Signals can be wrong; verify independently. No trade is executed by this app.</p>
      </section>}

      {!result && <section className="features">
        <div><Zap size={18}/><b>Adaptive analysis</b><span>Structure, price action and liquidity concepts where relevant.</span></div>
        <div><TrendingUp size={18}/><b>Clear trade levels</b><span>Entry, invalidation and targets when the chart supports them.</span></div>
        <div><CircleHelp size={18}/><b>No forced signal</b><span>Ambiguous charts should return NO TRADE, not a guess.</span></div>
      </section>}
    </main>
    <footer> PIPGENIUS AI <span>·</span> Built for clearer chart study</footer>
  </div>
}
