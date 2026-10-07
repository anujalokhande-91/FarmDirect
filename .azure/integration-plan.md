# FarmDirect Integration Handoff

## Scope
- Frontend-only React/Vite JavaScript application.
- No backend, database, migrations, authentication, payments, AI, or external API integration.
- Data remains in `src/data/mockData.js`; cart state remains session-local in `src/app/CartContext.jsx`.

## Frontend
- Project folder: workspace root (`d:/Aptitude/Project/FarmDirect`)
- Install: `npm install`
- Build: `npm run build`
- Dev: `npm run dev`
- API seam: none by design; route pages read local mock data directly.
- Mock data: `src/data/mockData.js`
- Mock state: `src/app/CartContext.jsx`

## Routes
- `GET /` - marketplace home, seasonal feature, categories, featured goods, producer story
- `GET /shop` - searchable, filterable, sortable product listing
- `GET /product/:productId` - product detail, farm provenance, quantity, add-to-cart
- `GET /cart` - local cart line items, quantity controls, removal, summary, disabled checkout

## Database
- None required. Do not create schema migrations or seed data.

## Services
- Frontend: Essential. React/Vite app with Tailwind CSS, React Router, and lucide-react.
- Backend: Not requested and must not be added.