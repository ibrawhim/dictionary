import axios from 'axios'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { BsMoon, BsSun } from 'react-icons/bs'
import { VscSearch } from 'react-icons/vsc'
import { HiOutlineSpeakerWave } from 'react-icons/hi2'
import { AppContext } from '../App'

const StarField = () => {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animFrame
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`
        ctx.fill()
      })
      animFrame = requestAnimationFrame(draw)
    }
    animFrame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />
}

const FloatingPetals = () => {
  const petals = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 14 + 8}px`,
    delay: `${Math.random() * 12}s`,
    duration: `${Math.random() * 8 + 10}s`,
    rotate: `${Math.random() * 360}deg`,
    color: ['#f9a8d4','#fcd34d','#86efac','#a5b4fc','#fb7185','#fdba74'][Math.floor(Math.random()*6)],
  }))
  return (
    <>
      <style>{`
        @keyframes petalFall {
          0%   { transform: translateY(-60px) rotate(0deg); opacity:0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(100vh) rotate(720deg); opacity:0; }
        }
      `}</style>
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        {petals.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            top: '-40px',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50% 0 50% 0',
            background: p.color,
            opacity: 0.6,
            animation: `petalFall ${p.duration} ${p.delay} infinite linear`,
            transform: `rotate(${p.rotate})`,
          }} />
        ))}
      </div>
    </>
  )
}

