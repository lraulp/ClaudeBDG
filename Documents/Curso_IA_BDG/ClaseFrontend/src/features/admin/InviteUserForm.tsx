import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserSummary } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  handle: z.string().min(2).regex(/^[a-z0-9_]+$/),
  email: z.string().email('Email inválido'),
})

type Values = z.infer<typeof schema>

interface Props {
  onInvite: (user: UserSummary) => void
}

export default function InviteUserForm({ onInvite }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: Values) {
    const newUser: UserSummary = {
      id: `u${Date.now()}`,
      name: values.name,
      handle: values.handle,
      role: 'usuario',
      active: true,
    }
    onInvite(newUser)
    toast.success(`Usuario @${values.handle} añadido`)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end flex-wrap">
      <div className="space-y-1">
        <Label>Nombre</Label>
        <Input {...register('name')} placeholder="Nombre completo" className="w-44" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Handle</Label>
        <Input {...register('handle')} placeholder="handle" className="w-32" />
        {errors.handle && <p className="text-xs text-red-500">{errors.handle.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input {...register('email')} type="email" placeholder="email@empresa.com" className="w-52" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        Agregar usuario
      </Button>
    </form>
  )
}
