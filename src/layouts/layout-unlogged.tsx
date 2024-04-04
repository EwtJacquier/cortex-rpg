'use client'

import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; 
import Image from 'next/image';
import { useApp } from '@/context/app-context';

type layoutUnloggedProps = {
  children: React.ReactNode
}

const LayoutUnlogged = (props: layoutUnloggedProps) => {
  const {windowSize} = useApp()

  const backgroundImage = {
    background: 'url(/images/unlogged-bg.webp) no-repeat top center',
    backgroundSize: 'cover'
  }

  return (
    <Grid container height={1}>
      <Grid container xs={12} md={6} height={1} direction='column' justifyContent='center' alignItems='center'>
        {props.children}
        <Typography style={{position: 'absolute', bottom: 30, left: 30}}>© ewt 2024</Typography>
      </Grid>
      <Grid container xs={0} md={6} height={1} sx={[ styles.background, backgroundImage ]}></Grid>
    </Grid>
  )
}

const styles = {
  background: {
    position: 'relative',
    overflow: 'hidden',
  }
}

export default LayoutUnlogged