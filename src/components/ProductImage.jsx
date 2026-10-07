import { useEffect, useState } from 'react'

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85'

export default function ProductImage({ src, alt = '', className = '' }) {
  const [imageSrc, setImageSrc] = useState(src || DEFAULT_PRODUCT_IMAGE)

  useEffect(() => {
    setImageSrc(src || DEFAULT_PRODUCT_IMAGE)
  }, [src])

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc(DEFAULT_PRODUCT_IMAGE)}
    />
  )
}
