import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CreateableOption, Option } from '@/types/lib'

import { Button } from './Button'
import { Loading } from './Loading'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from './Popover'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './Command'

type Props = {
  options: Option[]
  onRemove: () => void
  label: string
  tabIndex?: number
  value?: number
  disabled?: boolean
  onSelect: (value: CreateableOption) => void
  onSearch?: (value: string) => void
  isLoading?: boolean
  placeholder?: string
  creatable?: boolean
}

export const Combobox: FC<Props> = ({
  value,
  options,
  label,
  disabled,
  isLoading,
  placeholder,
  creatable,
  tabIndex,
  onSelect,
  onSearch,
  onRemove,
}) => {
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [createdLabel, setCreatedLabel] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = useMemo(
    () => (value != null ? options.find(o => o.value === value) ?? null : null),
    [value, options]
  )

  useEffect(() => {
    if (!onSearch || value != null) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(searchText), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchText, onSearch, value])

  const displayValue = selectedOption?.label ?? createdLabel ?? searchText

  const filteredOptions = useMemo(() => {
    if (onSearch || !searchText || selectedOption) return options
    const lower = searchText.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(lower))
  }, [options, searchText, onSearch, selectedOption])

  const canCreate = useMemo(() => {
    if (isLoading || !searchText) return false
    const exactMatch = options.some(
      o => o.label.toLowerCase() === searchText.toLowerCase()
    )
    return !exactMatch && (options.length === 0 || !!creatable)
  }, [isLoading, searchText, options, creatable])

  const handleCreate = useCallback(() => {
    onSelect({ label: searchText, isNew: true })
    setCreatedLabel(searchText)
    setSearchText('')
    setOpen(false)
  }, [searchText, onSelect])

  const handleSelect = useCallback(
    (optionValue: string) => {
      const option = options.find(o => String(o.value) === optionValue)
      if (option) {
        onSelect({ label: option.label, value: option.value })
        setSearchText('')
        setOpen(false)
      }
    },
    [options, onSelect]
  )

  const handleClear = useCallback(() => {
    onRemove()
    setSearchText('')
    setCreatedLabel(null)
    inputRef.current?.focus()
  }, [onRemove])

  return (
    <Popover open={open} onOpenChange={v => {
        setOpen(v)
        if (!v) setSearchText('')
      }}>
      <CommandPrimitive
        shouldFilter={false}
        className="overflow-visible bg-transparent"
      >
        <PopoverAnchor asChild>
          <div className="relative">
            <CommandPrimitive.Input
              ref={inputRef}
              value={displayValue}
              onValueChange={val => {
                if (selectedOption || createdLabel) {
                  onRemove()
                  setCreatedLabel(null)
                }
                setSearchText(val)
                if (!open) setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder || 'Search...'}
              disabled={disabled}
              tabIndex={tabIndex}
              className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                (selectedOption || createdLabel) && 'pr-8'
              )}
            />
            {(selectedOption || createdLabel) && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
          onMouseDown={e => e.preventDefault()}
          onOpenAutoFocus={e => e.preventDefault()}
          onInteractOutside={e => {
            if (
              e.target instanceof Node &&
              inputRef.current?.contains(e.target)
            ) {
              e.preventDefault()
            }
          }}
        >
          <CommandList
            onWheel={e => e.stopPropagation()}
          >
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.value}
                    value={String(option.value)}
                    keywords={[option.label]}
                    onSelect={handleSelect}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!isLoading && filteredOptions.length === 0 && !canCreate && (
              <CommandEmpty>
                {onSearch && !searchText ? (
                  <span className="text-xs">
                    Begin typing to search or create {label}...
                  </span>
                ) : (
                  <span className="text-xs">No results found.</span>
                )}
              </CommandEmpty>
            )}
          </CommandList>
          {isLoading && (
            <div className="flex justify-center p-2">
              <Loading size="sm" />
            </div>
          )}
          {canCreate && (
            <div className="border-t border-border p-1">
              <Button onClick={handleCreate} size="sm" className="w-full">
                Create &quot;{searchText}&quot;
              </Button>
            </div>
          )}
        </PopoverContent>
      </CommandPrimitive>
    </Popover>
  )
}
