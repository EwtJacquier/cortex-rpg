'use client'

import { validateEmail, validateNotEmpty } from '@/helpers/validation';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation'
import SaMessage from '@/components/sa-message';
import { UserCredential } from 'firebase/auth';

const FormLogin = () => {
  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false)
  const [password, setPassword] = useState('')
  const [validPassword, setValidPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {login, userData} = useApp()
  const router = useRouter()

  const onSubmit = () => {
    setErrorMessage('')

    if (validEmail && validPassword && login !== undefined){
      setIsLoading(true);

      (async() => {
        login(email, password).then((response) => {
          //router.push('/home')
        }).catch((error) => {
          setErrorMessage('Usuário ou senha inválidos')
          setIsLoading(false)
        })
      })()
    }
  }

  useEffect(() => {
    if (userData){
      router.push('/home')
    }
  }, [userData])

  return (
    <Box display='flex' flexDirection='column' style={styles.container}>
      {errorMessage && <SaMessage type='error' message={errorMessage} onClose={() => {setErrorMessage('')}} />}
      <Typography variant="h3" component="h1" style={styles.text} textAlign='center'>
        Cortex RPG
      </Typography>
      <SaInput
        type="email"
        placeholder='E-mail'
        autoComplete="one-time-code"
        value={email}
        validator={validateEmail}
        getValid={setValidEmail}
        getValue={setEmail}
      />
      <SaInput
        placeholder="Senha"
        type="password"
        autoComplete="one-time-code"
        value={password}
        validator={validateNotEmpty}
        getValid={setValidPassword}
        getValue={setPassword}
      />
      <SaButton
        style={styles.btnSubmit}
        text='Entrar'
        loading={isLoading}
        variant='contained'
        onClick={onSubmit}
      />
    </Box>
  )
}

const styles = {
  container: {
    gap: '15px',
    marginTop: 20
  },
  text: {
    marginBottom: 10
  },
  btnForgetPassword: {
    alignSelf: 'flex-end',
    padding: '2px 6px'
  },
  btnSubmit: {
    marginTop: '5px'
  }
}

export default FormLogin