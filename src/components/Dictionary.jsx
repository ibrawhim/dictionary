import axios from 'axios'
import React, { useContext, useState } from 'react'
import { BsMoon, BsSun } from 'react-icons/bs'
import { VscSearch } from 'react-icons/vsc'
import { HiOutlineSpeakerWave } from 'react-icons/hi2'
import { AppContext } from '../App'

const Dictionary = () => {
  const [entry, setEntry] = useState('')
  const [entryResult, setEntryResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const { setTheme, theme, font, setFont } = useContext(AppContext)

  const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${entry}`

  const playAudio = (url) => {
    if (!url || playing) return
    const audio = new Audio(url)
    setPlaying(true)
    audio.play()
    audio.onended = () => setPlaying(false)
    audio.onerror = () => setPlaying(false)
  }

  const fetchWord = async () => {
    if (!entry.trim()) {
      setError('Please enter a word to search.')
      setEntryResult(null)
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await axios.get(endpoint)
      setEntryResult(result.data)
      setEntry('')
    } catch (err) {
      setEntryResult(null)
      if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.')
      } else if (err.code === 'ERR_BAD_REQUEST') {
        setError(err.response?.data?.title || 'Word not found.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchWord()
  }

  const lookupWord = (word) => {
    setEntry(word)
    setTimeout(() => {
      axios
        .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then((res) => {
          setEntryResult(res.data)
          setError('')
        })
        .catch((err) => {
          setEntryResult(null)
          setError(err.response?.data?.title || 'Word not found.')
        })
    }, 0)
  }

  const data = entryResult?.[0]
  const phonetic = data?.phonetic || data?.phonetics?.find((p) => p.text)?.text || ''
  const audioUrl = data?.phonetics?.find((p) => p.audio && p.audio.trim() !== '')?.audio || ''

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#111110] transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white dark:bg-[#1A1A19] border-b border-black/[0.06] dark:border-white/[0.06] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Lexicon
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="text-[13px] px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 outline-none cursor-pointer"
          >
            <option value="Serif">Serif</option>
            <option value="Poppins">Poppins</option>
            <option value="Caprasimo">Caprasimo</option>
            <option value="Calistoga">Calistoga</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Quicksand">Quicksand</option>
          </select>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            style={{
              width: '56px',
              height: '28px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              position: 'relative',
              transition: 'background 0.4s ease',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #0f0c29, #302b63)'
                : 'linear-gradient(135deg, #74b9ff, #fdcb6e)',
              boxShadow: theme === 'dark'
                ? 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {theme === 'dark' && (
              <>
                <span style={{ position:'absolute', top:'5px', left:'7px', width:'2px', height:'2px', borderRadius:'50%', background:'white', opacity:0.8 }} />
                <span style={{ position:'absolute', top:'10px', left:'13px', width:'1.5px', height:'1.5px', borderRadius:'50%', background:'white', opacity:0.6 }} />
                <span style={{ position:'absolute', top:'7px', left:'18px', width:'1px', height:'1px', borderRadius:'50%', background:'white', opacity:0.9 }} />
              </>
            )}
            {theme !== 'dark' && (
              <span style={{
                position:'absolute', top:'4px', right:'9px',
                width:'10px', height:'10px', borderRadius:'50%',
                background:'rgba(255,220,80,0.5)',
                boxShadow:'0 0 6px 3px rgba(255,220,80,0.35)',
              }} />
            )}
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: theme === 'dark' ? '#e2e8f0' : '#fff',
              position: 'absolute',
              top: '3px',
              left: theme === 'dark' ? '31px' : '3px',
              transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              fontSize: '11px',
              lineHeight: 1,
            }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
          </button>
        </div>
      </nav>

      {/* Hero / Search */}
      <div className="pt-14 pb-8 px-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          English Dictionary
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
          Look up any word
        </h1>

        <form
          onSubmit={handleSubmit}
          className="relative max-w-lg mx-auto flex items-center"
        >
          <VscSearch className="absolute left-4 text-gray-400 dark:text-gray-500" size={17} />
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Type a word…"
            className="w-full pl-11 pr-28 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A19] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[13px] font-medium hover:opacity-85 transition"
          >
            Search
          </button>
        </form>

        {error && (
          <p className="mt-3 text-[13px] text-red-500 flex items-center justify-center gap-1.5">
            <span>⚠</span> {error}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {loading && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !entryResult && !error && (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3">📖</p>
            <p className="text-[15px] text-gray-400 dark:text-gray-600">
              Search for a word to see its definition, phonetics, synonyms, and more.
            </p>
          </div>
        )}

        {!loading && entryResult && data && (
          <>
            {/* Word Header */}
            <div className="mb-6">
              <div className="flex items-baseline flex-wrap gap-3 mb-2">
                <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
                  {data.word}
                </h2>
                {phonetic && (
                  <span className="text-[17px] italic text-gray-400 dark:text-gray-500">
                    {phonetic}
                  </span>
                )}
              </div>
              {audioUrl && (
                <button
                  onClick={() => playAudio(audioUrl)}
                  disabled={playing}
                  className={`inline-flex items-center gap-2 text-[13px] border px-3 py-1.5 rounded-lg transition
                    ${playing
                      ? 'border-black/20 dark:border-white/20 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-white/10 cursor-not-allowed'
                      : 'border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                  <HiOutlineSpeakerWave size={15} className={playing ? 'animate-pulse' : ''} />
                  {playing ? 'Playing…' : 'Hear pronunciation'}
                </button>
              )}
            </div>

            {/* Meanings */}
            {data.meanings.map((meaning, mi) => (
              <div key={mi} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[12px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                    {meaning.partOfSpeech}
                  </span>
                  <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">
                  Definitions
                </p>

                <div className="space-y-2">
                  {meaning.definitions.slice(0, 5).map((def, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#1A1A19] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <span className="text-[12px] font-medium text-gray-300 dark:text-gray-600 mt-0.5 min-w-[18px]">
                          {i + 1}.
                        </span>
                        <div>
                          <p className="text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed">
                            {def.definition}
                          </p>
                          {def.example && (
                            <p className="mt-2 text-[13px] italic text-gray-400 dark:text-gray-500 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                              "{def.example}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Synonyms */}
                {meaning.synonyms?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                      Synonyms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meaning.synonyms.slice(0, 10).map((s, i) => (
                        <button
                          key={i}
                          onClick={() => lookupWord(s)}
                          className="text-[13px] px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-black/20 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-gray-100 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Antonyms */}
                {meaning.antonyms?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                      Antonyms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meaning.antonyms.slice(0, 8).map((a, i) => (
                        <button
                          key={i}
                          onClick={() => lookupWord(a)}
                          className="text-[13px] px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-black/20 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-gray-100 transition"
                        >
                          {a}
                        </button>
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
  )
}

export default Dictionary