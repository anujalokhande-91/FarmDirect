import { ArrowLeft, Edit3, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFarmerAuth } from '../app/FarmerAuthContext'

function ProfileField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input
        className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-oat px-4 font-normal outline-none transition focus:border-leaf"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}

function ProfileTextarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm font-bold text-ink md:col-span-2">
      {label}
      <textarea
        className="mt-2 min-h-32 w-full rounded-2xl border border-line bg-oat px-4 py-3 font-normal outline-none transition focus:border-leaf"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}

export default function FarmerProfile() {
  const { currentFarmer, updateFarmer } = useFarmerAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(currentFarmer)

  useEffect(() => {
    setForm(currentFarmer)
  }, [currentFarmer])

  if (!currentFarmer) return null

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const save = (event) => {
    event.preventDefault()
    updateFarmer({ ...form, location: form.farmLocation || form.location })
    setEditing(false)
  }

  const details = [
    ['Farmer Name', currentFarmer.name],
    ['Email', currentFarmer.email],
    ['Phone', currentFarmer.phone],
    ['Farm Name', currentFarmer.farmName],
    ['Location', currentFarmer.farmLocation || currentFarmer.location],
    ['Farm Description', currentFarmer.farmDescription],
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/farmer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-leaf">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Farm profile</p>
          <h1 className="serif mt-3 text-4xl leading-none md:text-6xl">Your profile</h1>
          <p className="mt-4 max-w-2xl text-ink/60">
            Keep your farm details up to date so customers and your team can trust what they see.
          </p>
        </div>
        {!editing && (
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-leaf px-4 text-sm font-bold text-leaf hover:bg-leaf hover:text-white" type="button" onClick={() => setEditing(true)}>
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8" onSubmit={save}>
          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField label="Farmer Name" value={form.name || ''} onChange={update('name')} />
            <ProfileField label="Email" type="email" value={form.email || ''} onChange={update('email')} />
            <ProfileField label="Phone" value={form.phone || ''} onChange={update('phone')} />
            <ProfileField label="Farm Name" value={form.farmName || ''} onChange={update('farmName')} />
            <ProfileField label="Location" value={form.farmLocation || form.location || ''} onChange={update('farmLocation')} />
            <ProfileField label="Farming Type" value={form.farmingType || ''} onChange={update('farmingType')} />
            <ProfileField label="Main Products" value={form.mainProducts || ''} onChange={update('mainProducts')} />
            <ProfileTextarea label="Farm Description" value={form.farmDescription || ''} onChange={update('farmDescription')} placeholder="Tell customers about your farm." />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
            <button className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-ink/55 hover:text-leaf" type="button" onClick={() => { setForm(currentFarmer); setEditing(false) }}>
              Cancel
            </button>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-leaf px-5 text-sm font-bold text-white hover:bg-ink" type="submit">
              <Save size={16} />
              Save Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{label}</p>
              <p className="mt-3 font-bold text-ink">{value || '—'}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-[#e8eee3] p-6 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">FarmDirect tip</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">
              Keep your farm description, contact details, and location current to help customers trust your listings and contact you easily.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
