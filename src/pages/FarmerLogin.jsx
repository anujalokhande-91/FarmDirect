import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useFarmerAuth } from '../app/FarmerAuthContext'
import { FarmerAuthLayout, FarmerField } from '../components/farmer/FarmerAuthLayout'

export default function FarmerLogin() {
  const { farmerLogin } = useFarmerAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)
    farmerLogin(form.email, form.password)
      .then(() => navigate('/farmer/dashboard'))
      .catch((error) => setErrors({ form: error.message }))
  }
  return <FarmerAuthLayout eyebrow="Farmer workspace" title="Welcome Back, Farmer" description="Manage your harvest, orders, and farm profile from one simple workspace."><form className="space-y-5" onSubmit={submit} noValidate>{location.state?.registered && <p className="bg-[#e8eee3] px-4 py-3 text-sm text-leaf">Farmer account created. You can now log in.</p>}<FarmerField label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} error={errors.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><label className="block text-sm font-bold text-ink">Password<div className={`mt-2 flex min-h-12 items-center border bg-oat focus-within:border-leaf ${errors.password ? 'border-clay' : 'border-line'}`}><input className="min-w-0 flex-1 bg-transparent px-4 font-normal outline-none" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button className="grid h-11 w-11 place-items-center text-ink/45 hover:text-leaf" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <span className="mt-2 block text-xs font-medium text-clay">{errors.password}</span>}</label>{errors.form && <p className="bg-[#f8e8df] px-4 py-3 text-sm text-clay">{errors.form}</p>}<div className="flex items-center justify-between gap-3 text-sm"><label className="flex items-center gap-2 font-medium text-ink/65"><input type="checkbox" checked={form.remember} onChange={(event) => setForm({ ...form, remember: event.target.checked })} /> Remember me</label><button className="font-bold text-leaf hover:text-clay" type="button">Forgot Password?</button></div><button className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-leaf text-sm font-bold text-white transition hover:bg-ink" type="submit"><LogIn size={17} /> Farmer Login</button><p className="text-center text-sm text-ink/60">New to FarmDirect? <Link className="font-bold text-leaf hover:text-clay" to="/farmer/register">Register your farm</Link></p><Link className="flex items-center justify-center gap-2 text-xs font-bold text-ink/45 hover:text-leaf" to="/login"><ArrowLeft size={14} /> Customer login</Link></form></FarmerAuthLayout>
}