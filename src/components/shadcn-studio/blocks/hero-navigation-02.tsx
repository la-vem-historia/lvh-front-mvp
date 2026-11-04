'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { useMedia } from 'react-use'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'

import { cn } from '@/lib/utils'

import Logo from '@/components/shadcn-studio/logo'
import { MenuIcon, ChevronRightIcon, CircleSmallIcon } from "lucide-react"

type NavigationItem = {
  title: string
  href: string
  icon?: ReactNode
  description?: string
}

type ImageSection = {
  img: string
  href: string
  title: string
  description?: string
}

type Navigation = {
  title: string
  contentClassName?: string
} & (
  | {
      href: string
      items?: never
      subtitle?: never
      imgSubtitle?: never
      imageSection?: never
    }
  | {
      href?: never
      subtitle?: never
      imgSubtitle?: never
      items?: NavigationItem[]
      imageSection?: never
    }
  | {
      href?: never
      subtitle: string
      imgSubtitle: string
      items?: NavigationItem[]
      imageSection: ImageSection
    }
)

// Helper component to render navigation items with icons/descriptions
const RichNavigationItem = ({ item }: { item: NavigationItem }) => (
  <NavigationMenuLink href={item.href} closeOnClick className='flex gap-2 p-2'>
    <div className='flex items-start gap-3'>
      {item.icon && (
        <div className='bg-background [&_svg]:text-foreground! flex size-7 items-center justify-center rounded-sm border'>
          {item.icon}
        </div>
      )}
      <div className='flex-1 space-y-1'>
        <div className='text-popover-foreground text-sm font-medium'>{item.title}</div>
        {item.description && <p className='text-muted-foreground line-clamp-2 text-sm'>{item.description}</p>}
      </div>
    </div>
  </NavigationMenuLink>
)

// Helper component to render simple navigation items
const SimpleNavigationItem = ({ item }: { item: NavigationItem }) => (
  <NavigationMenuLink href={item.href} closeOnClick className='text-muted-foreground hover:text-primary block p-2'>
    {item.title}
  </NavigationMenuLink>
)

// Helper component to render the image section
const ImageSectionContent = ({ imageSection }: { imageSection: ImageSection }) => (
  <a href={imageSection.href} className='relative block h-full overflow-hidden rounded-md'>
    <img src={imageSection.img} alt={imageSection.title} className='h-full w-full object-cover' />
    <span className='absolute inset-0 h-full bg-linear-to-t from-black/60 to-transparent' />
    <span className='absolute bottom-0 p-4 text-white'>
      <h3 className='font-semibold'>{imageSection.title}</h3>
      {imageSection.description && <p className='text-sm'>{imageSection.description}</p>}
    </span>
  </a>
)

const HeroNavigation02 = ({ navigationData, className }: { navigationData: Navigation[]; className?: string }) => {
  const hasRichContent = (items?: NavigationItem[]) => items?.some(item => item.description || item.icon)

  return (
    <div className={cn('flex items-center', className)}>
      <NavigationMenu align='center'>
        <NavigationMenuList className='flex-wrap gap-0'>
          {navigationData.map(navItem => {
            // Simple link (no dropdown)
            if (navItem.href) {
              return (
                <NavigationMenuItem key={navItem.title}>
                  <NavigationMenuLink
                    href={navItem.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'text-foreground hover:text-muted-foreground bg-transparent! px-3 py-1.5 text-sm! font-medium shadow-none'
                    )}
                  >
                    {navItem.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            }

            // Dropdown with items
            const ItemComponent = hasRichContent(navItem.items) ? RichNavigationItem : SimpleNavigationItem
            const spacing = hasRichContent(navItem.items) ? 'space-y-2' : 'space-y-0.5'

            return (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuTrigger className='text-muted-foreground hover:text-primary dark:hover:bg-accent/50 bg-transparent! px-3 py-1.5 text-base [&>svg]:size-4'>
                  {navItem.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className={cn('p-1.5!', navItem.contentClassName)}>
                  {navItem.imageSection ? (
                    <div className='grid grid-cols-2 gap-2'>
                      <ul className='bg-background space-y-2 rounded-md border p-2'>
                        <li className='text-muted-foreground px-2 text-sm'>{navItem.subtitle}</li>
                        {navItem.items?.map(item => (
                          <li key={item.title}>
                            <RichNavigationItem item={item} />
                          </li>
                        ))}
                      </ul>
                      <div className='relative flex h-full flex-col overflow-hidden'>
                        <h3 className='text-muted-foreground mb-2 px-2 text-sm'>{navItem.imgSubtitle}</h3>
                        <div className='flex-1'>
                          <ImageSectionContent imageSection={navItem.imageSection} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ul className={cn('bg-background rounded-md border p-2', spacing)}>
                      {navItem.items?.map(item => (
                        <li key={item.title}>
                          <ItemComponent item={item} />
                        </li>
                      ))}
                    </ul>
                  )}
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const HeroNavigation02SmallScreen = ({
  navigationData,
  triggerClassName,
  screenSize = 1023
}: {
  navigationData: Navigation[]
  triggerClassName?: string
  screenSize?: number
}) => {
  const [open, setOpen] = useState(false)
  const isMobile = useMedia(`(max-width: ${screenSize}px)`, false)

  const handleLinkClick = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!isMobile) {
      setOpen(false)
    }
  }, [isMobile])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant='outline' size='icon' className={cn('inline-flex lg:hidden', triggerClassName)}>
            <MenuIcon
            />
            <span className='sr-only'>Menu</span>
          </Button>
        }
      />
      <SheetContent side='left' className='w-75 gap-0 p-0'>
        <SheetHeader className='p-4'>
          <SheetTitle hidden />
          <SheetDescription hidden />
          <a href='#' onClick={handleLinkClick} className='self-start'>
            <Logo />
          </a>
        </SheetHeader>
        <div className='space-y-0.5 overflow-y-auto p-2'>
          {navigationData.map((navItem, index) => {
            if (navItem.href) {
              return (
                <a
                  key={navItem.title}
                  href={navItem.href}
                  className='hover:bg-accent flex items-center gap-2 rounded-sm px-3 py-2 text-sm'
                  onClick={handleLinkClick}
                >
                  {navItem.title}
                </a>
              )
            }

            return (
              <Collapsible key={index} className='w-full'>
                <CollapsibleTrigger className='hover:bg-accent group flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm'>
                  <div className='flex items-center gap-2'>{navItem.title}</div>
                  <ChevronRightIcon className='size-4 shrink-0 transition-transform duration-300 group-data-panel-open:rotate-90' />
                </CollapsibleTrigger>
                <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-all duration-300 data-ending-style:h-0 data-starting-style:h-0'>
                  {navItem.items?.map(item => (
                    <a
                      key={item.title}
                      href={item.href}
                      className='hover:bg-accent ml-3 flex items-center gap-2 rounded-sm px-3 py-2 text-sm'
                      onClick={handleLinkClick}
                    >
                      {item.icon ? (
                        item.icon
                      ) : (
                        <CircleSmallIcon className='size-4' />
                      )}
                      {item.title}
                    </a>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { HeroNavigation02, HeroNavigation02SmallScreen, type Navigation, type NavigationItem, type ImageSection }
