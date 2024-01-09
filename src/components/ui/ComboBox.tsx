import { FC, useEffect, useMemo, useState } from 'react'
import { XIcon } from 'lucide-react'

import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import { CreateableOption, Option } from '@/types/lib'

import { Button } from './Button'
import { Input } from './Input'
import { Loading } from './Loading'
import { Popover, PopoverAnchor, PopoverContent } from './Popover'
import { ScrollArea } from './ScrollArea'

type Props = {
  options: Option[]
  onRemove: () => void
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
  disabled,
  isLoading,
  placeholder,
  creatable,
  onSelect,
  onSearch,
  onRemove,
}) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (onSearch && !value) {
      // filter in parent component
      onSearch(search)
    }
  }, [onSearch, search, value])

  useEffect(() => {
    // if value is set, find the option and set the search
    if (value) {
      const option = options.find(option => option.value === value)
      if (option) {
        setSearch(option.label)
        setSelected(true)
      }
      return
    }

    if (!onSearch) {
      setSearch('')
      setSelected(false)
    }
  }, [value, options, onSearch])

  const filteredResults = useFuzzySearch(options, search)

  const onSelectItem = (value: Option) => {
    setSearch(value.label)
    setFocused(false)
    setSelected(true)
    onSelect(value)
  }

  const onCreateItem = () => {
    setFocused(false)
    setSelected(true)
    onSelect({ label: search, isNew: true })
  }

  const onClear = () => {
    setSearch('')
    setSelected(false)
    onRemove()
  }

  const canCreate = useMemo(() => {
    if (isLoading) return false
    return search.length > 0 && (filteredResults.length === 0 || creatable)
  }, [isLoading, search, filteredResults, creatable])

  return (
    <Popover open={focused}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            value={search}
            placeholder={placeholder || 'Search...'}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                setFocused(false)
              }
              if (e.key === 'Enter') {
                if (filteredResults.length > 0) {
                  onSelectItem(filteredResults[0])
                } else {
                  onCreateItem()
                }
              }
            }}
            // onBlur={() => setFocused(false)}
            disabled={selected || disabled}
            className="disabled:opacity-50"
          />
          {selected && (
            <button
              onClick={onClear}
              className="absolute right-1 translate-y-[-50%] top-[50%] p-2 hover:bg-slate-600 hover:rounded-md"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        asChild
        onOpenAutoFocus={e => e.preventDefault()}
        onPointerDownOutside={() => {
          setSearch('')
          setFocused(false)
        }}
      >
        <ScrollArea
          className={`p-1 ${filteredResults.length > 0 ? 'h-[240px]' : ''}`}
        >
          {filteredResults.map(option => (
            <button
              key={option.value}
              onClick={() => onSelectItem(option)}
              className="block py-1 px-2 rounded-sm w-full text-left hover:text-white hover:bg-slate-600"
            >
              {option.label}
            </button>
          ))}
          {canCreate && (
            <Button
              onClick={onCreateItem}
              size="sm"
              variant="secondary"
              className="w-full"
            >
              Create &quot;{search}&quot;
            </Button>
          )}
          {isLoading && <Loading size="sm" />}
          {!isLoading && onSearch && !search && (
            <p className="text-xs p-2">Begin typing to search...</p>
          )}
          {!isLoading &&
            !onSearch &&
            filteredResults.length === 0 &&
            search.length === 0 && (
              <p className="text-xs p-2">
                No options available. Type to create one.
              </p>
            )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
