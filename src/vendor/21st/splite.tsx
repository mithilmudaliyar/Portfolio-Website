/*
 * RAW, UNMODIFIED pull from 21st.dev (serafimcloud/splite).
 * Not wired into the app. Reference only — see /goal for adaptation plan.
 * Requires: @splinetool/runtime, @splinetool/react-spline, AND an actual
 * authored Spline scene (build one at spline.design and export its public
 * scene URL) — there is no scene asset for this project yet.
 * Source: https://21st.dev/@serafimcloud/components/splite
 */
'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
}
