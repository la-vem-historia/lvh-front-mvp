import type { User } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

// Foto da pessoa ou, sem foto, a inicial do nome sobre o creme
const Avatar = ({ user, className }: { user: User; className?: string }) => (
  <span
    className={cn(
      'bg-sand text-foreground flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-medium',
      className
    )}
  >
    {user.avatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.avatar} alt='' className='size-full object-cover' />
    ) : (
      <span aria-hidden='true'>{user.name.trim().charAt(0).toUpperCase() || '?'}</span>
    )}
  </span>
)

export default Avatar
