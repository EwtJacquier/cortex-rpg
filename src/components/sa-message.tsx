'use client'

import { Box, Typography } from '@mui/material'
import SaIcon from './sa-icon'
import { useEffect, useState } from 'react'
import theme from '@/app/theme'

type saMessageProps = {
  message: string,
  type: 'success' | 'error',
  onClose: () => void
}

const SaMessage = (props: saMessageProps) => {
  return (
    <Box height='50px' display='flex' justifyContent='space-between' alignItems='center' sx={styles.container}>
      <Box display='flex' justifyContent='space-between' alignItems='center' gap='10px'>
        <SaIcon size={24} name={props.type === 'success' ? 'check' : 'cross-circle'} theme={props.type === 'success' ? 'primary' : 'error'}/>
        <Typography>{props.message}</Typography>
      </Box>
      <SaIcon size={16} name='cross-big' onClick={props.onClose}/>
    </Box>
  )
}

const styles = {
  container: {
    border: `solid 2px ${theme.palette.secondary['300']}`,
    borderRadius: '8px',
    paddingInline: '15px',
    marginBottom: '10px'
  }
}

export default SaMessage