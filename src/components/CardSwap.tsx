import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactElement,
  type RefObject,
} from 'react'
import gsap from 'gsap'

type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`ps-card ${className ?? ''}`.trim()} />
))
Card.displayName = 'Card'

type Slot = { x: number; y: number; z: number; zIndex: number }

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
})

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  })

type CardSwapProps = {
  width?: number
  height?: number
  cardDistance?: number
  verticalDistance?: number
  delay?: number
  pauseOnHover?: boolean
  skewAmount?: number
  easing?: 'elastic' | 'smooth'
  children: React.ReactNode
}

export function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  skewAmount = 6,
  easing = 'elastic',
  children,
}: CardSwapProps) {
  const config = useMemo(
    () =>
      easing === 'elastic'
        ? { ease: 'elastic.out(0.6,0.9)', durDrop: 2, durMove: 2, durReturn: 2, promoteOverlap: 0.9, returnDelay: 0.05 }
        : { ease: 'power1.inOut', durDrop: 0.8, durMove: 0.8, durReturn: 0.8, promoteOverlap: 0.45, returnDelay: 0.2 },
    [easing],
  )

  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children])
  const refs = useMemo<RefObject<HTMLDivElement | null>[]>(
    () => childArr.map(() => ({ current: null })),
    [childArr.length], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i))
  const tl = useRef<gsap.core.Timeline | null>(null)
  const interval = useRef<number | undefined>(undefined)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const total = refs.length
    refs.forEach((r, i) => r.current && placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount))

    const swap = () => {
      if (order.current.length < 2) return
      const [front, ...rest] = order.current
      const elFront = refs[front].current
      if (!elFront) return
      const t = gsap.timeline()
      tl.current = t

      t.to(elFront, { y: '+=500', duration: config.durDrop, ease: config.ease })
      t.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`)
      rest.forEach((idx, i) => {
        const el = refs[idx].current
        if (!el) return
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length)
        t.set(el, { zIndex: slot.zIndex }, 'promote')
        t.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.15}`)
      })

      const back = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length)
      t.addLabel('return', `promote+=${config.durMove * config.returnDelay}`)
      t.call(() => { gsap.set(elFront, { zIndex: back.zIndex }) }, undefined, 'return')
      t.to(elFront, { x: back.x, y: back.y, z: back.z, duration: config.durReturn, ease: config.ease }, 'return')
      t.call(() => { order.current = [...rest, front] })
    }

    swap()
    interval.current = window.setInterval(swap, delay)

    if (pauseOnHover) {
      const node = container.current
      if (!node) return
      const pause = () => {
        tl.current?.pause()
        clearInterval(interval.current)
      }
      const resume = () => {
        tl.current?.play()
        interval.current = window.setInterval(swap, delay)
      }
      node.addEventListener('mouseenter', pause)
      node.addEventListener('mouseleave', resume)
      return () => {
        node.removeEventListener('mouseenter', pause)
        node.removeEventListener('mouseleave', resume)
        clearInterval(interval.current)
        tl.current?.kill()
      }
    }
    return () => {
      clearInterval(interval.current)
      tl.current?.kill()
    }
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, config, refs])

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<CardProps & { ref?: RefObject<HTMLDivElement | null> }>, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
        })
      : child,
  )

  return (
    <div ref={container} className="ps-swap" style={{ width, height }}>
      {rendered}
    </div>
  )
}
