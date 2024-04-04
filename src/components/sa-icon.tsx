'use client'

import theme from '@/app/theme';
import "external-svg-loader";
import { useState, useEffect } from 'react';

type saIconProps = {
  name: string,
  size?: number
  theme?: 'primary' | 'secondary' | 'error' | 'paper',
  hover?: boolean,
  active?: boolean,
  onClick?: (e?: any) => void,
  className?: string,
  style?: object
}

const SaIcon = (props: saIconProps) => {
  const defaultSize = 24
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <>
      <style jsx>{`
        .saIcon--default :global(path[stroke]) {
          stroke: ${theme.palette.text.primary}
        }
        .saIcon--default :global(path[fill]) {
          fill: ${theme.palette.text.primary}
        }
        .saIcon--paper :global(path[stroke]) {
          stroke: ${theme.palette.background.paper}
        }
        .saIcon--paper :global(path[fill]) {
          fill: ${theme.palette.background.paper}
        }
        .saIcon--secondary :global(path[stroke]) {
          stroke: ${theme.palette.secondary['500']}
        }
        .saIcon--secondary :global(path[fill]) {
          fill: ${theme.palette.secondary['500']}
        }
        .saIcon--primary :global(path[stroke]) {
          stroke: ${theme.palette.primary['600']}
        }
        .saIcon--primary :global(path[fill]) {
          fill: ${theme.palette.primary['600']}
        }
        .saIcon--error :global(path[stroke]) {
          stroke: ${theme.palette.error['700']}
        }
        .saIcon--error :global(path[fill]) {
          fill: ${theme.palette.error['700']}
        }
        .saIcon--hover :global(path[stroke]) {
          stroke: ${theme.palette.primary['600']
        }
        .saIcon--hover :global(path[fill]) {
          fill: ${theme.palette.primary['600']
        }
      `}</style>
      {loaded && <svg
        data-src={'/images/icons/'+props.name+'.svg'}
        onClick={props.onClick}
        width={props.size ? props.size : defaultSize}
        height={props.size ? props.size : defaultSize}
        className={'saIcon--' + (props.theme ? props.theme : 'default') + (props.hover ? ' saIcon--hover' : '') + ' ' + props.className}
        style={{
          cursor: props.onClick !== undefined ? 'pointer' : 'inherit',
          ...props.style
        }}
      />}
    </>
  )
}

export default SaIcon