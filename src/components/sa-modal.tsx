'use client'

import { Modal, Box, Typography } from "@mui/material"
import theme from "@/app/theme"
import SaIcon from "./sa-icon"
import Image from "next/image"
import { useApp } from "@/context/app-context"
import { useEffect, useRef, useState } from "react"
import SaButton from "./sa-button"
import SaImageWithFallback from "./sa-image-with-fallback"
import SaMenu from "./sa-menu"

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
  const {windowSize, userData, sendMessage, tokens, gameData, userCurrentToken, updateToken, changeCurrentToken, setIsSheetOpen, userTokenData} = useApp()
  const [sceneTokens, setSceneTokens] = useState<any[]>([false])
  const [availableTokens, setAvailableTokens] = useState<any[]>([])
  const [activeTokenMenu, setActiveTokenMenu] = useState('')
  const [dices, setDices] = useState<any>({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0})
  const [messageToSend, setMessageToSend] = useState<{token: any, message: string, dices: any}>()
  const [nextActions, setNextActions] = useState()
  const [send, setSend] = useState<string>()
  const places = Array.from(Array(props.size).keys())

  useEffect(() => {
    if (send){
      if (sendMessage){
        if (messageToSend){
          sendMessage(messageToSend.token, messageToSend.message, messageToSend.dices, send)
  
          setMessageToSend(undefined)
        }
        else{
          sendMessage(userTokenData.name, 'Rolou dados', null, send)
        }
        
      }

      setSend(undefined)
    }
  }, [send])

  useEffect(() => {
    define_dices(dices.d4+'d4+'+dices.d6+'d6+'+dices.d8+'d8+'+dices.d10+'d10+'+dices.d12+'d12')
  }, [dices])

  const dropToken = (slug: string, index: string) => {
    if (updateToken && !isNaN(parseInt(index))) updateToken({position: parseInt(index), scene: gameData.map.current + '_' + gameData.maps[gameData.map.current].active_scene}, slug)
  }

  const handleClose = () => {
    if (props.getIsOpen !== undefined) props.getIsOpen(false)
  };

  const diceResultEvent = (e: any) => {
    if (e.detail.message){
      setSend(e.detail.message)
    }
    
    setTimeout(() => {
      props.getCanvasOpen(false)
    },1000)
    
  }

  const renderToken = (token: any, index: string, width = '') => {
    let tokenComp: any = {
      d4: 0,
      d6: 0,
      d8: 0,
      d10: 0,
      d12: 0
    }

    if (token.stress){
      if (token.stress.body) tokenComp[token.stress.body] += 1
      if (token.stress.mind) tokenComp[token.stress.mind] += 1
    }

    if (token.complications) {
      token.complications.forEach((item: any) => {
        const splitted = item.split('|')

        if (splitted.length > 1){
          tokenComp[splitted[1]] += 1
        }
      })
    }

    const editSheet = () => {
      if (changeCurrentToken) changeCurrentToken(token.slug)
        
      setActiveTokenMenu('')

      if (setIsSheetOpen) setIsSheetOpen(true)
    }

    const atk = (slug: string, type: 'close' | 'ranged' ) => {
      let dados: any = getcomps(slug)
      let splitted: string[]

      const partners = sceneTokens.filter((item) => item.type === userTokenData.type && item.position === userTokenData.position && item.slug !== userCurrentToken)

      if (userTokenData){
        if (userTokenData.attr && userTokenData.attr.atk) dados[userTokenData.attr.atk] += 1
        if (userTokenData.type !== 'monster' && userTokenData.attr && userTokenData.attr.pow) dados[userTokenData.attr.pow] += 1
        if (userTokenData.bonus && userTokenData.bonus.atk1) dados[userTokenData.bonus.atk1] += 1
        if (userTokenData.bonus && userTokenData.bonus.atk2) dados[userTokenData.bonus.atk2] += 1

        if (userTokenData.type === 'monster'){
          const doom = gameData.map.doom.split(',')

          if (doom){
            doom.forEach((item: any) => {
              dados[item] += 1
            })
          }
        }
        else{
          if (partners.length === 0 && userTokenData.combat && userTokenData.combat.solo) dados[userTokenData.combat.solo] += 1
          if (partners.length === 1 && userTokenData.combat && userTokenData.combat.partner) dados[userTokenData.combat.partner] += 1
          if (partners.length > 1 && userTokenData.combat && userTokenData.combat.group) dados[userTokenData.combat.group] += 1
        }

        if (type === 'ranged' && userTokenData.equips && userTokenData.equips[0]) {
          splitted = userTokenData.equips[0].split('|')
          if (splitted.length > 1){
            dados[splitted[1]] += 1
          }
        }

        if (type === 'close' && userTokenData.equips && userTokenData.equips[1]) {
          splitted = userTokenData.equips[1].split('|')
          if (splitted.length > 1){
            dados[splitted[1]] += 1
          }
        }
      }

      const message = 'Atacou '+tokens[slug].name+' ('+(type === 'close' ? 'Corpo à corpo' : 'Longa distância')+')'


      setMessageToSend({token: userTokenData.name, message: message, dices: dados})
      setDices({d4: dados.d4, d6: dados.d6, d8: dados.d8, d10: dados.d10, d12: dados.d12})
      setActiveTokenMenu('');

      (async() => {
        setTimeout(function(){
          document.getElementById('roll')?.click()
        },500)
      })()
      
    }

    const def = (slug: string) => {
      let dados:any = getcomps(slug)

      const partners = sceneTokens.filter((item) => item.type === userTokenData.type && item.position === userTokenData.position && item.slug !== userCurrentToken)

      if (userTokenData){
        if (userTokenData.attr && userTokenData.attr.def) dados[userTokenData.attr.def] += 1
        if (userTokenData.type !== 'monster' && userTokenData.attr && userTokenData.attr.pow) dados[userTokenData.attr.pow] += 1
        if (userTokenData.bonus && userTokenData.bonus.def1) dados[userTokenData.bonus.def1] += 1
        if (userTokenData.bonus && userTokenData.bonus.def2) dados[userTokenData.bonus.def2] += 1
        if (userTokenData.type === 'monster'){
          const doom = gameData.map.doom.split(',')

          if (doom){
            doom.forEach((item: any) => {
              dados[item] += 1
            })
          }
        }
        else{
          if (partners.length === 0 && userTokenData.combat && userTokenData.combat.solo) dados[userTokenData.combat.solo] += 1
          if (partners.length === 1 && userTokenData.combat && userTokenData.combat.partner) dados[userTokenData.combat.partner] += 1
          if (partners.length > 1 && userTokenData.combat && userTokenData.combat.group) dados[userTokenData.combat.group] += 1
        }

        if (userTokenData.equips && userTokenData.equips[2]) {
          let splitted = userTokenData.equips[1].split('|')
          if (splitted.length > 1){
            dados[splitted[1]] += 1
          }
        }
      }

      const message = 'Defendeu-se de '+tokens[slug].name

      setMessageToSend({token: userTokenData.name, message: message, dices: dados})
      setDices({d4: dados.d4, d6: dados.d6, d8: dados.d8, d10: dados.d10, d12: dados.d12})
      setActiveTokenMenu('');

      (async() => {
        setTimeout(function(){
          document.getElementById('roll')?.click()
        },500)
      })()
    }

    const getcomps = (slug: string) => {
      let dados: any = {
        d4: 0,
        d6: 0,
        d8: 0,
        d10: 0,
        d12: 0,
      }

      if (tokens){
        
        if (tokens[slug].complications){
          tokens[slug].complications.forEach((item: any) => {
            const splitted = item.split('|')
    
            if (splitted.length > 1){
              dados[splitted[1]] += 1
            }
          })
        }

        if (tokens[slug].stress){
          if (tokens[slug].stress.body) dados[tokens[slug].stress.body] += 1
          if (tokens[slug].stress.mind) dados[tokens[slug].stress.mind] += 1
        }
      }

      return dados;
    }

    let menuOptions: any = []

    if (width === ''){

      if (token.slug !== userCurrentToken && token.type !== userTokenData.type){
        menuOptions = [
          {action: () => {def(token.slug)}, text: 'Defender-se'},
        ]

        if (userCurrentToken.position != token.position){
          menuOptions.push({action: () => {atk(token.slug, 'ranged')}, text: 'À Distância'})
        }
        else{
          menuOptions.push({action: () => {atk(token.slug, 'close')}, text: 'Corpo a corpo'})
        }
      }
    }
    
    if (token.slug === userCurrentToken || userData.type === 'gm'){
      menuOptions.push({action: editSheet, text: 'Editar Ficha'})
    }

    if (userData.type === 'gm' && token.slug !== userCurrentToken){
      menuOptions.push({action: () => {if (changeCurrentToken) changeCurrentToken(token.slug); setActiveTokenMenu('') }, text: 'Usar Token'})
    }

    return (
      <Box width={width ? width : '15%'} sx={[{aspectRatio: '1/1', zIndex: activeTokenMenu === token.slug ? 10 : 1 , ...styles.cardContainer}, width !== '' ? styles.cardNormal : {}]} key={index+'t'} onContextMenu={(event) => {event.preventDefault(); setActiveTokenMenu(token.slug)}} onClick={(event) => {event.stopPropagation()}}>
        <Box width={'100%'} height='100%' sx={[styles.card, width !== '' ? styles.cardNormal : {}, token.slug === userCurrentToken ? styles.cardSelected : {}]}>
          <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} left={'-1.6rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {tokenComp.d4 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d4}</b> d4</Typography>}
            {tokenComp.d6 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d6}</b> d6</Typography>}
            {tokenComp.d8 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d8}</b> d8</Typography>}
            {tokenComp.d10 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d10}</b> d10</Typography>}
            {tokenComp.d12 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d12}</b> d12</Typography>}
          </Box>
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
          {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr && <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} right={'-1.6rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {token.attr.atk !== '' && <Typography sx={styles.attribute}><b>PF</b>{token.attr.atk}</Typography>}
            {token.attr.def !== '' && <Typography sx={styles.attribute}><b>RF</b>{token.attr.def}</Typography>}
            {token.attr.pow !== '' && <Typography sx={styles.attribute}><b>VA</b>{token.attr.pow}</Typography>}
            {token.attr.pp !== undefined && <Typography sx={[styles.attribute, {backgroundColor: '#0f4dbc'}]}><b>PP</b>{token.attr.pp}</Typography>}
          </Box>}
          {menuOptions && <SaMenu
            position={width !== '' ? 'center' : 'left'}
            visible={activeTokenMenu === token.slug}
            items={menuOptions}
          />}
        </Box>
      </Box>
    )
  }

  useEffect(() => {
    if (!dbox){
      dice_initialize(document.getElementById('roll'))
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
        (token.type === 'player' && (token.position === undefined || token.position < 0 || token.position > places.length - 1))
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
        <Box sx={styles.container} onClick={() => {setActiveTokenMenu('')}}>
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
                  <Box aria-valuenow={index} flex={1} display='flex' gap='60px' justifyContent='center' alignItems='center' key={index} position='relative' className="droptarget" onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
                    {sceneTokens.filter((token, idx) => token.position === index).map((token, idx) => {
                      return renderToken(token, index+'_'+idx)
                    })}
                    {index < places.length - 1 && <Box position='absolute' bottom={0} left={0} width='100%' style={{backgroundColor: 'rgba(0,0,0,0.4)'}} height='5px' key={index+'s'}></Box>}
                  </Box>
                )
              }) }
            </Box>
            <Box height={'100%'} width='150px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
              <Box height={'100%'} style={{overflowY: 'auto', overflowX: 'hidden'}} >
                <Box gap={'20px'} minHeight={1} aria-valuenow={-1} flex={1} className="droptarget" paddingTop='80px' paddingBottom='80px' display='flex' flexDirection='column' justifyContent='center' alignItems='center' position='relative' onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
                  {availableTokens.map((token, idx) => {
                    return renderToken(token, 'av_'+idx, '60%')
                  })}
                </Box>
              </Box>
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
            <button onClick={() => {setDices({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0})}} style={{...styles.diceButton, padding: '8px 15px', fontSize: '0.8rem' }}>Limpar</button>
            <button onClick={() => {document.getElementById('roll')?.click()}} style={{...styles.diceButton, padding: '8px 15px', fontSize: '0.8rem' }}>Rolar</button>
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
    left: '30px',
    transform: 'translateY(-50%)',
    outline: 'none',
    boxShadow: '0px 0px 21px 0px rgba(16, 24, 40, 0.13)',
    height: 'calc(100vh - 60px)',
    width: 'calc(100vw - 330px)',
  },
  cardContainer: {
    animation: 'float 6s ease-in-out infinite',
    marginTop: '15px',
    maxWidth: '150px',
    transition: '300ms'
  },
  card: {
    transform: 'rotate3d(1, 2, -1, 19deg)',
    perspective: '1000px',
    transition: 'all .6s ease',
    animation: 'shadeanm 6s ease-in-out infinite',
    position: 'relative'
  },
  cardSelected: {
    '& img': {
      boxSizing: 'initial',
      marginLeft: '-5px',
      marginTop: '-5px',
      border: 'solid 5px #ffc107'
    }
  },
  cardNormal: {
    animation: 'none',
    transform: 'none',
  },
  diceButton: {
    color: '#FFF', backgroundColor: '#000', outline: 'none', border: 'none', minWidth: '30px', fontSize: '1.2rem', cursor: 'pointer'
  },
  complication: {
    color: '#FFF',
    backgroundColor: 'red',
    minWidth: '2.2rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.2rem',
    '& b':{
      fontWeight: '700',
      fontSize: '1rem',
    }
  },
  attribute: {
    color: '#FFF',
    backgroundColor: '#000',
    minWidth: '2.2rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.2rem',
    '& b':{
      fontWeight: '700',
      fontSize: '0.8rem',
    }
  },
  diceInput: {width: '45px', outline: 'none', border: 'none', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.6)', textAlign: 'center', paddingBottom: '5px', paddingTop: '7px', fontSize: '0.8rem'}
}

export default SaModal