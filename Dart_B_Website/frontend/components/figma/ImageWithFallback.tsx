import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props

  if (!src || src.trim() === '') {
    return (
      <div
        className={`inline-block bg-gray-200 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
          No Image
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={style}>
      {isLoading && !didError && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${className ?? ''}`}
        />
      )}
      {didError ? (
        <div
          className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        >
          <div className="flex items-center justify-center w-full h-full">
            <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
          </div>
        </div>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className={`${className ?? ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          style={style}
          {...rest} 
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  )
}
