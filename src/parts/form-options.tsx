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
  const {gameData, updateCurrentMap, userData, changeCurrentToken, userCurrentToken, tokens} = useApp()

  const [currentMap, setCurrentMap] = useState('')
  const [currentScene, setCurrentScene] = useState('')
  const [doom, setDoom] = useState<string>()
  const [doomEnabled, setDoomEnabled] = useState<boolean>()
  const [sceneVisible, setSceneVisible] = useState<boolean>()
  const [night, setNight] = useState<boolean>()
  const [nightScene, setNightScene] = useState<boolean>()

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (gameData){
      setCurrentMap(gameData.map.current)
      setDoom(gameData.map.doom)
      setDoomEnabled(gameData.map.doom_enabled)
      setSceneVisible(gameData.map.scene_visible)
      setNight(gameData.map.night)
      setNightScene(gameData.map.night_scene)
    }
    
  }, [gameData])

  const onSubmit = () => {

    setIsLoading(true);

    if (updateCurrentMap){
      updateCurrentMap(currentMap, currentScene, sceneVisible !== undefined ? sceneVisible : false, doomEnabled !== undefined ? doomEnabled : false, doom !== undefined ? doom : '', night !== undefined ? night : false, nightScene !== undefined ? nightScene : false)

      props.afterSave()
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
      {gameData.map && <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        {sceneVisible !== undefined && <SaInput
          select={true}
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Cena Visível'
          value={sceneVisible ? '1' : '0'}
          getValue={(value: string) => setSceneVisible(value === '1')}
        />}
        {night !== undefined && <SaInput
          select={true}
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Noite'
          value={night ? '1' : '0'}
          getValue={(value: string) => setNight(value === '1')}
        />}
        {nightScene !== undefined && <SaInput
          select={true}
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Noite na Cena'
          value={nightScene ? '1' : '0'}
          getValue={(value: string) => setNightScene(value === '1')}
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