const Dictionary = () => {
  const [entry, setEntry] = useState('')
  const [entryResult, setEntryResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  
  const { setTheme, theme = 'dark', font = 'Serif', setFont } = useContext(AppContext)

  const fontMap = {
    'Serif': 'Lora, Georgia, serif',
    'Poppins': 'Poppins, system-ui, sans-serif',
    'Caprasimo': 'Caprasimo, cursive',
    'Calistoga': 'Calistoga, serif',
    'Montserrat': 'Montserrat, sans-serif',
    'Quicksand': 'Quicksand, sans-serif',
  }

  const currentFont = fontMap[font] || 'Lora, Georgia, serif'

  const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${entry}`
  const isDark = theme === 'dark'

  const playAudio = (url) => {
    if (!url || playing) return
    const audio = new Audio(url)
    setPlaying(true)
    audio.play()
    audio.onended = () => setPlaying(false)
    audio.onerror = () => setPlaying(false)
  }

  const fetchWord = async () => {
    if (!entry.trim()) { setError('Please enter a word to search.'); setEntryResult(null); return }
    setLoading(true); setError('')
    try {
      const result = await axios.get(endpoint)
      setEntryResult(result.data); setEntry('')
    } catch (err) {
      setEntryResult(null)
      if (err.code === 'ERR_NETWORK') setError('Network error. Please check your connection.')
      else if (err.code === 'ERR_BAD_REQUEST') setError(err.response?.data?.title || 'Word not found.')
    } finally { setLoading(false) }
  }

  const handleSubmit = (e) => { e.preventDefault(); fetchWord() }

  const lookupWord = (word) => {
    setEntry(word)
    setTimeout(() => {
      axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(res => { setEntryResult(res.data); setError('') })
        .catch(err => { setEntryResult(null); setError(err.response?.data?.title || 'Word not found.') })
    }, 0)
  }

  const data = entryResult?.[0]
  const phonetic = data?.phonetic || data?.phonetics?.find(p => p.text)?.text || ''
  const audioUrl = data?.phonetics?.find(p => p.audio && p.audio.trim() !== '')?.audio || ''

  const bg = isDark
    ? 'linear-gradient(160deg, #04070f 0%, #0b1220 40%, #0e0a1a 70%, #060d18 100%)'
    : 'linear-gradient(160deg, #fef9f0 0%, #fde8f5 35%, #e8f4ff 65%, #f0fdf4 100%)'

  const navBg    = isDark ? 'rgba(8,12,24,0.75)'   : 'rgba(255,252,248,0.75)'
  const navBdr   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const cardBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)'
  const cardBdr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const txt      = isDark ? '#e8eaf0' : '#1a1a2e'
  const sub      = isDark ? '#6b7280' : '#6b7280'
  const accent   = isDark ? '#818cf8' : '#7c3aed'
  const tagBg    = isDark ? 'rgba(129,140,248,0.12)' : 'rgba(124,58,237,0.08)'
  const tagTxt   = isDark ? '#a5b4fc' : '#6d28d9'
  const pillBg   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const pillBdr  = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)'
  const pillHov  = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lora:ital,wght@0,400;0,500;1,400&family=Poppins:wght@400;500;600&family=Caprasimo&family=Calistoga&family=Montserrat:wght@400;500&family=Quicksand:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes auroraShift {
          0%,100% { transform: scale(1) rotate(0deg); opacity: 0.55; }
          50%      { transform: scale(1.15) rotate(8deg); opacity: 0.75; }
        }
        .aurora-blob {
          position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0;
          animation: auroraShift 14s ease-in-out infinite;
        }

        @keyframes cloudDrift {
          0%,100% { transform: translateX(0) scale(1); }
          50%      { transform: translateX(30px) scale(1.06); }
        }
        .cloud-blob {
          position: fixed; border-radius: 50%; filter: blur(70px); pointer-events: none; z-index: 0;
          animation: cloudDrift 18s ease-in-out infinite;
        }

        .grain {
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: ${isDark ? 0.45 : 0.25};
        }

        .dict-root {
          min-height: 100vh;
          position: relative;
          font-family: ${currentFont};
          transition: font-family 0.4s ease, background 0.6s ease;
          background: ${bg};
        }

        .dict-logo, .dict-heading, .word-title, .pos-badge, .section-label {
          font-family: 'Cinzel', serif;
        }

        .dict-nav {
          position: sticky; top: 0; z-index: 20;
          background: ${navBg};
          border-bottom: 1px solid ${navBdr};
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          padding: 0 1.5rem;
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .dict-logo {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.12em;
          color: ${accent};
          text-shadow: ${isDark ? '0 0 20px rgba(129,140,248,0.4)' : 'none'};
        }

        .font-select {
          font-size: 12px; padding: 6px 12px; border-radius: 8px;
          border: 1px solid ${pillBdr};
          background: ${pillBg}; color: ${sub};
          outline: none; cursor: pointer;
        }

        .theme-toggle {
          width: 54px; height: 28px; border-radius: 999px; border: none;
          cursor: pointer; padding: 0; position: relative; overflow: hidden;
          transition: background 0.5s ease;
          background: ${isDark
            ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #bae6fd 0%, #fde68a 100%)'};
          box-shadow: ${isDark
            ? 'inset 0 0 0 1px rgba(129,140,248,0.25), 0 0 12px rgba(99,102,241,0.2)'
            : 'inset 0 0 0 1px rgba(0,0,0,0.08)'};
        }
        .toggle-thumb {
          display: flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%;
          background: ${isDark ? '#c7d2fe' : '#fff'};
          position: absolute; top: 3px;
          left: ${isDark ? '29px' : '3px'};
          transition: left 0.35s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
          font-size: 11px;
        }

        .dict-hero {
          position: relative; z-index: 2;
          padding: 3.5rem 1rem 2rem;
          text-align: center;
        }
        .dict-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
          color: ${accent}; margin-bottom: 0.75rem; opacity: 0.8;
        }
        .dict-heading {
          font-family: 'Cinzel', serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 700;
          color: ${txt};
          line-height: 1.15;
          margin-bottom: 2rem;
          text-shadow: ${isDark ? '0 2px 20px rgba(129,140,248,0.25)' : 'none'};
        }
        .dict-heading em {
          font-style: italic;
          background: ${isDark
            ? 'linear-gradient(90deg, #818cf8, #c084fc)'
            : 'linear-gradient(90deg, #7c3aed, #db2777)'};
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .search-form {
          position: relative; max-width: 520px; margin: 0 auto;
          display: flex; align-items: center;
        }
        .search-icon {
          position: absolute; left: 16px; color: ${sub}; pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 14px 120px 14px 46px;
          border-radius: 16px;
          border: 1px solid ${cardBdr};
          background: ${cardBg};
          backdrop-filter: blur(12px);
          color: ${txt};
          font-family: ${currentFont};
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: ${isDark
            ? '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 4px 24px rgba(0,0,0,0.06)'};
        }
        .search-input::placeholder { color: ${sub}; opacity: 0.6; }
        .search-input:focus {
          border-color: ${accent};
          box-shadow: ${isDark
            ? '0 0 0 3px rgba(129,140,248,0.2), 0 4px 24px rgba(0,0,0,0.4)'
            : '0 0 0 3px rgba(124,58,237,0.15), 0 4px 24px rgba(0,0,0,0.08)'};
        }
        .search-btn {
          position: absolute; right: 8px;
          padding: 8px 18px; border-radius: 10px; border: none;
          background: ${isDark
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(135deg, #7c3aed, #db2777)'};
          color: #fff; font-size: 13px; font-family: 'Cinzel', serif;
          font-weight: 500; letter-spacing: 0.05em;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          box-shadow: ${isDark ? '0 4px 12px rgba(99,102,241,0.4)' : '0 4px 12px rgba(124,58,237,0.3)'};
        }
        .search-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .search-btn:active { transform: translateY(0); }

        .error-msg {
          margin-top: 12px; font-size: 13px; color: #f87171;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .dict-content { position: relative; z-index: 2; max-width: 680px; margin: 0 auto; padding: 0 1rem 5rem; }

        .word-header { margin-bottom: 1.75rem; }
        .word-title {
          font-family: 'Cinzel', serif;
          font-size: clamp(2.4rem, 7vw, 3.5rem);
          font-weight: 700; color: ${txt};
          text-shadow: ${isDark ? '0 2px 30px rgba(129,140,248,0.3)' : 'none'};
          letter-spacing: 0.02em; line-height: 1.1;
        }
        .word-phonetic {
          font-size: 1.1rem; font-style: italic;
          color: ${accent}; margin-left: 12px; opacity: 0.75;
        }
        .audio-btn {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 10px;
          font-size: 13px; font-family: ${currentFont};
          padding: 8px 16px; border-radius: 10px;
          border: 1px solid ${pillBdr};
          background: ${pillBg}; color: ${sub};
          cursor: pointer; transition: all 0.2s;
        }
        .audio-btn:hover:not(:disabled) { background: ${pillHov}; color: ${txt}; }
        .audio-btn:disabled { cursor: not-allowed; opacity: 0.7; }

        .pos-section { margin-bottom: 2.5rem; }
        .pos-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
        .pos-badge {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 999px;
          background: ${tagBg}; color: ${tagTxt};
          border: 1px solid ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(124,58,237,0.2)'};
        }
        .pos-divider { flex: 1; height: 1px; background: ${cardBdr}; }

        .section-label {
          font-family: 'Cinzel', serif;
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: ${sub}; margin-bottom: 10px; opacity: 0.7;
        }

        .def-card {
          background: ${cardBg};
          border: 1px solid ${cardBdr};
          border-radius: 14px; padding: 16px 18px;
          margin-bottom: 10px;
          backdrop-filter: blur(8px);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: ${isDark ? '0 2px 16px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.04)'};
        }
        .def-card:hover {
          border-color: ${isDark ? 'rgba(129,140,248,0.25)' : 'rgba(124,58,237,0.2)'};
          box-shadow: ${isDark ? '0 4px 24px rgba(99,102,241,0.15)' : '0 4px 20px rgba(124,58,237,0.1)'};
        }
        .def-num { font-size: 11px; font-weight: 500; color: ${sub}; min-width: 18px; margin-top: 3px; }
        .def-text { font-size: 15px; color: ${txt}; line-height: 1.75; }
        .def-example {
          margin-top: 10px; font-size: 13px; font-style: italic;
          color: ${sub};
          padding-left: 12px;
          border-left: 2px solid ${isDark ? 'rgba(129,140,248,0.3)' : 'rgba(124,58,237,0.25)'};
        }

        .pill-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .pill-chip {
          font-size: 13px; padding: 6px 14px; border-radius: 999px;
          border: 1px solid ${pillBdr}; background: ${pillBg};
          color: ${sub}; cursor: pointer; transition: all 0.2s;
          font-family: ${currentFont};
        }
        .pill-chip:hover { background: ${pillHov}; color: ${txt}; transform: translateY(-1px); }

        .spinner {
          width: 22px; height: 22px;
          border: 2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
          border-top-color: ${accent};
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state { text-align: center; padding: 4rem 0; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-text { font-size: 15px; color: ${sub}; line-height: 1.6; }

        @media (max-width: 480px) {
          .dict-nav { padding: 0 1rem; }
          .word-title { font-size: 2.2rem; }
        }
      `}</style>

      <div className="dict-root">
        {isDark ? (
          <>
            <StarField />
            <div className="aurora-blob" style={{ width:500, height:500, top:'-100px', left:'-120px', background:'rgba(99,102,241,0.18)', animationDelay:'0s' }} />
            <div className="aurora-blob" style={{ width:380, height:380, top:'30%', right:'-80px', background:'rgba(139,92,246,0.15)', animationDelay:'-5s', animationDuration:'17s' }} />
            <div className="aurora-blob" style={{ width:320, height:320, bottom:'-80px', left:'20%', background:'rgba(56,189,248,0.1)', animationDelay:'-9s', animationDuration:'20s' }} />
            <div className="aurora-blob" style={{ width:260, height:260, bottom:'15%', right:'10%', background:'rgba(244,114,182,0.12)', animationDelay:'-3s', animationDuration:'12s' }} />
          </>
        ) : (
          <>
            <FloatingPetals />
            <div className="cloud-blob" style={{ width:600, height:400, top:'-80px', left:'-100px', background:'rgba(253,186,116,0.35)', animationDelay:'0s' }} />
            <div className="cloud-blob" style={{ width:500, height:500, top:'10%', right:'-150px', background:'rgba(196,181,253,0.3)', animationDelay:'-6s', animationDuration:'22s' }} />
            <div className="cloud-blob" style={{ width:400, height:350, bottom:'-60px', left:'30%', background:'rgba(134,239,172,0.25)', animationDelay:'-10s', animationDuration:'25s' }} />
            <div className="cloud-blob" style={{ width:350, height:300, top:'50%', left:'-60px', background:'rgba(249,168,212,0.3)', animationDelay:'-4s', animationDuration:'19s' }} />
          </>
        )}
        <div className="grain" />

        <nav className="dict-nav">
          <div className="dict-logo">Lexicon</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <select
              value={font}
              onChange={e => setFont(e.target.value)}
              className="font-select"
            >
              {['Serif','Poppins','Caprasimo','Calistoga','Montserrat','Quicksand'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button
              className="theme-toggle"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {isDark && (
                <>
                  <span style={{ position:'absolute', top:6, left:7, width:2, height:2, borderRadius:'50%', background:'rgba(199,210,254,0.9)' }} />
                  <span style={{ position:'absolute', top:12, left:12, width:1.5, height:1.5, borderRadius:'50%', background:'rgba(199,210,254,0.7)' }} />
                  <span style={{ position:'absolute', top:8, left:18, width:1, height:1, borderRadius:'50%', background:'rgba(199,210,254,0.8)' }} />
                </>
              )}
              {!isDark && (
                <span style={{ position:'absolute', top:5, right:8, width:11, height:11, borderRadius:'50%', background:'rgba(255,220,60,0.45)', boxShadow:'0 0 8px 4px rgba(255,220,60,0.3)' }} />
              )}
              <span className="toggle-thumb">{isDark ? '🌙' : '☀️'}</span>
            </button>
          </div>
        </nav>

        <div className="dict-hero">
          <p className="dict-eyebrow">English Dictionary</p>
          <h1 className="dict-heading">
            What does a<br /> <em> word </em> mean?
          </h1>

          <form onSubmit={handleSubmit} className="search-form">
            <VscSearch className="search-icon" size={17} />
            <input
              type="text"
              className="search-input"
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Type a word…"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>

          {error && (
            <p className="error-msg"><span>⚠</span> {error}</p>
          )}
        </div>

        <div className="dict-content">
          {loading && (
            <div style={{ textAlign:'center', padding:'4rem 0' }}>
              <div className="spinner" />
            </div>
          )}

          {!loading && !entryResult && !error && (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <p className="empty-text">
                Search for a word to see its definition,<br />phonetics, synonyms, and more.
              </p>
            </div>
          )}

          {!loading && entryResult && data && (
            <>
              <div className="word-header">
                <div style={{ display:'flex', alignItems:'baseline', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                  <span className="word-title">{data.word}</span>
                  {phonetic && <span className="word-phonetic">{phonetic}</span>}
                </div>
                {audioUrl && (
                  <button
                    className="audio-btn"
                    onClick={() => playAudio(audioUrl)}
                    disabled={playing}
                  >
                    <HiOutlineSpeakerWave size={15} style={playing ? { animation:'pulse 1s infinite' } : {}} />
                    {playing ? 'Playing…' : 'Hear pronunciation'}
                  </button>
                )}
              </div>

              {data.meanings.map((meaning, mi) => (
                <div key={mi} className="pos-section">
                  <div className="pos-header">
                    <span className="pos-badge">{meaning.partOfSpeech}</span>
                    <div className="pos-divider" />
                  </div>

                  <p className="section-label">Definitions</p>

                  <div>
                    {meaning.definitions.slice(0, 5).map((def, i) => (
                      <div key={i} className="def-card">
                        <div style={{ display:'flex', gap:12 }}>
                          <span className="def-num">{i + 1}.</span>
                          <div>
                            <p className="def-text">{def.definition}</p>
                            {def.example && (
                              <p className="def-example">"{def.example}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {meaning.synonyms?.length > 0 && (
                    <div style={{ marginTop:16 }}>
                      <p className="section-label">Synonyms</p>
                      <div className="pill-row">
                        {meaning.synonyms.slice(0, 10).map((s, i) => (
                          <button key={i} className="pill-chip" onClick={() => lookupWord(s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {meaning.antonyms?.length > 0 && (
                    <div style={{ marginTop:16 }}>
                      <p className="section-label">Antonyms</p>
                      <div className="pill-row">
                        {meaning.antonyms.slice(0, 8).map((a, i) => (
                          <button key={i} className="pill-chip" onClick={() => lookupWord(a)}>{a}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Dictionary