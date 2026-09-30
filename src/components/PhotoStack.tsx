import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { Card, CardSwap } from './CardSwap'
import { EdgeBlur } from './EdgeBlur'
import './PhotoStack.css'

const base = `${import.meta.env.BASE_URL}photo-stack/`

const DARK: [number, number, number] = [0.102, 0.102, 0.102]
const LIGHT: [number, number, number] = [1, 1, 1]

function useDarkMode() {
  const query = '(prefers-color-scheme: dark)'
  const [dark, setDark] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

export function PhotoStack() {
  const dark = useDarkMode()
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { once: true, amount: 0.3 })
  const small = window.innerWidth < 768
  const size = small ? 150 : 290
  const gap = small ? 20 : 40

  return (
    <motion.div
      ref={root}
      data-clone-root
      className="ps-root"
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } }}
    >
      <div className="ps-frame">
        <motion.div
          className="ps-media"
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
        >
          <video src={`${base}vid-2e7270cf23.mp4`} autoPlay loop muted playsInline className="ps-fill" />
        </motion.div>
        <div className="ps-dock">
          <CardSwap
            width={size}
            height={size}
            cardDistance={gap}
            verticalDistance={gap}
            delay={5000}
            pauseOnHover={false}
            skewAmount={3}
            easing="smooth"
          >
            <Card>
              <img src={`${base}img-f9055d6d2d.jpg`} alt="Photo 1" className="ps-fill" />
            </Card>
            <Card>
              <img src={`${base}img-f1e86c98d0.jpeg`} alt="Photo 2" className="ps-fill" />
            </Card>
            <Card>
              <img src={`${base}img-52c13b9c6c.jpeg`} alt="Photo 3" className="ps-fill" />
            </Card>
          </CardSwap>
        </div>
      </div>
      <div className="ps-edge">
        <EdgeBlur shapeSize={2} roundness={-1} borderSize={0.2} circleSize={0.04} circleEdge={0.9} color={dark ? DARK : LIGHT} />
      </div>
    </motion.div>
  )
}
