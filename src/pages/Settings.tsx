import { useForm } from "react-hook-form"
import { SelectValue } from "@radix-ui/react-select"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { DISTANCE, distances, weightUnits } from "@/lib/consts"

import { Box, Button, Input } from "@/components/ui"
import { useUpdateUser } from "@/queries/user"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form"
import { currencies } from "@/lib/currencies"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Mixpanel } from "@/lib/mixpanel"
import { SYSTEM_UNIT } from "@/lib/consts"
import { useUser } from "@/hooks/useUser"

type SettingsForm = {
  email: string
  currency: string
  unit_distance: DISTANCE
  unit_weight: SYSTEM_UNIT
}

const schema = z.object({
  email: z.string().email(),
  currency: z.string(),
  unit_distance: z.string(),
  unit_weight: z.enum(["IMPERIAL", "METRIC"]),
})

export const Settings = () => {
  const user = useUser()
  const navigate = useNavigate()
  const updateUser = useUpdateUser()
  const form = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user.email || "",
      currency: user.currency.code || "",
      unit_distance: user.unit_distance || DISTANCE.Kilometers,
      unit_weight: user.unit_weight || "METRIC",
    },
  })

  const onSubmit = (data: SettingsForm) => {
    updateUser.mutate(data, {
      onSuccess: () => {
        Mixpanel.track("Settings:Updated", { ...data })
      },
    })
  }

  const onLogout = () => {
    localStorage.removeItem("jwt")
    navigate("/auth/login")
  }

  return (
    <div className="max-w-lg mx-auto my-8">
      <Box>
        <h2>Settings</h2>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_weight"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Weight Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder="Select weight unit..."
                          defaultValue={field.value}
                        />
                        <SelectContent>
                          {weightUnits.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="my-4">
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

            <FormField
              control={form.control}
              name="unit_distance"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Distance Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder="Select distance unit..."
                          defaultValue={field.value}
                        />
                        <SelectContent>
                          {distances.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                </FormItem>
              )}
            />
          </Form>

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => onLogout()}
            >
              <LogOut size={12} /> Logout
            </Button>
            <Button variant="secondary" disabled={updateUser.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Box>
      <Box className="mt-8">
        <p>
          Packstack is open-source software. You can find the code repository on{" "}
          <a
            href="https://github.com/Packstack-Tech/app"
            target="_blank"
            className="link"
          >
            Github
          </a>
          .
        </p>
      </Box>
    </div>
  )
}
