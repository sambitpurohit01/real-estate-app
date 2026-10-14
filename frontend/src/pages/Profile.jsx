import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageDropzone from '../components/ImageDropzone';
import { resolveImageUrl } from '../utils/format';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => {
    setSuccess(false);
    setForm({ ...form, [field]: e.target.value });
  };

  const initials = form.fullName
    ? form.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile(form);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <h1>Profile Settings</h1>
        </div>

        <div className="form-card">
          {form.avatarUrl ? (
            <img
              className="avatar-preview"
              src={resolveImageUrl(form.avatarUrl)}
              alt="Avatar preview"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="avatar-preview-placeholder">{initials || '?'}</div>
          )}

          {error && <div className="form-error">{error}</div>}
          {success && (
            <div className="form-error" style={{ background: '#EAF2EA', borderColor: 'var(--hedge)', color: 'var(--hedge)' }}>
              Profile updated.
            </div>
          )}

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" required value={form.fullName} onChange={update('fullName')} />
            </div>

            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={update('phone')} placeholder="Optional" />
            </div>

            <ImageDropzone
              label="Profile Picture"
              value={form.avatarUrl}
              onChange={(url) => { setSuccess(false); setForm({ ...form, avatarUrl: url }); }}
            />

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={saving}>
              {saving ? 'Saving\u2026' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
