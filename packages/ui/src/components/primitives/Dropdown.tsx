import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
  useState
} from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { AnimatePresence } from 'framer-motion'
import {
  cva,
  css as designCss,
  type Styles
} from '@reservoir0x/relay-design-system/css'

const DropdownMenuContentCss = cva({
  base: {
    mx: '4',
    p: '3',
    borderRadius: 8,
    zIndex: 5,
    background: 'neutralBg',
    boxShadow: '0px 0px 50px 0px #0000001F'
  }
})

const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.DropdownMenuContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.DropdownMenuContent> & {
    css?: Styles
  }
>(({ children, css, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.DropdownMenuContent
      {...props}
      ref={forwardedRef}
      className={designCss(DropdownMenuContentCss.raw(), css)}
    >
      {children}
    </DropdownMenuPrimitive.DropdownMenuContent>
  )
})

const DropdownMenuItemCss = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 16,
    color: 'gray12',
    backgroundColor: 'gray2',
    p: '3',
    outline: 'none',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'gray5'
    },
    '&:focus': {
      backgroundColor: 'gray5'
    }
  }
})

const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.DropdownMenuItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.DropdownMenuItem> & {
    css?: Styles
  }
>(({ children, css, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.DropdownMenuItem
      {...props}
      ref={forwardedRef}
      className={designCss(DropdownMenuItemCss.raw(), css)}
    >
      {children}
    </DropdownMenuPrimitive.DropdownMenuItem>
  )
})

type Props = {
  trigger: ReactNode
  contentProps?: ComponentPropsWithoutRef<typeof DropdownMenuContent>
}

const Dropdown = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Root>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & Props
>(({ children, trigger, contentProps, ...props }, forwardedRef) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenuPrimitive.Root
      {...props}
      open={props.open ?? open}
      onOpenChange={props.onOpenChange ?? setOpen}
    >
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <AnimatePresence>
        {(props.open || open) && (
          <DropdownMenuContent ref={forwardedRef} {...contentProps}>
            {children}
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  )
})

Dropdown.displayName = 'Dropdown'

export { Dropdown, DropdownMenuContent, DropdownMenuItem }
