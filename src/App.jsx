import Piano from './components/Piano'

export default function App() {
  return (
    <main>
      <h1 style={{
        color: '#fff',
        textAlign: 'center',
        marginBottom: '2rem',
        fontFamily: 'sans-serif',
        fontWeight: 300,
        letterSpacing: '0.1em'
      }}>
        🎹 PIANO
      </h1>
      <Piano />
    </main>
  )
}