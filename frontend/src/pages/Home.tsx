import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const stats = [
  { value: '500+', label: 'Local Farmers', icon: '👨‍🌾' },
  { value: '10K+', label: 'Happy Customers', icon: '😊' },
  { value: '50+', label: 'Product Categories', icon: '📦' },
  { value: '100%', label: 'Fresh Guarantee', icon: '✅' },
];

const features = [
  { icon: '🌿', title: 'Farm Fresh Quality', desc: 'Products harvested and delivered within 24 hours directly from farm to your doorstep.' },
  { icon: '💰', title: 'Best Prices', desc: 'No middlemen means better prices for customers and fair earnings for farmers.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Same day and next day delivery available across major cities in India.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Pay safely with COD, UPI, cards or net banking. 100% secure transactions.' },
  { icon: '♻️', title: 'Sustainable Farming', desc: 'We promote organic and eco-friendly farming practices for a better future.' },
  { icon: '📞', title: '24/7 Support', desc: 'Our customer support team is always ready to help you with any issues.' },
];

const categories = [
  { name: 'Vegetables', icon: '🥬', bg: '#F0FDF4', accent: '#16A34A' },
  { name: 'Fruits', icon: '🍎', bg: '#FFF1F2', accent: '#E11D48' },
  { name: 'Grains', icon: '🌾', bg: '#FFFBEB', accent: '#D97706' },
  { name: 'Dairy', icon: '🥛', bg: '#EFF6FF', accent: '#2563EB' },
  { name: 'Spices', icon: '🌶️', bg: '#FFF7ED', accent: '#EA580C' },
  { name: 'Flowers', icon: '🌸', bg: '#FDF4FF', accent: '#9333EA' },
  { name: 'Seeds', icon: '🌱', bg: '#F0FDF4', accent: '#15803D' },
];

