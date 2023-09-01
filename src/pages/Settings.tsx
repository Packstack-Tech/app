import { useForm } from "react-hook-form"
import { Box } from "@/components/ui"
import { useUserQuery } from "@/queries/user"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/Form"
import { currencies } from "@/lib/currencies"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { SelectValue } from "@radix-ui/react-select"

type SettingsForm = {
  email: string
  currency: string
}

export const Settings = () => {
  const { data } = useUserQuery()
  const form = useForm<SettingsForm>({
    defaultValues: {
      email: data?.email || "",
      currency: data?.currency.code || "",
    },
  })

  const onSubmit = (data: SettingsForm) => {
    console.log(data)
  }

  return (
    <div className="max-w-lg mx-auto my-8">
      <Box>
        <h2>Settings</h2>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency..." />
                        <SelectContent>
                          <ScrollArea className="h-80">
                            {currencies.map(({ code, name }) => (
                              <SelectItem key={code} value={code}>
                                ({code}) {name}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                </FormItem>
              )}
            />
          </Form>
        </form>
      </Box>
    </div>
  )
}
