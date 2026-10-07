import { ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField, AuthLayout } from '../components/auth/AuthLayout'
import { useAuth } from '../app/AuthContext'

const accountTypes = [
  { value: 'customer', label: 'Customer', description: 'Shop local products and manage your orders.' },
  { value: 'farmer', label: 'Farmer', description: 'List products and manage your farm orders.' },
]

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const update = (field) => (event) => setForm((current) => ({
    ...current,
    [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
  }))

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!['customer', 'farmer'].includes(form.role)) nextErrors.role = 'Choose an account type.'
    if (!form.name.trim()) nextErrors.name = 'Full name is required.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.'
    else if (!/^[+\d][\d\s().-]{7,}$/.test(form.phone)) nextErrors.phone = 'Enter a valid phone number.'
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords must match.'
    if (!form.terms) nextErrors.terms = 'Please accept the terms to continue.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      })
      await login(form.email.trim(), form.password, form.role)
      navigate(form.role === 'farmer' ? '/farmer/dashboard' : '/')
    } catch (error) {
      setErrors({ form: error.message })
    }
  }

  return (
    <AuthLayout eyebrow="Join FarmDirect" title="Create Account" description="Save your favorite farmers, keep your cart close, and make every shop local.">
      <form className="space-y-5" onSubmit={submit} noValidate>
        <fieldset>
          <legend className="text-sm font-bold text-ink">Account Type</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {accountTypes.map((accountType) => (
              <label
                key={accountType.value}
                className={`cursor-pointer rounded-2xl border p-4 transition ${form.role === accountType.value ? 'border-leaf bg-[#e8eee3]' : 'border-line bg-oat hover:border-leaf'}`}
              >
                <span className="flex items-start gap-3">
                  <input className="mt-1 accent-leaf" type="radio" name="role" value={accountType.value} checked={form.role === accountType.value} onChange={update('role')} />
                  <span>
                    <span className="block text-sm font-bold text-ink">{accountType.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-ink/55">{accountType.description}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.role && <p className="mt-2 text-xs font-medium text-clay">{errors.role}</p>}
        </fieldset>

        <AuthField label="Full Name" type="text" autoComplete="name" placeholder="Your full name" value={form.name} error={errors.name} onChange={update('name')} />
        <AuthField label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} error={errors.email} onChange={update('email')} />
        <AuthField label="Phone Number" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" value={form.phone} error={errors.phone} onChange={update('phone')} />
        <label className="block text-sm font-bold text-ink">
          Password
          <div className={`mt-2 flex min-h-12 items-center border bg-oat focus-within:border-leaf ${errors.password ? 'border-clay' : 'border-line'}`}>
            <input className="min-w-0 flex-1 bg-transparent px-4 font-normal outline-none" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update('password')} />
            <button className="grid h-11 w-11 place-items-center text-ink/45 hover:text-leaf" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="mt-2 block text-xs font-medium text-clay">{errors.password}</span>}
        </label>
        <AuthField label="Confirm Password" type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirmPassword} error={errors.confirmPassword} onChange={update('confirmPassword')} />
        <label className="flex items-start gap-3 text-sm font-medium text-ink/65">
          <input className="mt-1" type="checkbox" checked={form.terms} onChange={update('terms')} />
          <span>I accept the FarmDirect terms and community guidelines.</span>
        </label>
        {errors.terms && <p className="text-xs font-medium text-clay">{errors.terms}</p>}
        {errors.form && <p className="bg-[#f8e8df] px-4 py-3 text-sm text-clay">{errors.form}</p>}
        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-leaf text-sm font-bold text-white transition hover:bg-ink" type="submit">
          <UserPlus size={17} /> Create Account
        </button>
        <p className="text-center text-sm text-ink/60">Already have an account? <Link className="font-bold text-leaf hover:text-clay" to="/login">Login</Link></p>
        <Link className="flex items-center justify-center gap-2 text-xs font-bold text-ink/45 hover:text-leaf" to="/">
          <ArrowRight size={14} /> Continue browsing
        </Link>
      </form>
    </AuthLayout>
  )
}
