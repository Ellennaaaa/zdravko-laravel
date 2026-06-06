function EducationalAdvicePopup({ advice, onClose }) {
  if (!advice) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2>💡 {advice.title}</h2>
        <p>{advice.content}</p>

        <button onClick={onClose} style={styles.button}>
          U redu
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  button: {
    marginTop: '15px',
    padding: '10px 18px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}

export default EducationalAdvicePopup