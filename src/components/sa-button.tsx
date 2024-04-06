'use client'

import { Button, CircularProgress, SxProps, Theme } from '@mui/material';
import SaIcon from './sa-icon';
import theme from '@/app/theme';

type saButtonProps = {
  variant: 'text' | 'contained' | 'outlined',
  text?: string,
  icon?: string,
  url?: string,
  disabled?: boolean,
  theme?: 'primary' | 'secondary' | 'error'
  small?: boolean,
  onClick?: () => void,
  style?: object,
  loading?: boolean
  id?: string
}

const SaButton = (props: saButtonProps) => {

  const border = props.variant === 'outlined' ? ( props.theme === 'secondary' ? styles.secondaryOutline : styles.primaryOutline ) : {}
  let paddingVertical = props.variant === 'outlined' ? 10 : 12;

  if (props.small){
    paddingVertical -= 4
  }
  
  return (
    <Button 
      variant={props.variant}
      href={props.url}
      color={props.theme}
      disableElevation={true}
      onClick={props.onClick}
      type='submit'
      sx={{
        ...styles.button,
        padding: `${paddingVertical}px 18px`,
        ...border
      }}
      id={props.id}
      style={props.style}
      disabled={props.disabled}>
        {!props.loading && props.text}
        {!props.loading && props.icon && <SaIcon name={props.icon}></SaIcon>}
        {props.loading && <CircularProgress size={18} color='inherit' style={{margin: '4px 0 3px 0'}} />}
    </Button>
  )
}

const styles = {
  button: {
    textTransform: 'initial',
    fontWeight: 600,
    borderRadius: '10px',
    borderWidth: '2px !important'
  },
  primaryOutline: {
    borderWidth: '2px !important',
    borderColor: theme.palette.primary['300']
  },
  secondaryOutline: {
    borderWidth: '2px !important',
    borderColor: theme.palette.secondary['300'],
    color: theme.palette.text.primary
  }
}

export default SaButton