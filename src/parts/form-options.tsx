'use client'

import { validateEmail, validateNotEmpty } from '@/helpers/validation';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import SaMessage from '@/components/sa-message';
import { useApp } from '@/context/app-context';

const FormOptions = () => {
  const {gameData, updateCurrentMap} = useApp()

  const [currentMap, setCurrentMap] = useState('')
  const [currentScene, setCurrentScene] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (gameData){
      setCurrentMap(gameData.map.current)
    }
    
  }, [gameData])

  const onSubmit = () => {

    setIsLoading(true);

    if (updateCurrentMap){
      updateCurrentMap(currentMap, currentScene)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (currentMap){
      setCurrentScene(gameData.maps[currentMap].active_scene)
    }
  }, [currentMap])

  return (
    <Box display='flex' flexDirection='column' style={styles.container}>
      <Typography component='h2' variant='h4'>Opções de Jogo</Typography>
      {currentMap && currentScene && <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={Object.keys(gameData.maps).map((item, index) => ({value: item, label: item}))}
          label='Mapa Atual'
          value={currentMap}
          getValue={setCurrentMap}
        />
        <SaInput
          select={true}
          items={Object.keys(gameData.maps[currentMap].scenes).map((item, index) => ({value: item, label: item}))}
          label='Cena Atual'
          value={Object.keys(gameData.maps[currentMap].scenes).indexOf(currentScene) > -1 ? currentScene : Object.keys(gameData.maps[currentMap].scenes)[0]}
          getValue={setCurrentScene}
        />
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