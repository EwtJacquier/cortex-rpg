'use client'

import { validateEmail, validateNotEmpty } from '@/helpers/validation';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import SaMessage from '@/components/sa-message';
import { useApp } from '@/context/app-context';

type FormProps = {
  afterSave: () => void
}

const FormOptions = (props: FormProps) => {
  const {gameData, updateCurrentMap, updateScene, updateDoom, userData, changeCurrentToken, userCurrentToken, tokens} = useApp()

  const [currentMap, setCurrentMap] = useState('')
  const [currentScene, setCurrentScene] = useState('')
  const [doom, setDoom] = useState<string>()
  const [doomEnabled, setDoomEnabled] = useState<boolean>()
  const [night, setNight] = useState<boolean>()
  const [nightScene, setNightScene] = useState<boolean>()

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (gameData){
      setCurrentMap(gameData.map.current)
      setDoom(gameData.map.doom)
      setDoomEnabled(gameData.map.doom_enabled)
      setNight(gameData.maps[gameData.map.current].night ? gameData.maps[gameData.map.current].night : false)
      setNightScene(gameData.map.night_scene)
    }
    
  }, [gameData])

  const onSubmit = () => {

    setIsLoading(true);

    if (updateCurrentMap){

      updateCurrentMap(currentMap, night);

      if (doomEnabled !== gameData.map.doom_enabled || doom !== gameData.map.doom ){
        updateDoom(doomEnabled, doom)
      }

      props.afterSave()
    }

    setIsLoading(false)
  }

  return (
    <Box display='flex' flexDirection='column' style={styles.container}>
      <Typography component='h2' variant='h4'>Opções de Jogo</Typography>
      {currentMap && <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={Object.keys(gameData.maps).map((item, index) => ({value: item, label: item}))}
          label='Mapa Atual'
          value={currentMap}
          getValue={setCurrentMap}
        />
        {night !== undefined && <SaInput
          select={true}
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Noite'
          value={night ? '1' : '0'}
          getValue={(value: string) => setNight(value === '1')}
        />}
      </Box>}
      {gameData.map && <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        {doom !== undefined && <SaInput
          label='Doom'
          value={doom}
          getValue={setDoom}
        />}
        {doomEnabled !== undefined && <SaInput
          select={true}
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Doom Habilitado'
          value={doomEnabled ? '1' : '0'}
          getValue={(value: string) => setDoomEnabled(value === '1')}
        />}
      </Box>}
      <SaButton loading={isLoading} variant='contained' text='Salvar' onClick={onSubmit}></SaButton>
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

export default FormOptions