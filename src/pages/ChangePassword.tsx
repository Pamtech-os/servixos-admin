import { useState, type FC, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api-client';
import servixLogo from '@/assets/servix-logo.png';
import ThemeToggle from '@/components/ThemeToggle';
import ModernSpinner from '@/components/ModernSpinner';

const ChangePassword: FC = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { changePassword, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to='/login' replace />;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!current) errs.current = 'Current password is required';
    if (!next) errs.next = 'New password is required';
    else if (next.length < 8) errs.next = 'Must be at least 8 characters';
    if (next !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await changePassword(current, next);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to change password.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4'>
      <ThemeToggle />

      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className='pointer-events-none absolute rounded-full opacity-20 blur-3xl'
          style={{
            width: `${200 + i * 80}px`,
            height: `${200 + i * 80}px`,
            background: i % 2 === 0 ? 'hsl(217, 91%, 60%)' : 'hsl(270, 70%, 60%)',
          }}
          animate={{ x: [0, 50 * (i % 2 === 0 ? 1 : -1), 0], y: [0, 30 * (i % 2 === 0 ? -1 : 1), 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ x: (i - 2) * 150, y: (i - 2) * 100 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='relative z-10 w-full max-w-md'
      >
        <div className='rounded-2xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur-xl'>
          <motion.div
            className='mb-6 flex flex-col items-center gap-3'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <div className='relative'>
              <img src={servixLogo} alt='Servix OS' className='h-14 w-14' />
              <motion.div
                className='absolute -right-1 -top-1'
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className='h-5 w-5 text-accent' />
              </motion.div>
            </div>
            <h1 className='font-display text-2xl font-bold'>Set New Password</h1>
            <p className='text-center text-sm text-muted-foreground'>
              Your account requires a password change before you can continue.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {errors.form && (
              <p className='rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                {errors.form}
              </p>
            )}

            <div className='space-y-2'>
              <Label htmlFor='current'>Current Password</Label>
              <div className='relative'>
                <Input
                  id='current'
                  type={showCurrent ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className={errors.current ? 'border-destructive pr-10' : 'pr-10'}
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrent((v) => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.current && <p className='text-xs text-destructive'>{errors.current}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='next'>New Password</Label>
              <div className='relative'>
                <Input
                  id='next'
                  type={showNext ? 'text' : 'password'}
                  placeholder='Min. 8 characters'
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className={errors.next ? 'border-destructive pr-10' : 'pr-10'}
                  autoComplete='new-password'
                />
                <button
                  type='button'
                  onClick={() => setShowNext((v) => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showNext ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.next && <p className='text-xs text-destructive'>{errors.next}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirm'>Confirm New Password</Label>
              <Input
                id='confirm'
                type='password'
                placeholder='••••••••'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={errors.confirm ? 'border-destructive' : ''}
                autoComplete='new-password'
              />
              {errors.confirm && <p className='text-xs text-destructive'>{errors.confirm}</p>}
            </div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                type='submit'
                className='gradient-bg w-full text-primary-foreground'
                size='lg'
                disabled={loading}
              >
                {loading ? (
                  <ModernSpinner size='md' color='primary-foreground' />
                ) : (
                  <>
                    <KeyRound size={18} /> Change Password
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
