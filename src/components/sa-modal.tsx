'use client'

import { Modal, Box, Typography } from "@mui/material"
import theme from "@/app/theme"
import SaIcon from "./sa-icon"
import Image from "next/image"
import { useApp } from "@/context/app-context"
import { useEffect, useRef, useState } from "react"
import SaButton from "./sa-button"
import SaImageWithFallback from "./sa-image-with-fallback"

type saModalProps = {
  children: React.ReactNode,
  isOpen?: boolean,
  bg: string,
  size: number,
  title: string,
  doom?: string,
  getCanvasOpen: (open: boolean) => void,
  getIsOpen?: (value: boolean) => void
}

type diceTypes = {
  d4: number, d6: number, d8: number, d10: number, d12: number
}

const SaModal = (props: saModalProps) => {
  const {windowSize, userData, sendMessage, tokens, gameData, userCurrentToken, updateToken} = useApp()
  const [sceneTokens, setSceneTokens] = useState<any[]>([false])
  const [availableTokens, setAvailableTokens] = useState<any[]>([])
  const [dices, setDices] = useState<any>({d4: 1, d6: 0, d8: 0, d10: 0, d12: 0})
  const places = Array.from(Array(props.size).keys())

  useEffect(() => {
    define_dices(dices.d4+'d4+'+dices.d6+'d6+'+dices.d8+'d8+'+dices.d10+'d10+'+dices.d12+'d12')
  }, [dices])

  const dropToken = (slug: string, index: string) => {
    if (updateToken && !isNaN(parseInt(index))) updateToken({position: parseInt(index), scene: gameData.map.current + '_' + gameData.maps[gameData.map.current].active_scene}, slug)
  }

  const handleClose = () => {
    if (props.getIsOpen !== undefined) props.getIsOpen(false)
  };

  const renderToken = (token: any, index: string, width = '') => {
    return (
      <Box width={width ? width : '15%'} sx={{aspectRatio: '1/1', ...styles.cardContainer}} key={index+'t'} >
        <Box width={'100%'} height='100%' style={styles.card}>
          <SaImageWithFallback
            className={(userData.type === 'gm' || token.slug === userCurrentToken) ? 'draggable' : ''} 
            fallback={`/tokens/default.png`} 
            src={`/tokens/${token.slug}.png`} 
            alt='' 
            width={500} 
            height={500} 
            style={{width: '100%', height: '100%', cursor: 'pointer'}}
            onDragStart={(event) => {
              if ((userData.type === 'gm' || token.slug === userCurrentToken)){
                event.dataTransfer.setData('text/plain', token.slug)
              }
              else{
                event.preventDefault()
              }
            }}
          />
        </Box>
      </Box>
    )
  }

  useEffect(() => {
    if (!dbox){
      dice_initialize(document.getElementById('roll'))
    }

    const diceResultEvent = (e: any) => {
      if (sendMessage){
        sendMessage(e.detail.message)
      }

      setTimeout(() => {
        props.getCanvasOpen(false)
      },1000)
    }

    const diceStartedEvent = () => {
      props.getCanvasOpen(true)
    }

    addEventListener('dice_result', diceResultEvent)
    addEventListener('dice_roll', diceStartedEvent)

    return () => {
      removeEventListener('dice_result', diceResultEvent)
      removeEventListener('dice_roll', diceStartedEvent)
    }
  }, [])

  useEffect(() => {
    if (tokens && userCurrentToken && userData){
      const scene_key = gameData.map.current + '_' + gameData.maps[gameData.map.current].active_scene

      setSceneTokens(Object.values(tokens).filter((token: any, idx) => token.position !== undefined && token.scene !== undefined && token.scene === scene_key))
      setAvailableTokens(Object.values(tokens).filter((token: any, idx) => {
        return (userData.type === 'gm' && ((token.position === undefined || token.position < 0 || token.position > places.length - 1)))
        || 
        (token.slug === userCurrentToken && (token.position === undefined || token.position < 0 || token.position > places.length - 1))
      }))
    }
  }, [tokens, gameData])

  useEffect(() => {
    document.querySelectorAll('.droptarget').forEach(item => {
      item.addEventListener('dragover', event => {
        event.preventDefault()
      })

      item.addEventListener('dragleave', event => {
        item.classList.remove('hover')
      })
      item.addEventListener('dragenter', event => {
        item.classList.add('hover')
      })
      
      item.addEventListener('drop', event => {
        
      })
    })
  }, [availableTokens])

  return (
    <>
      <Modal
        open={props.isOpen ?? false}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={styles.container}>
          <Image src={props.bg} alt='' width={windowSize?.width} height={windowSize?.height} style={{width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
          {props.children}
          <Box position='absolute' top='20px' left='0' display='flex' justifyContent='flex-start' paddingLeft='20px' alignItems='center' width={'100%'} flexDirection='column'>
            <Typography color="#FFF" textAlign='left' variant="h5" component='h2' style={{textShadow: '2px -2px 5px #000'}} alignSelf='flex-start' >{props.title}</Typography>
            {props.doom && <Box display='flex' gap='5px' justifyContent='flex-start' alignSelf='flex-start'>
              {props.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
            </Box>}
          </Box>
          <Box display='flex' flexDirection='row' position='absolute' left='0' top='0' width='100%' height='100%'>
            <Box flex={1} display='flex' flexDirection='column'>
              {tokens && gameData && places.map((item: number, index: number) => {
                return (
                  <Box aria-valuenow={index} flex={1} display='flex' gap='20px' justifyContent='center' alignItems='center' key={index} position='relative' className="droptarget" onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
                    {sceneTokens.filter((token, idx) => token.position === index).map((token, idx) => {
                      return renderToken(token, index+'_'+idx)
                    })}
                    {index < places.length - 1 && <Box position='absolute' bottom={0} left={0} width='100%' style={{backgroundColor: 'rgba(0,0,0,0.4)'}} height='5px' key={index+'s'}></Box>}
                  </Box>
                )
              }) }
            </Box>
            <Box aria-valuenow={-1} className="droptarget" paddingTop='80px' paddingBottom='80px' display='flex' width='150px' flexDirection='column' justifyContent='center' alignItems='center' position='relative' style={{backgroundColor: 'rgba(0,0,0,0.4)', overflowY: 'auto'}} onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {console.log(event); event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
              {availableTokens.map((token, idx) => {
                return renderToken(token, 'av_'+idx, '60%')
              })}
            </Box>
          </Box>
          
          <Box display='flex' justifyContent='flex-end' position='absolute' top='20px' right='20px' bgcolor='rgba(0,0,0,0.4)' >
            <SaIcon name="cross" size={45} theme="paper" onClick={handleClose} />
          </Box>
          {userData && <Box position='fixed' zIndex={99999} padding='10px' left={'50%'} marginLeft={'-75px'} bottom={0} display='flex' justifyContent={'center'} alignItems='center' gap='15px' style={{transform: 'translateX(-50%)'}} bgcolor='rgba(0,0,0,0.4)'>
            <input type="text" style={{visibility: 'hidden', position: 'absolute', zIndex: -1}} name="dice_result" id="dice_result"/>
            {['d4','d6','d8','d10','d12'].map((item: any, index) => <Box display={'flex'} justifyContent={'space-between'}  key={index}>
              <button style={styles.diceButton} onClick={() => { if (dices[item] > 0) setDices({...dices, [item]: dices[item] - 1}) }}>-</button>
              <input type="text" readOnly name={item} value={dices[item] + ' ' + item} style={styles.diceInput} />
              <button style={styles.diceButton} onClick={() => { if (dices[item] < 10) setDices({...dices, [item]: dices[item] + 1}) }}>+</button>
            </Box>)}
            <button onClick={() => {document.getElementById('roll')?.click()}} style={{...styles.diceButton, padding: '6px 20px', fontSize: '0.8rem' }}>Rolar</button>
          </Box>}
        </Box>
      </Modal>
    </>
  )
}

const styles = {
  container: {
    position: 'absolute',
    border: '0',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: '0px 0px 21px 0px rgba(16, 24, 40, 0.13)',
    height: '92vh',
    width: '1200px',
    maxWidth: '85%',
    overflow: 'hidden'
  },
  cardContainer: {
    animation: 'float 6s ease-in-out infinite',
    marginTop: '15px',
    transition: '300ms',
    '&:hover':{
      opacity: 0.8
    }
  },
  card: {
    transform: 'rotate3d(1, 2, -1, 19deg)',
    perspective: '1000px',
    transition: 'all .6s ease',
    animation: 'shadeanm 6s ease-in-out infinite'
  },
  diceButton: {
    color: '#FFF', backgroundColor: '#000', outline: 'none', border: 'none', minWidth: '30px', fontSize: '1.2rem', cursor: 'pointer'
  },
  diceInput: {width: '80px', outline: 'none', border: 'none', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.6)', textAlign: 'center', paddingBottom: '5px', paddingTop: '7px', fontSize: '0.8rem'}
}

export default SaModal