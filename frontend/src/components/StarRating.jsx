export function StarDisplay({ rating, size = 16 }) {
  const rounded = Math.round((rating || 0) * 2) / 2;
  return (
    <span className="star-display" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'star-filled' : 'star-empty'}>&#9733;</span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <span className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={n <= value ? 'star-filled' : 'star-empty'}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          &#9733;
        </button>
      ))}
    </span>
  );
}
