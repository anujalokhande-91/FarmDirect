import { useEffect, useMemo, useState } from 'react'
import { listProducts } from '../api/products'
import { getApiErrorMessage } from '../api/api'
import { CategoryStrip, HomeCta, HomeHero, ProductShowcase, WhyFarmDirect } from '../components/home/HomeSections'
import { normalizeCategory } from '../utils/categories'

export default function Home() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { listProducts().then(setProducts).catch((requestError) => setError(getApiErrorMessage(requestError, 'Products could not be loaded.'))) }, [])
  const filteredProducts = useMemo(() => products.filter((product) => {
    const searchable = `${product.name} ${product.categoryLabel} ${product.unit}`.toLowerCase()
    return searchable.includes(query.toLowerCase()) && (!activeCategory || normalizeCategory(product.category) === normalizeCategory(activeCategory))
  }), [activeCategory, products, query])
  const handleSearch = (event) => { event.preventDefault(); document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' }) }
  return <>
    <HomeHero query={query} onQueryChange={setQuery} onSearch={handleSearch} />
    <CategoryStrip activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
    {error ? <p className="container-page py-8 text-sm font-bold text-clay">{error}</p> : <ProductShowcase products={filteredProducts} />}
    <WhyFarmDirect />
    <HomeCta />
  </>
}