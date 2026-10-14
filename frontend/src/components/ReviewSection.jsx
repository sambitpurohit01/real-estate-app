import { useEffect, useState } from 'react';
import { reviewService } from '../api/propertyService';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/format';
import { StarDisplay, StarInput } from './StarRating';

export default function ReviewSection({ propertyId, isOwner }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    reviewService
      .list(propertyId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [propertyId]);

  const alreadyReviewed = user && reviews.some((r) => String(r.userId) === String(user.id));

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Pick a star rating first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await reviewService.create(propertyId, { rating, comment });
      setRating(0);
      setComment('');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="detail-section">
      <h4>Reviews {reviews.length > 0 && `(${reviews.length})`}</h4>

      {reviews.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <StarDisplay rating={avg} size={20} />
          <span className="mono text-muted">{avg.toFixed(1)} out of 5</span>
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading reviews&hellip;</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet &mdash; be the first to leave one.</p>
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-item-header">
                {r.userAvatarUrl ? (
                  <img className="review-avatar" src={resolveImageUrl(r.userAvatarUrl)} alt={r.userName} />
                ) : (
                  <div className="review-avatar review-avatar-fallback">{r.userName?.[0]}</div>
                )}
                <div>
                  <div className="review-author">{r.userName}</div>
                  <StarDisplay rating={r.rating} size={13} />
                </div>
              </div>
              {r.comment && <p style={{ marginTop: 8 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {user && !isOwner && !alreadyReviewed && (
        <form onSubmit={submit} className="review-form">
          <h4 style={{ marginTop: 24 }}>Leave a review</h4>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>Your rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div className="field">
            <label htmlFor="comment">Comment (optional)</label>
            <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your experience with this listing or owner?" />
          </div>
          <button type="submit" className="btn btn-outline" disabled={submitting}>
            {submitting ? 'Submitting\u2026' : 'Submit Review'}
          </button>
        </form>
      )}

      {user && alreadyReviewed && (
        <p className="text-muted" style={{ marginTop: 16, fontSize: '0.85rem' }}>You've already reviewed this listing.</p>
      )}
    </div>
  );
}
