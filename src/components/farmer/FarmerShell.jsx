import { BarChart3, Boxes, ClipboardList, Leaf, LogOut, Menu, PlusCircle, UserRound, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFarmerAuth } from '../../app/FarmerAuthContext'

const navigation = [
  { label: 'Dashboard', to: '/farmer/dashboard', icon: BarChart3 },
  { label: 'Products', to: '/farmer/products', icon: Boxes },
  { label: 'Add Product', to: '/farmer/products/add', icon: PlusCircle },
  { label: 'Orders', to: '/farmer/orders', icon: ClipboardList },
  { label: 'Profile', to: '/farmer/profile', icon: UserRound },
]

export function FarmerShell({ children }) {
  const [open, setOpen] = useState(false)
  const { currentFarmer, farmerLogout } = useFarmerAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    farmerLogout()
    setOpen(false)
    navigate('/farmer/login')
  }

  const navClass = ({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
    isActive ? 'bg-white/14 text-white shadow-sm' : 'text-oat/70 hover:bg-white/8 hover:text-white'
  }`

  const menu = (
    <nav className="flex flex-col gap-2">
      {navigation.map(({ label, to, icon: Icon }) => (
        <NavLink key={label} to={to} className={navClass} onClick={() => setOpen(false)}>
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      <NavLink to="/" className={navClass} onClick={() => setOpen(false)}>
        <Leaf size={18} />
        Customer Marketplace
      </NavLink>
      <button
        className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-oat/70 transition hover:bg-white/8 hover:text-white"
        type="button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#f4f7f1] text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-leaf px-6 py-6 text-white lg:flex">
        <Link to="/farmer/dashboard" className="flex items-center gap-3 text-oat">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-oat text-leaf">
            <Leaf size={21} />
          </span>
          <span className="text-lg font-extrabold tracking-[-0.04em]">
            farm<span className="text-herb">direct</span>
          </span>
        </Link>
        <div className="mt-12 flex-1">{menu}</div>
        <div className="rounded-2xl bg-black/10 p-4">
          <p className="text-sm font-bold text-white">{currentFarmer?.name || 'Farmer'}</p>
          <p className="mt-1 truncate text-sm text-oat/65">{currentFarmer?.farmName || 'FarmDirect farmer workspace'}</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-herb">Farmer workspace</p>
              <p className="mt-1 text-sm font-bold text-ink">{currentFarmer?.farmName || 'FarmDirect'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-bold text-ink/60 sm:inline">{currentFarmer?.name}</span>
              <button
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-leaf lg:hidden"
                type="button"
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Close farmer navigation' : 'Open farmer navigation'}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button
                className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink/55 transition hover:border-clay hover:text-clay lg:flex"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {open && <div className="border-b border-line bg-leaf px-4 py-5 text-white lg:hidden">{menu}</div>}

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
