import AnimationShowcase from '../components/AnimationShowcase'
import Head from 'next/head'

export default function AnimationDemo() {
  return (
    <>
      <Head>
        <title>Animation Demo - HealthMonitor</title>
        <meta name="description" content="Khám phá các hiệu ứng animation đẹp mắt với Anime.js" />
      </Head>
      <AnimationShowcase />
    </>
  )
}
