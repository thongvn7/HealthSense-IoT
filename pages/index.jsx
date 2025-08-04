import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [msg, setMsg] = useState('Loading...')

  useEffect(() => {
    axios.post('/api/records', { test: 'hello from Next.js' })
      .then(res => setMsg(JSON.stringify(res.data, null, 2)))
      .catch(err => setMsg('Error: ' + err.message))
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Test FastAPI ↔ Next.js</h1>
      <pre>{msg}</pre>
    </div>
  )
}
