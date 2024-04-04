import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"

interface SaImageWithFallbackProps extends ImageProps {
  fallback: ImageProps['src']
}

const SaImageWithFallback = ({
  fallback,
  alt,
  src,
  ...props
}: SaImageWithFallbackProps) => {
  const [error, setError] = useState<React.SyntheticEvent<
    HTMLImageElement,
    Event
  > | null>(null)

  useEffect(() => {
    setError(null)
  }, [src])

  return (
    <Image
      alt={alt}
      onError={setError}
      src={error ? fallback : src}
      {...props}
    />
  )
}

export default SaImageWithFallback