'use client'

import SaModal, { saToken } from '@/components/sa-modal';
import { useApp } from '@/context/app-context';
import { Box, Typography } from "@mui/material"
import Image from 'next/image';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import theme from '@/app/theme';
import SaIcon from '@/components/sa-icon';
import { useRouter } from 'next/navigation';
import SaModalBasic from '@/components/sa-modal-basic';
import FormFicha from './form-ficha';
import FormOptions from './form-options';

const HomeContent = () => {
  const [isSceneOpen, setIsSceneOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isCanvasOpen, setIsCanvasOpen] = useState(false)
  const [currentMap, setCurrentMap] = useState('')
  const videoRef = useRef<any>()
  const videoRef2 = useRef<any>()
  const {windowSize, gameData, userData, tokens} = useApp()
  const router = useRouter()

  useEffect(() => {
    if (userData === null){
      router.push('/')
    }

    if (gameData && userData){
      setCurrentMap(gameData.map.current)

      if (videoRef.current) videoRef.current.load()
      if (videoRef2.current) videoRef2.current.load()
    }
  },[userData, gameData])

  const renderVideo = (url: string, ref: MutableRefObject<any>) => {
    return (
      <video ref={ref} loop autoPlay muted style={{position: 'absolute', top: 0, left: 0, objectFit: 'cover', width: '100%', height: '100%', pointerEvents: 'none'}}>
        <source src={url}/>
      </video>
    )
  }

  useEffect(() => {
    console.log(isCanvasOpen)
  }, [isCanvasOpen])

  return (
    <>
      {windowSize && <div id='canvas' style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: isCanvasOpen ? 9999999 : -1}}></div>}
      <button id='roll' style={{zIndex: -2, position: 'absolute', opacity: 0, pointerEvents: 'none'}}></button>
      {gameData && currentMap && <>
        <Box width='100%' height='100%' position='relative' overflow='hidden'>
          {gameData.map && currentMap && <Image src={`/scenes/${currentMap}.webp`} alt='' width={windowSize?.width} height={windowSize?.height} style={{width: '100%', height: '100%', objectFit:'cover', pointerEvents: 'none' }}/>}
          {gameData.map && gameData.maps[currentMap].effect && renderVideo(`/effects/${gameData.maps[currentMap].effect}.webm`, videoRef)}
          <Box sx={styles.title}>
            {gameData.map.doom_enabled && <Box display='flex' gap='5px' justifyContent='center' marginBottom='5px'>
              {gameData.map.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
            </Box>}
            <Typography variant="h1" color='#FFF' component="h1">{gameData.maps[currentMap].title}</Typography>
            <Typography color='#FFF' fontSize={'1.2rem'}>{gameData.maps[currentMap].subtitle}</Typography>  
          </Box>
          <Box sx={styles.menu}>
            {gameData.maps[currentMap].active_scene && 
            <Box onClick={() => {if (!isSceneOpen) setIsSheetOpen(false); setIsSceneOpen(!isSceneOpen) }} sx={[styles.menuItem]}>
              <SaIcon name='map' theme='paper' size={30} style={styles.menuItemIcon} />
            </Box>}
            {userData && <Box onClick={() => {setIsSheetOpen(!isSheetOpen)}} sx={[styles.menuItem]}>
              <SaIcon name='document' theme='paper' size={30} style={styles.menuItemIcon} />
            </Box>}
            {userData && userData.type === 'gm' && <Box onClick={() => {setIsOptionsOpen(!isOptionsOpen)}} sx={[styles.menuItem]}>
              <SaIcon name='zap' theme='paper' size={30} style={styles.menuItemIcon} />
            </Box>}
          </Box>
        </Box>
        {gameData.maps[currentMap].active_scene && <SaModal getCanvasOpen={(open: boolean) => {console.log('aqui'); setIsCanvasOpen(open)}} doom={gameData.map.doom_enabled && gameData.map.doom} isOpen={isSceneOpen} getIsOpen={setIsSceneOpen} bg={`/scenes/${currentMap}_${gameData.maps[currentMap].active_scene}.webp`} title={gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].name} size={gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].size}>
          {gameData.map && gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].effect && renderVideo(`/effects/${gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].effect}.webm`, videoRef2)}
        </SaModal>}
        <SaModalBasic isOpen={isSheetOpen} getIsOpen={setIsSheetOpen}>
          <FormFicha/>
        </SaModalBasic>
        <SaModalBasic key={'opt'} isOpen={isOptionsOpen} getIsOpen={setIsOptionsOpen}>
          <FormOptions/>
        </SaModalBasic>
      </>}
    </>

  )
}

const styles = {
  banner: {
    width: '100%'
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '30px 30px 30px 0',
    height: '100%',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  bannerContainer: {
    borderRadius: '16px', 
    overflow: 'hidden', 
    position: 'relative', 
    height: '22vw'
  },
  menuItem: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.4)',
    transition: 'all 300ms',
    width: '45px',
    height: '45px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8
    }
  },
  menuItemIcon: {
    marginTop: 2
  },
  title: {
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
    padding: '30px',
    width: '100%',
    textShadow: '2px -2px 5px #000',
    background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
  }
}

export default HomeContent;