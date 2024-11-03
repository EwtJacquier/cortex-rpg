'use client'

import { Modal, Box, Typography, alpha } from "@mui/material"
import theme from "@/app/theme"
import SaIcon from "./sa-icon"
import Image from "next/image"
import { useApp } from "@/context/app-context"
import { useCallback, useEffect, useRef, useState } from "react"
import SaButton from "./sa-button"
import SaImageWithFallback from "./sa-image-with-fallback"
import SaMenu from "./sa-menu"
import zIndex from "@mui/material/styles/zIndex"

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
  const {windowSize, userData, sendMessage, duplicateMonsterToken, tokens, addPP, subtractPP, setAttr, deleteToken, gameData, userCurrentToken, updateToken, changeCurrentToken, setIsSheetOpen, userTokenData, messages} = useApp()
  const [sceneTokens, setSceneTokens] = useState<any[]>([false])
  const [availableTokens, setAvailableTokens] = useState<any[]>([])
  const [activeTokenMenu, setActiveTokenMenu] = useState('')
  const [dices, setDices] = useState<any>({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0})
  const [messageToSend, setMessageToSend] = useState<{token: any, message: string, dices: any, target: any}>()
  const [nextActions, setNextActions] = useState()
  const [send, setSend] = useState<string>()
  const [isTypeboxOpen, setIsTypeboxOpen] = useState(false);
  const [wordToType, setWordToType] = useState('');
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [typeboxTimer, setTypeboxTimer] = useState<any>();
  const [typeboxAvailableTime, setTypeboxAvailableTime] = useState(0);
  const [SFX, setSFX] = useState<any[]>([]);
  const places = Array.from(Array(props.size).keys())
  const [audioContext, setAudioContext] = useState(new window.AudioContext());
  const [audioFiles, setAudioFiles] = useState([ "keyboard.mp3", 'error.mp3', 'success.mp3', 'critical.mp3', 'hit.mp3' ]);

  const generateRandomLetter = (dflevel: number) => {
    let alphabet = '⇦⇨⇧⇩'; // Easy
    
    if (dflevel > 3)  {
      alphabet = '⇦⇨⇧⇩fdbzykx!@#$%+';
    } else if (dflevel >= 2) {
      alphabet = '⇦⇨⇧⇩abcdefgh';
    }
    
    // const alphabet = '⇦⇨⇧⇩abcdefgh'; // Medium
    // const alphabet = '⇦⇨⇧⇩!@#$%+;fdbzykx' // Hard
  
    return alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  const keydownHandler = (e: any) => {
    console.log(e.key);

    if (['Shift','CapsLock','Ctrl','Tab'].indexOf(e.key) > -1){
      return;
    }
    
    let nextChar = wordToType.split('')[typedLetters.length]

    if (wordToType.length > typedLetters.length && nextChar){
      nextChar = nextChar.toLowerCase();
      playAudio(0, 1);

      let pressedKey = e.key;

      if ( e.key.indexOf('Arrow') > -1 ) {
        switch (e.key){
          case 'ArrowRight': pressedKey = '⇨'; break;
          case 'ArrowUp': pressedKey = '⇧'; break;
          case 'ArrowDown': pressedKey = '⇩'; break;
          default: pressedKey = '⇦';
        }
      }
      
      if (pressedKey.toLowerCase() == nextChar){
        setTypedLetters( [
          ...typedLetters,
          pressedKey
        ] );

        playAudio(2, 0.2);
  
        if (wordToType.length === typedLetters.length + 1){
          clearTimeout(typeboxTimer);
          setTypeboxAvailableTime(0);
          clearWord();

          playAudio(3, 0.1);
        }
      }
      else {
        playAudio(1, 1);

        const newTime = typeboxAvailableTime - 2;
      
        clearTimeout(typeboxTimer);
        setTypeboxAvailableTime(newTime > 0 ? newTime : 0);
        
        if (newTime <= 0){
          clearWord();
        }
      }
    }
  }

  const clearWord = () => {
    setIsTypeboxOpen(false);
    clearTimeout(typeboxTimer);
    setWordToType('');
    setTypedLetters([]);
  }

  const playAudio = async ( index : any, gain: number = 1 ) => {
    if ( SFX[ index ] ) {

      const source = audioContext.createBufferSource();

      source.buffer = SFX[ index ]

      if ( gain != 1) {
        var gainNode = audioContext.createGain()

        gainNode.gain.value = gain;

        gainNode.connect(audioContext.destination)

        source.connect(gainNode)
      }
      else {
        source.connect( audioContext.destination );
      }
      
      source.start()
    }
  }

  useEffect(() => {
    if (messages && messages.length > 0 && messages[messages.length - 1].target ) {
      playAudio(4);
      
      let token = document.querySelector('.token__' + messages[messages.length - 1].target + ' > div');

      if (token){
        token.classList.add('hurt');

        setTimeout(function(){
          token.classList.remove('hurt')
        },500);
      }
    }
  }, [messages])

  useEffect(() => {
    (async() => {
      const urls = audioFiles.map( (url) => "/sfx/" + url );

      const data_buffers = await Promise.all(
        urls.map( (url) => fetch( url ).then( (res) => res.arrayBuffer() ) )
      );

      // decode the data
      const audio_buffers = await Promise.all(
        data_buffers.map( (buf) => audioContext.decodeAudioData( buf ) )
      );

      setSFX(audio_buffers);
    })();
  }, [audioFiles])

  useEffect(() => {
    document.addEventListener("keyup", keydownHandler);

    // clean up
    return () => {
      document.removeEventListener("keyup", keydownHandler);
    };
  }, [typedLetters, typeboxTimer]);

  useEffect(() => {
    if (typeboxAvailableTime <= 0) {
      clearTimeout(typeboxTimer);
    }
    else {
      setTypeboxTimer(setTimeout(function(){
        const newTime = typeboxAvailableTime - 1;
        
        setTypeboxAvailableTime(newTime > 0 ? newTime : 0);
        
        if (newTime <= 0){
          clearWord();
        }
      }, 1000));
    }

    return () => clearTimeout(typeboxTimer);
  }, [typeboxAvailableTime])

  useEffect(() => {
    if (isTypeboxOpen) {
      setTypeboxAvailableTime(8);
    }
  }, [isTypeboxOpen])

  useEffect(() => {
    if (send){
      if (sendMessage){
        if (messageToSend){
          sendMessage(messageToSend.token, messageToSend.message, messageToSend.dices, send, messageToSend.target)
  
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
    if (sceneTokens.length > 0 && parseInt(index) > -1){
      const tokensInSamePlace = sceneTokens.filter(function(value, place){
        return value.position === parseInt(index);
      });

      if (tokensInSamePlace.length > 0){
        return;
      }
    }
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

    const atknew = (slug: string, type: 'close' | 'ranged') => {
      const message = 'Atacou '+tokens[slug].name+' ('+(type === 'close' ? 'Corpo à corpo' : 'Longa distância')+')'
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

      setMessageToSend({token: userTokenData.name, message: message, dices: dados, target: slug})
      setDices({d4: dados.d4, d6: dados.d6, d8: dados.d8, d10: dados.d10, d12: dados.d12});

      (async() => {
        setTimeout(function(){
          document.getElementById('roll')?.click()
        },500)
      })()

      setActiveTokenMenu('');

      if (tokens[slug].attr?.df && userTokenData.attr?.dif) {  
        let def = parseInt(tokens[slug].attr?.df)

        let dif_count = 2 + def;

        console.log(userTokenData.attr.dif, def);

        switch (parseInt(userTokenData.attr.dif)){
          case 2: dif_count = 4 + def; break;
          case 3: dif_count = 6 + def; break;
          case 4: dif_count = 8 + def; break;
        }

        console.log(dif_count);

        let newWord = '';
        for (let i = 0; i < dif_count; i++){
          newWord += generateRandomLetter(def);
        }
        clearTimeout(typeboxTimer);
        setWordToType(newWord);
        setTypedLetters([]);
        setTimeout(function() {
          setIsTypeboxOpen(true);
        },500);
      }
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

      setMessageToSend({token: userTokenData.name, message: message, dices: dados, target: slug})
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
          let splitted = userTokenData.equips[2].split('|')
          if (splitted.length > 1){
            dados[splitted[1]] += 1
          }
        }
      }

      const message = 'Defendeu-se de '+tokens[slug].name

      setMessageToSend({token: userTokenData.name, message: message, dices: dados, target: slug})
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

      if (token.slug !== userCurrentToken){
        if (userTokenData.position != token.position){
          menuOptions.push({action: () => {atknew( token.slug, 'ranged' )}, text: 'Atacar (longe)'})
        }
        else{
          menuOptions.push({action: () => {atknew( token.slug, 'close' )}, text: 'Atacar (perto)'})
        }
      }
    }
    
    if (token.slug === userCurrentToken || userData.type === 'gm'){
      menuOptions.push({action: editSheet, text: 'Editar Ficha'})
    }

    if (userData.type === 'gm' || token.slug === userCurrentToken){
      //menuOptions.push({action: () => {if (addPP) addPP(token.slug); setActiveTokenMenu('') }, text: 'Adicionar PP'})
      //menuOptions.push({action: () => {if (subtractPP) subtractPP(token.slug); setActiveTokenMenu('') }, text: 'Remover PP'})
    }

    if (userData.type === 'gm' && token.slug !== userCurrentToken){
      //menuOptions.push({action: () => {if (changeCurrentToken) changeCurrentToken(token.slug); setActiveTokenMenu('') }, text: 'Usar Token'})
    }

    if (userData.type === 'gm' && token.type !== 'player' && duplicateMonsterToken){
      menuOptions.push({action: () => {if (changeCurrentToken) duplicateMonsterToken(token.slug); setActiveTokenMenu('') }, text: 'Duplicar'})
    }

    if (userData.type === 'gm' && token.type !== 'player' && deleteToken){
      menuOptions.push({action: () => {if (changeCurrentToken && confirm(`Confirma exclusão do token "${token.name}" ?`)) deleteToken(token.slug); setActiveTokenMenu('') }, text: 'Excluir'})
    }

    return (
      <Box onDoubleClick={() => { if (userData.type === 'gm' && token.slug !== userCurrentToken && changeCurrentToken) { changeCurrentToken(token.slug); setActiveTokenMenu(''); } }} className={'token__'+token.slug} width={width ? width : '40%'} sx={[{aspectRatio: '1/1', zIndex: activeTokenMenu === token.slug ? 10 : 1 , ...styles.cardContainer}, width !== '' ? styles.cardNormal : {}]} key={index+'t'} onContextMenu={(event) => {event.preventDefault(); setActiveTokenMenu(token.slug)}} onClick={(event) => {event.stopPropagation()}}>
        <Box width={'100%'} height='100%' sx={[styles.card, width !== '' ? styles.cardNormal : {}, token.slug === userCurrentToken ? styles.cardSelected : {}]} className={(userData.type === 'gm' || token.slug === userCurrentToken) ? 'draggable' : ''} >
          <Box className="tokenSFX" sx={[styles.tokenSFX]}></Box>
          <SaImageWithFallback
            fallback={`/tokens/default.png`} 
            src={`/tokens/${token.slug.replace(/_copy/g, "")}.png`} 
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
          <Box className='tokenName' position={'absolute'} display='flex' flexDirection='column' justifyContent='center' alignItems='center' bgcolor='rgba(0,0,0,0.4)' padding='0 1rem 0.2rem 1rem' left={0} bottom={0} width='100%' sx={{opacity: 0, pointerEvents: 'none'}}>
            <Typography textAlign={'center'} fontSize='1rem' color='#FFF' fontWeight={'600'}>{token.name}</Typography>
          </Box>
          <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} left={'-2.7rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.pv && token.attr?.pvmax && <Typography onClick={() => {setAttr('pv',token.slug,prompt(`Modificar PV (Máx: ${token.attr.pvmax})`))}} sx={[styles.attribute, {backgroundColor: '#0e7f0e', cursor: 'pointer'}]}><Image src={`/images/hearts.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.pv}</Typography>}
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.pm && token.attr?.pmmax && <Typography onClick={() => {setAttr('pm',token.slug,prompt(`Modificar PP (Máx: ${token.attr.pmmax})`))}} sx={[styles.attribute, {backgroundColor: '#0f4dbc', cursor: 'pointer'}]}><Image src={`/images/allied-star.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.pm}</Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.pv && token.attr?.pvmax && <Typography sx={[styles.attribute, {backgroundColor: '#0e7f0e'}]}><Image src={`/images/hearts.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{ Math.round((token.attr.pv / token.attr.pvmax) * 100) } %</Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.pm && token.attr?.pmmax && <Typography sx={[styles.attribute, {backgroundColor: '#0f4dbc'}]}><Image src={`/images/allied-star.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /> ?</Typography>}
            {tokenComp.d8 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d8}</b> d8</Typography>}
            {tokenComp.d10 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d10}</b> d10</Typography>}
            {tokenComp.d12 > 0 && <Typography sx={styles.complication}><b>{tokenComp.d12}</b> d12</Typography>}
          </Box>
          {(token.type === 'player' || userData.type === 'gm') && token.attr && <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} right={'-2.7rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {token.attr?.mv && <Typography sx={styles.attribute}><Image src={`/images/footprint.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.mv}</Typography>}
            {token.attr?.al && <Typography sx={styles.attribute}><Image src={`/images/targeted.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.al}</Typography>}
            {token.attr?.df && <Typography sx={styles.attribute}><Image src={`/images/checked-shield.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.df}</Typography>}
            {false && token.attr.pp !== undefined && <Typography sx={[styles.attribute, {backgroundColor: '#0f4dbc'}]}><b>PP</b>{token.attr.pp}</Typography>}
          </Box>}
          {menuOptions.length > 0 && <SaMenu
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
        return (userData.type === 'gm' && ((token.position === undefined || token.position < 0)))
        || 
        (token.type === 'player' && (token.position === undefined || token.position < 0))
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
          {isTypeboxOpen && <Box className="typebox" sx={[styles.typebox]}>
            <Box className="typebox__word" sx={[styles.typeboxWordContainer]}>
              {wordToType.split('').map((item, index) => {
                return (
                  <Typography key={index} sx={[styles.typeboxChar, typedLetters[index] && typedLetters[index].toUpperCase() === item.toUpperCase() ? styles.typeboxCharPressed : {}]} color="#FFF" textAlign='center' variant="body1" fontSize='50px'>{item}</Typography>
                )
              })}
            </Box>
            <Box className="typebox__timer" sx={[styles.typeboxTimer]}>{typeboxAvailableTime}</Box>
          </Box>}
          <Image src={props.bg} alt='' width={windowSize?.width} height={windowSize?.height} style={{width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
          {props.children}
          <Box position='absolute' top='20px' left='0' display='flex' justifyContent='flex-start' paddingLeft='20px' alignItems='center' width={'100%'} flexDirection='column'>
            <Typography color="#FFF" textAlign='left' variant="h5" component='h2' style={{textShadow: '2px -2px 5px #000'}} alignSelf='flex-start' >{props.title}</Typography>
            {props.doom && <Box display='flex' gap='5px' justifyContent='flex-start' alignSelf='flex-start'>
              {props.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
            </Box>}
          </Box>
          <Box display='flex' flexDirection='row' position='absolute' left='0' top='0' width='100%' height='100%'>
            <Box width={'100%'}>
              <Box sx={[styles.battleGrid]}>
                {tokens && gameData && Array.from(Array(25).keys()).map((item: number, index: number) => {
                  return (
                    <Box aria-valuenow={index} border='solid 2px rgba(0,0,0,0.2)' sx={[{backgroundColor: 'rgba(0,0,0,0.2)'}]} display='flex' gap='60px' justifyContent='center' alignItems='center' key={index} position='relative' className="droptarget" onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
                      {sceneTokens.filter((token, idx) => token.position === index).map((token, idx) => {
                        return renderToken(token, index+'_'+idx)
                      })}
                    </Box>
                  )
                }) }
              </Box>
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
    transition: '300ms',
    outline: 'solid 5px transparent'
  },
  card: {
    transform: 'rotate3d(1, 2, -1, 19deg)',
    perspective: '1000px',
    transition: 'all .6s ease',
    animation: 'shadeanm 6s ease-in-out infinite',
    position: 'relative',
    '&:hover .tokenName': {opacity: 1}
  },
  cardSelected: {
    '& > img': {
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
    gap: '0 0.3rem',
    '& b':{
      fontWeight: '700',
      fontSize: '0.8rem',
    }
  },
  typebox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 2
  },
  typeboxWordContainer: {
    backgroundColor: '#000',
    width: '100%',
    top: '50%',
    left: 0,
    transform: 'translateY(-50%)',
    padding: 10,
    textAlign: 'center',
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    gap: '5px'
  },
  typeboxTimer: {
    position: 'absolute',
    bottom: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#FFF',
    fontSize: '50px',
    padding: '10px 0',
    width: 80,
    textAlign: 'center',
    zIndex: 3,
    backgroundColor: '#000',
  },
  typeboxChar: {
    width: '60px',
    padding: '0 5px',
    textAlign: 'center',
    border: 'solid 3px #FFF',
    textTransform: 'uppercase'
  },
  typeboxCharPressed: {
    border: 'solid 3px #ffc107',
    color: '#ffc107'
  },
  tokenSFX: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1
  },
  battleGrid: {
    display: 'grid',
    height: '100%',
    width: '100%',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridTemplateRows: 'repeat(5, 1fr)'
  },
  diceInput: {width: '45px', outline: 'none', border: 'none', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.6)', textAlign: 'center', paddingBottom: '5px', paddingTop: '7px', fontSize: '0.8rem'}
}

export default SaModal