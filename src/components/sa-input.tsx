'use client'

import { validatorResponse } from '@/helpers/validation';
import { TextField, Box, MenuItem } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import SaIcon from './sa-icon';
import theme from '@/app/theme';

type saInputProps = {
  label?: string,
  placeholder?: string,
  type?: 'email' | 'password' | 'tel' | 'text' | 'number',
  select?: boolean,
  items?: Array<{value: string, label: string}>,
  autoComplete?: string,
  icon?: string,
  value?: string,
  name?: string,
  size?: 'small' | 'medium',
  gray?: boolean,
  getValue?: (text: string) => void,
  getValid?: (valid: boolean) => void,
  validator?: (text: string) => validatorResponse,
  readonly?: boolean,
}

const SaInput = (props: saInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [currentError, setErrorMessage] = useState('')
  const inputRef = useRef<any>()

  const onChangeText = (e: any) => {
    const text = e.target.value;

    if (props.getValue !== undefined){
      props.getValue(text);
    } 
  }

  useEffect(() => {
    let validData : boolean = false;

    if (props.value){
      if (!props.validator){
        validData = true;

        setErrorMessage('');
      }
  
      if (props.validator) {
        const response = props.validator(props.value);

        validData = response.valid;

        if (!validData){
          setErrorMessage(response.message);
        }
        else{
          setErrorMessage('');
        }
      }
    }
    else{
      setErrorMessage('');
    }
    
    if (props.getValid !== undefined){
      props.getValid(validData);  
    }
  },[props.value])

  let inputPropsObject: {
    placeholder?: string,
    startAdornment?: any,
    endAdornment?: any,
  } = {}

  useEffect(() => {
    /*
    if (inputRef.current.node){
      console.log(props.value,inputRef.current.node);
      inputRef.current.node.value = props.value
    }
    else{
      inputRef.current.value = props.value
    }
    */
  },[])

  let labelStyle = {}

  if (props.placeholder){
    inputPropsObject['placeholder'] = props.placeholder
  }

  if (props.readonly){
    inputPropsObject['readOnly'] = props.readonly
  }

  if (props.type === 'number') {
    inputPropsObject['min'] = 0;
  }

  if (props.icon){
    inputPropsObject['startAdornment'] = (
      <SaIcon name={props.icon} style={{marginRight: '5px'}} />
    )

    labelStyle = {
      '& .MuiInputLabel-root:not(.Mui-focused):not(.MuiFormLabel-filled)': {
        transform: 'translate(45px, 16px) scale(1)',
        pointerEvents: 'none'
      },
      '& .MuiOutlinedInput-notchedOutline legend': {
        maxWidth: 0
      }
    }
  }

  if (props.type === 'password'){
    inputPropsObject['endAdornment'] = (
      <SaIcon
        theme='secondary'
        name={showPassword ? 'eye-on' : 'eye-off'}
        onClick={() => setShowPassword(!showPassword)}
        style={{marginLeft: '5px'}}
      />
    )
  }

  let grayStyle = {}
  let labelGray = {}

  if (props.gray){
    grayStyle = {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.secondary,
    }

    labelGray = {
      backgroundColor: theme.palette.background.default,
      paddingInline: '5px',
      marginLeft: '-3px'
    }
  }

  const caretStyle = props.size === 'small' ? '-0.4rem' : '-0.36rem'
  const borderStyle = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: props.size === 'small' ? '1px' : '2px'
    }
  }
  
  return (
    <Box width={1} position='relative'>
      <TextField
        fullWidth={true}
        select={props.select}
        name={props.name}
        size={props.size ? props.size : 'medium'}
        label={props.label}
        type={props.type === 'password' && showPassword ? 'text' : props.type}
        autoComplete={props.autoComplete}
        helperText={currentError}
        variant="outlined"
        defaultValue={props.value ? props.value : ''}
        onKeyUp={onChangeText}
        onChange={onChangeText}
        color={currentError ? 'error' : 'primary'}
        focused={currentError ? true : undefined}
        className='saInput'
        sx={[styles.container, borderStyle, !currentError ? ({
          ...labelStyle,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: props.gray ? theme.palette.background.default : theme.palette.secondary["300"]
          }}) : {}]
        }
        InputProps={{
          style: {...styles.input, ...grayStyle},
          inputRef: inputRef,
          ...inputPropsObject
        }}
        SelectProps={{
          style: {...styles.input, ...grayStyle},
          IconComponent: (props) => { return ( <SaIcon name='chevron-down' style={{marginTop: 0, marginRight: '5px'}} {...props}/> ) },
          ref: inputRef,
          defaultValue: props.value ? props.value : '',
          ...inputPropsObject
        }}
        InputLabelProps={{
          style: {...styles.labelText, ...labelGray}
        }}
        FormHelperTextProps={{style: { ...styles.helperText, color: currentError ? theme.palette.error.main : '' }}}
      >
        {props.items?.map((option) => 
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        )}
      </TextField>
    </Box>
  )
}

const styles = {
  container: {
    '& .MuiOutlinedInput-root:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary['400']
    }
  },
  input: {
    borderRadius: '10px',
  },
  labelText: {
    fontSize: '1rem',
  },
  helperText: {
    margin: '5px 0 0 0',
    fontSize: '0.8rem'
  },
}

export default SaInput