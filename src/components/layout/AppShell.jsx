import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, LogIn, Menu, ShoppingBasket, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../../app/CartContext'
import { useAuth } from '../../app/AuthContext'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', href: '#categories' },
  { label: 'About', href: '#about' },
]

export function AppShell({ children }) {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { currentUser, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const navClass = ({ isActive }) => `transition-colors ${isActive ? 'font-bold text-leaf' : 'text-ink/65 hover:text-leaf'}`
  const closeMenu = () => setOpen(false)
  const handleLogout = () => { logout(); closeMenu(); navigate('/') }
  const isFarmer = currentUser?.role === 'farmer'
  const accountPath = isFarmer ? '/farmer/dashboard' : '/account'

  return <div className="min-h-screen bg-oat">
    <header className="sticky top-0 z-30 border-b border-line bg-oat/95 backdrop-blur">
      <div className="container-page flex h-[76px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="FarmDirect home"><span className="grid h-10 w-10 place-items-center rounded-full bg-leaf text-oat"><Leaf size={20} /></span><span className="text-lg font-extrabold tracking-[-0.04em]">farm<span className="text-herb">direct</span></span></Link>
        <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Main navigation">{links.map((link) => link.to ? <NavLink className={navClass} to={link.to} key={link.label}>{link.label}</NavLink> : <a className="text-ink/65 transition-colors hover:text-leaf" href={link.href} key={link.label}>{link.label}</a>)}</nav>
        <div className="flex items-center gap-1"><div className="hidden items-center lg:flex">{isAuthenticated ? <><Link to={accountPath} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-leaf hover:text-clay"><UserRound size={16} /> {currentUser.name.split(' ')[0]}</Link><button className="px-3 py-2 text-sm font-bold text-ink/55 hover:text-clay" type="button" onClick={handleLogout}>Logout</button></> : <><Link to="/login" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-leaf hover:text-clay"><LogIn size={16} /> Login</Link><Link to="/register" className="px-3 py-2 text-sm font-bold text-ink/55 hover:text-leaf">Register</Link></>}</div>{(!isAuthenticated || !isFarmer) && <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-white" aria-label={`Shopping cart, ${count} items`}><ShoppingBasket size={20} strokeWidth={1.8} />{count > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">{count}</span>}</Link>}<button className="grid h-11 w-11 place-items-center rounded-full hover:bg-white md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      {open && <nav className="container-page flex flex-col gap-5 border-t border-line py-6 text-base md:hidden" aria-label="Mobile navigation">{links.map((link) => link.to ? <NavLink onClick={closeMenu} className={navClass} to={link.to} key={link.label}>{link.label}</NavLink> : <a onClick={closeMenu} className="text-ink/65" href={link.href} key={link.label}>{link.label}</a>)}{isAuthenticated ? <><Link onClick={closeMenu} className="inline-flex items-center gap-2 font-bold text-leaf" to={accountPath}><UserRound size={16} /> {currentUser.name}</Link><button className="w-fit text-left font-bold text-ink/55" type="button" onClick={handleLogout}>Logout</button></> : <><Link onClick={closeMenu} className="inline-flex items-center gap-2 font-bold text-leaf" to="/login"><LogIn size={16} /> Login</Link><Link onClick={closeMenu} className="font-bold text-ink/55" to="/register">Register</Link></>}</nav>}
    </header>
    <main>{children}</main>
    <footer className="mt-20 bg-leaf py-12 text-oat"><div className="container-page grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]"><div><Link to="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-oat text-leaf"><Leaf size={18} /></span><span className="font-extrabold tracking-[-0.04em]">farmdirect</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-oat/65">Fresh, local food from the people who grow it, delivered with care.</p></div><div className="text-sm text-oat/70"><p className="mb-3 font-bold text-oat">Explore</p><Link className="block py-1 hover:text-white" to="/">Home</Link><Link className="block py-1 hover:text-white" to="/products">Products</Link><a className="block py-1 hover:text-white" href="#categories">Categories</a></div><div className="text-sm text-oat/70"><p className="mb-3 font-bold text-oat">Customer links</p>{!isFarmer && <Link className="block py-1 hover:text-white" to="/cart">Shopping cart</Link>}{isAuthenticated ? <Link className="block py-1 hover:text-white" to={accountPath}>My account</Link> : <Link className="block py-1 hover:text-white" to="/login">Login</Link>}<p className="py-1">Delivery information</p></div><div className="text-sm text-oat/70"><p className="mb-3 font-bold text-oat">For farmers</p><p className="py-1">Sell with FarmDirect</p><p className="py-1">Partner support</p><p className="py-1">hello@farmdirect.co</p></div></div><div className="container-page mt-10 border-t border-oat/15 pt-5 text-xs text-oat/45">© 2026 FarmDirect. Good food, close to home.</div></footer>
  </div>
}
