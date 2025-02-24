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
import SaImageWithFallback from "../components/sa-image-with-fallback"

const HomeContent = () => {
  const [isSceneOpen, setIsSceneOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isCanvasOpen, setIsCanvasOpen] = useState(false)
  const [currentMap, setCurrentMap] = useState('')
  const videoRef = useRef<any>()
  const videoRef2 = useRef<any>()
  const {windowSize, gameData, userData, tokens, isSheetOpen, setIsSheetOpen, isCardsOpen, setIsCardsOpen, messages} = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!userData){
      router.push('/')
    }
  },[router])

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
  
        if (el) el.scrollTop = 0;
      },500)
    }
  }, [messages, isSceneOpen])

  return (
    <>
      {windowSize && <div id='canvas' style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: isCanvasOpen ? 9999999 : -1}}></div>}
      {gameData && currentMap && <>
        <Box width='100%' height='100vh' display='flex' justifyContent='space-between' flexDirection={'row'} alignItems={'flex-start'} overflow={'hidden'}>
          <Box width='calc(100% - 240px)' height='100vh' position='relative' overflow='visible'>
            <Box width='100vw' height='100vh' position='relative' overflow='visible'>
              {gameData.map && currentMap && <Image src={`/scenes/${currentMap}.webp`} alt='' width={windowSize?.width} height={windowSize?.height} style={{width: '100%', height: '100%', objectFit:'cover', pointerEvents: 'none' }}/>}
              {gameData.map && gameData.maps[currentMap].effect && renderVideo(`/effects/${gameData.maps[currentMap].effect}.webm`, videoRef)}
              {gameData.map && gameData.maps[currentMap].night && <Box position='absolute' top={0} left={0} width={windowSize?.width} height={windowSize?.height} bgcolor='rgb(0 14 149 / 86%)' style={{mixBlendMode: 'multiply'}}/>}
              <Box sx={styles.title}>
                {gameData.map.doom_enabled && <Box display='flex' gap='5px' justifyContent='center' marginBottom='5px'>
                  {gameData.map.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
                </Box>}
                {!isSceneOpen && <Typography variant="h1" color='#FFF' component="h1">{gameData.maps[currentMap].title}</Typography>}
                {!isSceneOpen && <Typography color='#FFF' fontSize={'1.2rem'}>{gameData.maps[currentMap].subtitle}</Typography>}
              </Box>
              <Box sx={[styles.menu, isSceneOpen ? styles.menuItemBlack : {}]}>
                {isSceneOpen && 
                <Box onClick={() => {setIsCardsOpen(!isCardsOpen) }} sx={[styles.menuItem]}>
                  <SaIcon name='user-card' theme='paper' size={30} style={styles.menuItemIcon} hover={isCardsOpen}  />
                </Box>}
                {isSceneOpen && userData && <Box onClick={() => {setIsSheetOpen(!isSheetOpen)}} sx={[styles.menuItem]}>
                  <SaIcon name='document' theme='paper' size={30} style={styles.menuItemIcon} hover={isSheetOpen} />
                </Box>}
                {( userData.type === 'gm') &&
                <Box onClick={() => {if (!isSceneOpen) setIsSheetOpen(false); setIsSceneOpen(!isSceneOpen) }} sx={[styles.menuItem]}>
                  <SaIcon name='map' theme='paper' size={30} style={styles.menuItemIcon} hover={isSceneOpen} />
                </Box>}
                {userData && userData.type === 'gm' && <Box onClick={() => {setIsOptionsOpen(!isOptionsOpen)}} sx={[styles.menuItem]}>
                  <SaIcon name='zap' theme='paper' size={30} style={styles.menuItemIcon} hover={isOptionsOpen} />
                </Box>}
              </Box>
            </Box>
          </Box>
          {(userData.type === 'gm') && isSceneOpen && <Box width='240px' height='calc(100% - 105px)' marginTop={'105px'} position='relative' zIndex={999998}  bgcolor={'#000'}>
            <Box style={{ overflowY: 'auto'}} width='100%' height='100%' id='chat'>
              <Box flex={1} display='flex' flexDirection='column-reverse' padding='20px' minHeight='100%' justifyContent={'flex-end'} gap={'20px'}>
              {messages.map((item, index) => {
                const dices = item.firstResult ? item.firstResult.split(',') : []
                const dices2 = item.secondResult ? item.secondResult.split(',') : []
                let sum = 0;
                let sum2 = 0;
                let message = item.message == undefined ? '' : item.message;
                message = message.replace('(ação)', '<span class="tag tag-red">A</span>');
                message = message.replace('(suporte)', '<span class="tag tag-blue">S</span>');
                message = message.replace('(reação)', '<span class="tag tag-purple">R</span>');
                let pieces = message.indexOf('\\') > -1 ? message.split('\\') : [message];
                let bonus = 0;
                if (item.bonus && item.shield) {
                  bonus = parseInt(item.bonus) * 3;
                }
                return (
                  <Box key={index} bgcolor='#000' padding='20px' textAlign={'center'} sx={[styles.messages, index === messages.length - 1 ? {border: 'solid 1px #FFF', opacity: '1'} : {}]}>
                    {item.date !== undefined && <Typography textAlign='center' marginTop={'-5px'} marginBottom={'5px'} color='rgba(255,255,255,0.6)' fontWeight={500} fontSize={'0.6rem'}>{item.date}</Typography>}
                    {item.token !== undefined && <Typography color='#ffc107' fontWeight={700} fontSize={'1rem'}>{tokens[item.token].name}</Typography>}
                    {item.token && item.target && <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                    <SaImageWithFallback
                      fallback={`/tokens/default.png`} 
                      src={`/tokens/${item.token.replace(/_copy/g, "")}.png`} 
                      alt='' 
                      width={40} 
                      height={40}
                    />
                    <Typography color='#FFF' fontWeight={700} fontSize={'2rem'}>⇨</Typography>
                    <SaImageWithFallback
                      fallback={`/tokens/default.png`} 
                      src={`/tokens/${item.target.replace(/_copy/g, "")}.png`} 
                      alt='' 
                      width={40} 
                      height={40}
                    />
                    </Box>}
                    {pieces.map((item, index) => {
                      return (
                        <Typography key={'piece_'+index} sx={index > 0 ? [{marginTop: '5px'}] : []} color={index === 0 ? '#ffc107' : '#FFF'} fontWeight={500} fontSize={'0.8rem'} dangerouslySetInnerHTML={{__html: item}}></Typography>
                      )
                    })}
                    {dices && <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'} gap={'10px'} marginTop={'15px'}>
                      {dices.map((item, index) => {
                        item = item.split('|')
                        let max = item[0].replace('d','')
                        if (max == 10 && item[1] == 0){
                          item[1] = 10
                        }
                        sum += parseInt(item[1]);
                        return (
                          <>
                            {index > 0 && <Box key={'plus_'+index} color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>+</Typography></Box>}
                            <Box key={'dice_'+index} color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                              <Typography textAlign={'center'} color={item[1] == max ? '#23ba23' : (item[1] == 1 ? 'red' : 'white')}>{item[1]}</Typography>
                              <Typography fontSize={'0.8rem'}>{item[0]}</Typography>
                            </Box>
                          </>
                        )
                      })}
                      {item.damage && item.damage > 0 && <>
                        {dices.length > 0 && <Box color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>+</Typography></Box>}
                        <Box color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                          <Typography textAlign={'center'} color={'white'}>{item.damage}</Typography>
                          <Typography fontSize={'0.8rem'}>fixo</Typography>
                        </Box>
                      </>}
                      {bonus > 0 && <>
                        <Box color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>+</Typography></Box>
                        <Box color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                          <Typography textAlign={'center'} color={'white'}>{ bonus }</Typography>
                          <Typography fontSize={'0.8rem'}>bonus</Typography>
                        </Box>
                      </>}
                      {(dices.length > 0 || item.damage) && <>
                        <Box color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>=</Typography></Box>
                        <Box alignItems={'center'} justifyContent={'center'} color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                          <Typography textAlign={'center'} color={'#23ba23'}>{sum + parseInt(item.damage ? item.damage : 0) + (bonus > 0 ? bonus : 0)}</Typography>
                          <Typography fontSize={'0.8rem'}>total</Typography>
                        </Box>
                      </>}
                    </Box>}
                    {item.message2 && <Typography sx={[{marginTop: '15px'}]} color={'#FFF'} fontWeight={500} fontSize={'0.8rem'}>{item.message2}</Typography>}
                    {dices2 && <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'} gap={'10px'} marginTop={'15px'}>
                      {dices2.map((item, index) => {
                        item = item.split('|')
                        let max = item[0].replace('d','')
                        if (max == 10 && item[1] == 0){
                          item[1] = 10
                        }
                        sum2 += parseInt(item[1]);
                        return (
                          <>
                            {index > 0 && <Box key={'plus_'+index} color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>+</Typography></Box>}
                            <Box key={'dice_'+index} color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                              <Typography textAlign={'center'} color={item[1] == max ? '#23ba23' : (item[1] == 1 ? 'red' : 'white')}>{item[1]}</Typography>
                              <Typography fontSize={'0.8rem'}>{item[0]}</Typography>
                            </Box>
                          </>
                        )
                      })}
                      {item.damage2 && item.damage2 > 0 && <>
                        {dices.length > 0 && <Box color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>+</Typography></Box>}
                        <Box color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                          <Typography textAlign={'center'} color={'white'}>{item.damage}</Typography>
                          <Typography fontSize={'0.8rem'}>fixo</Typography>
                        </Box>
                      </>}
                      {(dices2.length > 0 || item.damage2) && <>
                        <Box color={'#FFF'} alignSelf='center'><Typography fontSize={'1.2rem'}>=</Typography></Box>
                        <Box alignItems={'center'} justifyContent={'center'} color={'#FFF'} border={'solid 1px rgba(255,255,255,0.2)'} width={'40px'} textAlign={'center'}>
                          <Typography textAlign={'center'} color={'#23ba23'}>{sum2 + parseInt(item.damage2 ? item.damage2 : 0)}</Typography>
                          <Typography fontSize={'0.8rem'}>total</Typography>
                        </Box>
                      </>}
                    </Box>}
                  </Box>
                )
              })}
              </Box>
            </Box>
          </Box>}
        </Box>
        <SaModal getCanvasOpen={(open: boolean) => {setIsCanvasOpen(open)}} doom={gameData.map.doom_enabled && gameData.map.doom} isOpen={isSceneOpen} getIsOpen={setIsSceneOpen}>
          {gameData.map && gameData.map.night_scene && <Box position='absolute' top={0} left={0} width={'100%'} height={'100%'} bgcolor='rgb(0 20 210 / 86%)' style={{mixBlendMode: 'darken'}}/>}
        </SaModal>
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
    padding: '30px 20px',
    width: '240px',
    zIndex: 999999,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '9px'
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
  menuItemBlack: {
    backgroundColor: '#000',
    '& > div': {
      backgroundColor: '#000'
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
  },
  messages: {
    opacity: 0.6,
    transition: 'all 300ms',
    '&:hover': {
      opacity: 1
    }
  }
}

export default HomeContent;