const steps = [
  { num: '01', icon: '🔍', title: 'Browse', desc: 'Explore fresh products from local farms' },
  { num: '02', icon: '🛒', title: 'Select', desc: 'Add your favourite items to cart' },
  { num: '03', icon: '💳', title: 'Pay', desc: 'Secure payment via multiple options' },
  { num: '04', icon: '📦', title: 'Receive', desc: 'Fast delivery to your doorstep' },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'Pune', rating: 5, text: 'The vegetables are incredibly fresh. I can truly taste the difference from market produce. FarmDirect has changed how my family eats.' },
  { name: 'Rahul Patil', city: 'Mumbai', rating: 5, text: 'Amazing prices and super fast delivery. The Alphonso mangoes were the best I have ever tasted. Highly recommended!' },
  { name: 'Anjali Desai', city: 'Nashik', rating: 5, text: 'Love supporting local farmers through this platform. Quality is outstanding and the customer service is excellent.' },
];

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#111827' }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #052e16 0%, #14532d 50%, #166534 100%)',
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 32px', width: '100%', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '80px', alignItems: 'center' }}>

            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(134,239,172,0.15)', border: '1px solid rgba(134,239,172,0.3)',
                borderRadius: '6px', padding: '6px 16px', marginBottom: '32px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: '13px', color: '#86efac', fontWeight: 500, letterSpacing: '0.5px' }}>
                  INDIA'S TRUSTED FARM-TO-TABLE PLATFORM
                </span>
              </div>

              <h1 style={{
                fontSize: '58px', fontWeight: 800, color: '#fff',
                lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-2px'
              }}>
                Fresh Produce.<br />
                <span style={{
                  background: 'linear-gradient(90deg, #4ade80, #86efac)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>Fair Prices.</span><br />
                Direct Farmers.
              </h1>

              <p style={{
                fontSize: '18px', color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8, marginBottom: '44px', maxWidth: '520px'
              }}>
                Eliminate middlemen. Connect directly with verified local farmers
                and receive the freshest farm produce at prices that are fair for everyone.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/products" style={{
                  background: '#16a34a', color: '#fff',
                  padding: '15px 36px', borderRadius: '8px',
                  fontWeight: 600, fontSize: '16px', textDecoration: 'none',
                  border: '2px solid #16a34a',
                  boxShadow: '0 4px 24px rgba(22,163,74,0.4)'
                }}>
                  Shop Now →
                </Link>
                <Link to="/register" style={{
                  background: 'transparent', color: '#fff',
                  padding: '15px 36px', borderRadius: '8px',
                  fontWeight: 600, fontSize: '16px', textDecoration: 'none',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  Sell Your Products
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap' }}>
                {['✓ Verified Farmers', '✓ Quality Checked', '✓ Secure Payments'].map(b => (
                  <span key={b} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{b}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px', padding: '32px 24px',
                  transform: i % 2 === 1 ? 'translateY(24px)' : 'none'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: '96px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', letterSpacing: '2px', marginBottom: '10px' }}>PRODUCT CATEGORIES</p>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>Shop by Category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name.toLowerCase()}`}
                style={{
                  background: cat.bg, borderRadius: '12px', padding: '24px 12px',
                  textAlign: 'center', textDecoration: 'none',
                  border: `1px solid transparent`, transition: 'all 0.25s'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = cat.accent;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${cat.accent}22`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{cat.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: cat.accent }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: '96px 32px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 0.6fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', letterSpacing: '2px', marginBottom: '12px' }}>WHY FARMDIRECT</p>
              <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#111827', letterSpacing: '-1px', marginBottom: '20px' }}>
                The Smarter Way to Buy Fresh
              </h2>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.8, marginBottom: '32px' }}>
                We built FarmDirect to solve a simple problem — great farmers can't reach great customers. We fix that.
              </p>
              <Link to="/products" style={{
                background: '#111827', color: '#fff',
                padding: '14px 32px', borderRadius: '8px',
                fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'inline-block'
              }}>
                Explore Products →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #E5E7EB',
                  borderRadius: '12px', padding: '28px', transition: 'all 0.25s'
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#16a34a';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(22,163,74,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '96px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', letterSpacing: '2px', marginBottom: '10px' }}>PROCESS</p>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 24px', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '32px', right: '0',
                    width: '50%', height: '1px', background: '#D1FAE5'
                  }} />
                )}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#F0FDF4', border: '2px solid #D1FAE5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '26px', position: 'relative', zIndex: 1
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', letterSpacing: '2px', marginBottom: '8px' }}>STEP {s.num}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '96px 32px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', letterSpacing: '2px', marginBottom: '10px' }}>TESTIMONIALS</p>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>What Our Customers Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} onClick={() => setActiveTestimonial(i)} style={{
                background: '#fff',
                border: `2px solid ${i === activeTestimonial ? '#16a34a' : '#E5E7EB'}`,
                borderRadius: '16px', padding: '32px', cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: i === activeTestimonial ? '0 8px 32px rgba(22,163,74,0.12)' : 'none'
              }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
                  {Array(t.rating).fill(0).map((_, j) => (
                    <span key={j} style={{ color: '#FBBF24', fontSize: '16px' }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.8, marginBottom: '24px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: '#D1FAE5', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, color: '#16a34a', fontSize: '16px'
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: 'linear-gradient(160deg, #052e16 0%, #14532d 60%, #166534 100%)',
        padding: '96px 32px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', letterSpacing: '2px', marginBottom: '20px' }}>FOR FARMERS</p>
          <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: '20px', lineHeight: 1.1 }}>
            Start Selling Your Farm Products Today
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '48px' }}>
            Join thousands of farmers already using FarmDirect to reach customers directly and earn more from every harvest.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#16a34a', color: '#fff', padding: '15px 40px', borderRadius: '8px',
              fontWeight: 600, fontSize: '16px', textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(22,163,74,0.4)'
            }}>
              Register as Farmer →
            </Link>
            <Link to="/products" style={{
              background: 'transparent', color: '#fff', padding: '15px 40px', borderRadius: '8px',
              fontWeight: 600, fontSize: '16px', textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{
        background: '#030712', padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>🌿 FarmDirect</span>
        <span style={{ fontSize: '13px', color: '#4B5563' }}>© 2026 FarmDirect. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <Link key={l} to="/" style={{ fontSize: '13px', color: '#4B5563', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
