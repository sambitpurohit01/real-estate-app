import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const container = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <div className="auth-backdrop" aria-hidden="true">
        <motion.span
          className="auth-orb auth-orb-hedge"
          animate={{ y: [0, -16, 0], x: [0, -12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="auth-orb auth-orb-brass"
          animate={{ y: [0, 14, 0], x: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <div className="container">
        <motion.div
          className="form-card auth-card"
          variants={container}
          initial="initial"
          animate="animate"
        >
          <motion.span className="eyebrow" variants={item}>Get started</motion.span>
          <motion.h1 variants={item} style={{ marginBottom: 24, marginTop: 8 }}>Create an account</motion.h1>

          {error && (
            <motion.div
              className="form-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.25 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={submit}>
            <motion.div className="field" variants={item}>
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" required value={form.fullName} onChange={update('fullName')} />
            </motion.div>
            <motion.div className="field" variants={item}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email} onChange={update('email')} />
            </motion.div>
            <motion.div className="field" variants={item}>
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" value={form.phone} onChange={update('phone')} />
            </motion.div>
            <motion.div className="field" variants={item}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} value={form.password} onChange={update('password')} />
            </motion.div>
            <motion.div variants={item}>
              <motion.button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.015 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? 'Creating account\u2026' : 'Sign up'}
              </motion.button>
            </motion.div>
          </form>

          <motion.p className="text-muted" variants={item} style={{ marginTop: 20, fontSize: '0.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--brass-dark)', fontWeight: 600 }}>Log in</Link>
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
