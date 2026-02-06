'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { useGetProductsQuery } from '@/store/api/productsApi'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce the search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 300) // 300ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery])

  // Fetch products when debounced query changes
  const { data, isLoading } = useGetProductsQuery(
    {
      search: debouncedQuery || undefined,
      limit: 5, // Limit to 5 results for dropdown
      isActive: true,
    },
    {
      skip: !debouncedQuery || debouncedQuery.length < 2, // Skip if query is too short
    }
  )

  const products = data?.data || []
  const hasResults = products.length > 0
  const showResults = isOpen && debouncedQuery.length >= 2

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsOpen(true)
    setFocusedIndex(-1)
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      inputRef.current?.blur()
    }
  }

  // Handle product click
  const handleProductClick = (product: Product) => {
    setIsOpen(false)
    setSearchQuery('')
    router.push(`/product/${product.slug}`)
  }

  // Handle clear search
  const handleClear = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || products.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        handleSubmit(e)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev < products.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < products.length) {
          handleProductClick(products[focusedIndex])
        } else if (searchQuery.trim()) {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && resultsRef.current) {
      const focusedElement = resultsRef.current.children[focusedIndex] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [focusedIndex])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-search-results]')) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search ghee products..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          data-search-results
          className="absolute top-full left-0 right-0 mt-2 z-[100] bg-popover border border-border rounded-md shadow-lg max-h-[60vh] md:max-h-[400px] overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : hasResults ? (
            <div ref={resultsRef} className="overflow-y-auto max-h-[60vh] md:max-h-[400px]">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left',
                    focusedIndex === index && 'bg-accent'
                  )}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(product.price)}</p>
                  </div>
                </button>
              ))}
              {data && data.meta.total > products.length && (
                <div className="border-t border-border p-3">
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`)
                    }}
                    className="w-full text-sm font-medium text-accent hover:underline text-center"
                  >
                    View all {data.meta.total} results
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No products found for &quot;{debouncedQuery}&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

