# FarmDirect Project Plan

**Status**: Approved
**Created**: 2026-10-04
**Mode**: Frontend-only React/Vite application

## 1. Project Overview

FarmDirect is a polished, responsive agricultural marketplace interface for discovering locally sourced produce and farm goods. The first release is a frontend-only experience powered by local mock data, with no backend, authentication, payments, AI, or external API integrations.

**Primary users**: Customers browsing and purchasing farm products.
**Primary outcome**: Make product discovery, comparison, and cart review feel trustworthy, premium, and effortless across desktop and mobile.

## 2. Goals & Non-Goals

**Goals**:
- Create a complete marketplace browsing experience with clear product discovery and category navigation.
- Provide separate routes for the home marketplace, product listing, product detail, and cart views.
- Build reusable React components for navigation, product cards, filters, quantity controls, badges, and layout sections.
- Use responsive behavior and accessible interaction patterns from the first implementation.
- Establish a clean green and natural visual identity with premium editorial restraint.

**Non-goals**:
- No server, database, authentication, checkout processing, payments, inventory synchronization, AI, or external API calls.
- No real user accounts, order submission, or production commerce guarantees.

## 3. User Experience & Routes

**Core flow**: Browse the marketplace, filter or search products, inspect a product, add it to the cart, adjust quantities, and review the cart summary.

**Routes**:
- `/` — marketplace home with seasonal feature, categories, featured products, and producer story content.
- `/shop` — product listing with search, category filters, sort control, and responsive product grid.
- `/product/:productId` — product detail with imagery, farm provenance, pricing, quantity stepper, and add-to-cart action.
- `/cart` — cart line items, quantity controls, subtotal, delivery note, and a disabled/mock checkout action.

**Responsive behavior**:
- Desktop uses a persistent top navigation and multi-column product grids.
- Mobile collapses navigation into a compact menu, keeps cart access visible, and stacks filters and product details without horizontal overflow.
- Touch targets remain comfortably sized, and long product names or labels wrap without shifting fixed controls.

## 4. Technical Architecture

**Application type**: Single frontend service.
**Runtime**: React with Vite and JavaScript.
**Routing**: React Router with route-level page components and a shared application shell.
**Styling**: Tailwind CSS utility classes with a small central theme extension for brand colors, typography, shadows, and breakpoints.
**Icons**: lucide-react icons inside controls and navigation actions.
**State**: Local React state and context where useful for the mock cart; no persistence beyond the current browser session.
**Data**: Static JavaScript mock data modules for products, categories, farms, and featured content.

Suggested structure:
- `src/app/` for router, providers, and application shell.
- `src/pages/` for route-level screens.
- `src/components/` for reusable marketplace and layout primitives.
- `src/data/` for mock products, farms, and categories.
- `src/lib/` for small formatting and cart helpers.

## 5. Data & Component Model

**Mock entities**:
- `Product`: id, name, category, farmId, price, unit, image, shortDescription, description, badges, stockLabel.
- `Farm`: id, name, location, story, avatar/image, certifications.
- `Category`: id, label, image, productCount.
- `CartItem`: productId, quantity.

**Reusable components**:
- `AppShell`, `Header`, `MobileNav`, `Footer`.
- `HeroSection`, `SectionHeading`, `CategoryTile`, `FarmStoryBlock`.
- `ProductCard`, `ProductGrid`, `ProductFilters`, `SearchField`, `SortMenu`.
- `PriceDisplay`, `QuantityStepper`, `Badge`, `CartLineItem`, `CartSummary`.

Components should accept data through props, keep route concerns in pages, and avoid duplicating product-card or quantity-control markup.

## 6. Design System & UI

**Component Library**: Tailwind CSS utility primitives with custom reusable React components; lucide-react for icons.
**Visual direction**: Premium farm-to-table marketplace with fresh greens, warm off-white surfaces, muted soil accents, and restrained dark ink text.
**Typography**: Use a distinctive serif display face for editorial headings paired with a highly legible sans-serif for controls and body copy. Load fonts through the app’s standard Vite asset strategy without relying on a default system-only presentation.
**Color tokens**: Deep leaf green for primary actions, fresh herb green for accents, warm oat for surfaces, clay/soil for supporting accents, and charcoal ink for text. Keep contrast accessible and avoid a single-hue interface.
**Shape and spacing**: Mostly crisp panels and image frames with modest radius, generous whitespace, stable card dimensions, and consistent spacing tokens. Avoid nested cards and decorative floating blobs.
**Interaction**: Use visible focus states, hover feedback on cards and buttons, clear disabled styling for mock checkout, tooltips for unfamiliar icon-only controls, and meaningful page-load/staggered reveals kept subtle.
**Imagery**: Use purposeful farm, produce, and producer imagery in mock data or local assets so products and provenance are immediately recognizable rather than relying on abstract decoration.

## 7. Implementation Sequence

1. Initialize the Vite React JavaScript app and install Tailwind CSS, React Router, and lucide-react.
2. Configure global styles, Tailwind theme tokens, typography, responsive container utilities, and base accessibility styles.
3. Add mock data and cart state/context with deterministic product lookup and quantity updates.
4. Build the shared shell, navigation, footer, buttons, badges, and form/control primitives.
5. Implement home and shop routes, including responsive product discovery, filtering, search, and sorting.
6. Implement product detail and cart routes with working local interactions and empty/cart states.
7. Add responsive polish, loading/error-safe empty states, keyboard focus treatment, and subtle reveal motion.
8. Run the production build and manually verify all routes at desktop and mobile widths.

## 8. Validation & Acceptance Criteria

- `npm run build` completes successfully.
- All four routes render directly and through in-app navigation without console errors.
- Search, category filtering, sorting, add-to-cart, quantity changes, remove, and empty-cart behavior work with mock data.
- Layout remains usable at mobile, tablet, and desktop widths with no horizontal overflow or overlapping text.
- Interactive elements have accessible names, keyboard focus visibility, and appropriate disabled states.
- No backend calls, authentication flows, payment integrations, AI services, or external API dependencies are introduced.
- The UI consistently follows the FarmDirect green/natural premium visual language and uses lucide-react icons for iconography.
