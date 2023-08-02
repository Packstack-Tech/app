import { FC, useState, useEffect } from "react"
import { XIcon } from "lucide-react"

import { CreateableOption, Option } from "@/types/lib"
import { useFuzzySearch } from "@/hooks/useFuzzySearch"

import { Input } from "./Input"
import { Popover, PopoverContent, PopoverAnchor } from "./Popover"
import { Button } from "./Button"

type Props = {
  value?: number
  options: Option[]
  disabled?: boolean
  onSelect: (value: CreateableOption) => void
  onRemove: () => void
}

export const Combobox: FC<Props> = ({
  value,
  options,
  disabled,
  onSelect,
  onRemove,
}) => {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (value) {
      const option = options.find((option) => option.value === value)
      if (option) {
        setSearch(option.label)
        setSelected(true)
      }
    } else {
      setSearch("")
      setSelected(false)
    }
  }, [value, options])

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
    setSearch("")
    setSelected(false)
    onRemove()
  }

  return (
    <Popover open={focused}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            value={search}
            placeholder="search..."
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            disabled={selected || disabled}
            className="disabled:opacity-100"
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
        className="py-1 px-1 max-h-[240px] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={() => {
          setSearch("")
          setFocused(false)
        }}
      >
        {filteredResults.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelectItem(option)}
            className="block py-1 px-2 rounded-sm w-full text-left hover:text-white hover:bg-slate-600"
          >
            {option.label}
          </button>
        ))}
        {filteredResults.length === 0 && search.length > 0 && (
          <Button
            onClick={onCreateItem}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            Create &quot;{search}&quot;
          </Button>
        )}
        {filteredResults.length === 0 && search.length === 0 && (
          <p className="text-xs p-2">
            No options available. Type to create one.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
