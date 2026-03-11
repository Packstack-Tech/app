import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/InputOtp'
import { Loading } from '@/components/ui/Loading'
import { Mixpanel } from '@/lib/mixpanel'
import { handleException } from '@/lib/utils'
import { useGoogleAuth, useSendOtp, useVerifyOtp } from '@/queries/user'

type RegisterForm = {
  username: string
  email: string
}

const schema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscores (_)'
    ),
  email: z.string().email(),
})

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '' },
  })
  const [error, setError] = useState<string | undefined>()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const navigate = useNavigate()

  const sendOtp = useSendOtp()
  const verifyOtp = useVerifyOtp()
  const googleAuthMutation = useGoogleAuth()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const onSubmit = (data: RegisterForm) => {
    const trimmedEmail = data.email.trim().toLowerCase()
    const trimmedUsername = data.username.trim()
    setError(undefined)
    sendOtp.mutate(
      { email: trimmedEmail, username: trimmedUsername, is_registration: true },
      {
        onSuccess: () => {
          setEmail(trimmedEmail)
          setUsername(trimmedUsername)
          setStep('otp')
          setCooldown(30)
        },
        onError: error => {
          handleException(error, {
            onHttpError: ({ response }) => setError(response?.data.detail),
          })
        },
      }
    )
  }

  const handleResend = useCallback(() => {
    setError(undefined)
    sendOtp.mutate(
      { email, username, is_registration: true },
      {
        onSuccess: () => setCooldown(30),
        onError: error => {
          handleException(error, {
            onHttpError: ({ response }) => setError(response?.data.detail),
          })
        },
      }
    )
  }, [email, username, sendOtp])

  const handleVerify = useCallback(
    (code: string) => {
      setError(undefined)
      verifyOtp.mutate(
        { email, otp: code, is_registration: true, username },
        {
          onSuccess: ({ user }) => {
            Mixpanel.identify(`${user.id}`)
            Mixpanel.track('User:Register')
            Mixpanel.people.set({ $name: user.username, $email: user.email })
            navigate({ to: '/' })
          },
          onError: error => {
            handleException(error, {
              onHttpError: ({ response }) => setError(response?.data.detail),
            })
          },
        }
      )
    },
    [email, username, verifyOtp, navigate]
  )

  if (googleAuthMutation.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loading size="sm" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setStep('form')
            setOtp('')
            setError(undefined)
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1>Check your email</h1>
        <p className="text-sm mt-1 mb-6 text-muted-foreground">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
        {error && (
          <p className="text-destructive bg-destructive/20 text-xs rounded-md px-3 py-2 mb-3">
            {error}
          </p>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={value => {
              setOtp(value)
              if (value.length === 6) handleVerify(value)
            }}
            disabled={verifyOtp.isPending}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {verifyOtp.isPending && (
          <div className="flex justify-center mb-4">
            <Loading size="sm" />
          </div>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={sendOtp.isPending || cooldown > 0}
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Create an account</h1>
      <p className="text-sm mt-1 mb-4">
        Create packing lists and organize your gear
      </p>
      {error && (
        <p className="text-destructive bg-destructive/20 text-xs rounded-md px-3 py-2 mb-3">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label>Username</label>
        <Input
          {...register('username', { required: true })}
          placeholder="username"
        />
        {errors.username?.message && (
          <p className="text-red-400 text-xs">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-1 mt-3">
        <label>Email</label>
        <Input
          {...register('email', { required: true })}
          type="email"
          placeholder="john@muir.com"
        />
        {errors.email?.message && (
          <p className="text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={sendOtp.isPending}
      >
        {sendOtp.isPending ? 'Sending...' : 'Send code'}
      </Button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={credentialResponse => {
            if (!credentialResponse.credential) return
            setError(undefined)
            googleAuthMutation.mutate(credentialResponse.credential, {
              onSuccess: ({ user }) => {
                Mixpanel.identify(`${user.id}`)
                Mixpanel.track('User:Register:Google')
                Mixpanel.people.set({
                  $name: user.username,
                  $email: user.email,
                })
                navigate({ to: '/' })
              },
              onError: error => {
                handleException(error, {
                  onHttpError: ({ response }) =>
                    setError(response?.data.detail),
                })
              },
            })
          }}
          onError={() => setError('Google sign-in failed. Please try again.')}
        />
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  )
}
