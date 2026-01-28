import React from 'react'
import { Composition } from 'remotion'
import { ChartReplay } from './compositions/ChartReplay'
import type { ChartReplayProps } from './compositions/ChartReplay'

const defaultChartReplayProps: ChartReplayProps = {
  candles: [],
  entryMarker: null,
  exitMarker: null,
  speed: 1,
  startIndex: 0,
  tokenSymbol: '',
}

// Wrapper component to fix type inference
const ChartReplayWrapper: React.FC<Record<string, unknown>> = (props) => {
  return <ChartReplay {...(props as unknown as ChartReplayProps)} />
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChartReplay"
        component={ChartReplayWrapper}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultChartReplayProps as unknown as Record<string, unknown>}
      />
    </>
  )
}
