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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isCanvasOpen, setIsCanvasOpen] = useState(false)
  const [currentMap, setCurrentMap] = useState('')
  const videoRef = useRef<any>()
  const videoRef2 = useRef<any>()
  const {windowSize, gameData, userData, tokens, isSheetOpen, setIsSheetOpen, messages} = useApp()
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
    if (isSceneOpen){
      setTimeout(function(){
        let el: any = document.getElementById('chat');
  
        if (el) el.scrollTop = el.scrollHeight;
      },500)
    }
  }, [messages, isSceneOpen])

  return (
    <>
      {windowSize && <div id='canvas' style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: isCanvasOpen ? 9999999 : -1}}></div>}
      {gameData && currentMap && <>
        <Box width='100%' height='100vh' display='flex' justifyContent='space-between' flexDirection={'row'} alignItems={'flex-start'} overflow={'hidden'}>
          <Box width='calc(100% - 300px)' height='100vh' position='relative' overflow='visible'>
            <Box width='100vw' height='100vh' position='relative' overflow='visible'>
              {gameData.map && currentMap && <Image src={`/scenes/${currentMap}.webp`} alt='' width={windowSize?.width} height={windowSize?.height} style={{width: '100%', height: '100%', objectFit:'cover', pointerEvents: 'none' }}/>}
              {gameData.map && gameData.maps[currentMap].effect && renderVideo(`/effects/${gameData.maps[currentMap].effect}.webm`, videoRef)}
              {gameData.map && gameData.map.night && <Box position='absolute' top={0} left={0} width={windowSize?.width} height={windowSize?.height} bgcolor='rgb(0 39 255 / 60%)' style={{mixBlendMode: 'darken'}}/>}
              <Box sx={styles.title}>
                {gameData.map.doom_enabled && <Box display='flex' gap='5px' justifyContent='center' marginBottom='5px'>
                  {gameData.map.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
                </Box>}
                <Typography variant="h1" color='#FFF' component="h1">{gameData.maps[currentMap].title}</Typography>
                <Typography color='#FFF' fontSize={'1.2rem'}>{gameData.maps[currentMap].subtitle}</Typography>  
              </Box>
              <Box sx={styles.menu}>
                {(gameData.map.scene_visible || userData.type === 'gm') && gameData.maps[currentMap].active_scene && 
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
          </Box>
          <Box width='300px' height='100%' padding={'30px'} position='relative' zIndex={999998}>
            {(gameData.map.scene_visible || userData.type === 'gm') && isSceneOpen && <Box style={{backgroundColor: 'rgba(0,0,0,0.4)', overflowY: 'auto'}} width='100%' height='100%' id='chat'>
              <Box flex={1} display='flex' flexDirection='column' padding='20px' minHeight='100%' justifyContent={'flex-end'} gap={'20px'}>
              {messages.map((item, index) => {
                const dices = item.result ? item.result.split(',') : []
                return (
                  <Box key={index} bgcolor='#000' padding='20px' textAlign={'center'} style={{border: index === messages.length - 1 ? 'solid 2px #1d981d' : ''}}>
                    {item.date !== undefined && <Typography textAlign='center' marginTop={'-5px'} marginBottom={'5px'} color='rgba(255,255,255,0.2)' fontWeight={500} fontSize={'0.6rem'}>{item.date}</Typography>}
                    {item.token !== undefined && <Typography color='#FFF' fontWeight={700} fontSize={'1rem'}>{item.token}</Typography>}
                    {item.message !== undefined && <Typography color='#FFF' fontWeight={500} fontSize={'0.8rem'}>{item.message}</Typography>}
                    {dices && <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'} gap={'10px'} marginTop={'15px'} paddingTop={'20px'} borderTop={'solid 1px #FFF'}>
                      {dices.map((item, index) => {
                        item = item.split('|')
                        let max = item[0].replace('d','')
                        return (
                          <Box key={index} color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'30px'} textAlign={'center'}>
                            <Typography textAlign={'center'} color={item[1] == max ? '#23ba23' : (item[1] == 1 ? 'red' : 'white')}>{item[1]}</Typography>
                            <Typography fontSize={'0.8rem'}>{item[0]}</Typography>
                          </Box>
                        )
                      })}  
                    </Box>}
                    
                  </Box>
                )
              })}
              </Box>
            </Box>}
          </Box>
        </Box>
        {(gameData.map.scene_visible || userData.type === 'gm') && gameData.maps[currentMap].active_scene && <SaModal getCanvasOpen={(open: boolean) => {setIsCanvasOpen(open)}} doom={gameData.map.doom_enabled && gameData.map.doom} isOpen={isSceneOpen} getIsOpen={setIsSceneOpen} bg={`/scenes/${currentMap}_${gameData.maps[currentMap].active_scene}.webp`} title={gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].name} size={gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].size}>
          {gameData.map && gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].effect && renderVideo(`/effects/${gameData.maps[currentMap].scenes[gameData.maps[currentMap].active_scene].effect}.webm`, videoRef2)}
          {gameData.map && gameData.map.night_scene && <Box position='absolute' top={0} left={0} width={'100%'} height={'100%'} bgcolor='rgb(0 39 255 / 60%)' style={{mixBlendMode: 'darken'}}/>}
        </SaModal>}
        <SaModalBasic isOpen={isSheetOpen} getIsOpen={setIsSheetOpen}>
          <FormFicha afterSave={() => setIsSheetOpen(false)}/>
        </SaModalBasic>
        <SaModalBasic key={'opt'} isOpen={isOptionsOpen} getIsOpen={setIsOptionsOpen}>
          <FormOptions afterSave={() => setIsOptionsOpen(false)}/>
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