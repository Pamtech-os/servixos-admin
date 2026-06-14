import { useState, useRef, type FC, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { isOtpRequired } from '@/types/auth';
import { ApiError } from '@/lib/api-client';
import servixLogo from '@/assets/servix-logo.png';
import ThemeToggle from '@/components/ThemeToggle';
import ModernSpinner from '@/components/ModernSpinner';
import { toast } from '@/lib/toast';

type Step = 'credentials' | 'otp';

const BLOBS = [...Array(5)].map((_, i) => i);
const SPARKS = [...Array(12)].map((_, i) => i);

const Login: FC = () => {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithCredentials, loginWithOtp } = useAuth();
  const otpRef = useRef<HTMLInputElement>(null);

  const validateCredentials = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateOtp = () => {
    const errs: Record<string, string> = {};
    if (!otp) errs.otp = 'OTP is required';
    else if (!/^\d{6}$/.test(otp)) errs.otp = 'OTP must be 6 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;
    setLoading(true);
    try {
      const result = await loginWithCredentials(email, password);
      if (isOtpRequired(result)) {
        setOtpToken(result.otpToken);
        setStep('otp');
        setTimeout(() => otpRef.current?.focus(), 100);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateOtp()) return;
    setLoading(true);
    try {
      await loginWithOtp(otpToken, otp);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'OTP verification failed.';
      setErrors({ otp: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    toast.info('Please log in again to request a new OTP.');
    setStep('credentials');
    setOtp('');
    setOtpToken('');
    setErrors({});
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4'>
      <ThemeToggle />

      {BLOBS.map((i) => (
        <motion.div
          key={i}
          className='pointer-events-none absolute rounded-full opacity-20 blur-3xl'
          style={{
            width: `${200 + i * 80}px`,
            height: `${200 + i * 80}px`,
            background: i % 2 === 0 ? 'hsl(217, 91%, 60%)' : 'hsl(270, 70%, 60%)',
          }}
          animate={{
            x: [0, 60 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 40 * (i % 2 === 0 ? -1 : 1), 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ x: (i - 2) * 150, y: (i - 2) * 100 }}
        />
      ))}

      {SPARKS.map((i) => (
        <motion.div
          key={`spark-${i}`}
          className='pointer-events-none absolute h-1 w-1 rounded-full bg-primary'
          animate={{ y: [0, -300], x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
          style={{ left: `${10 + i * 7}%`, bottom: '0%' }}
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
            <h1 className='font-display text-2xl font-bold'>Servix OS</h1>
            <p className='text-sm text-muted-foreground'>
              {step === 'credentials' ? 'Admin sign in' : 'Enter verification code'}
            </p>
          </motion.div>

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className='space-y-5'>
              {errors.form && (
                <p className='rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                  {errors.form}
                </p>
              )}

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete='email'
                />
                {errors.email && <p className='text-xs text-destructive'>{errors.email}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    autoComplete='current-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((v) => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className='text-xs text-destructive'>{errors.password}</p>}
              </div>

              <div className='flex justify-end'>
                <Link to='/forgot-password' className='text-sm text-primary hover:underline'>
                  Forgot password?
                </Link>
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
                      <LogIn size={18} /> Sign In
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className='space-y-5'>
              <div className='rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
                A 6-digit code was sent to <span className='font-medium text-foreground'>{email}</span>.
                It expires in 10 minutes.
              </div>

              <div className='space-y-2'>
                <Label htmlFor='otp'>Verification Code</Label>
                <Input
                  ref={otpRef}
                  id='otp'
                  type='text'
                  inputMode='numeric'
                  pattern='\d{6}'
                  maxLength={6}
                  placeholder='000000'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`text-center text-2xl tracking-[0.5em] ${errors.otp ? 'border-destructive' : ''}`}
                  autoComplete='one-time-code'
                />
                {errors.otp && <p className='text-xs text-destructive'>{errors.otp}</p>}
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
                      <ShieldCheck size={18} /> Verify Code
                    </>
                  )}
                </Button>
              </motion.div>

              <button
                type='button'
                onClick={handleResendOtp}
                className='w-full text-center text-sm text-muted-foreground hover:text-foreground'
              >
                Didn&apos;t receive a code? <span className='text-primary underline'>Go back</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
