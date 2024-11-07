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
  const {audioContext, audioFiles, windowSize, userData, sendMessage, duplicateMonsterToken, tokens, addPP, subtractPP, setAttr, deleteToken, gameData, userCurrentToken, updateToken, changeCurrentToken, setIsSheetOpen, userTokenData, messages, updateItemQuantity} = useApp()
  const [sceneTokens, setSceneTokens] = useState<any[]>([false])
  const [availableTokens, setAvailableTokens] = useState<any[]>([])
  const [activeTokenMenu, setActiveTokenMenu] = useState('')
  const [dices, setDices] = useState<any>({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0})
  const [messageToSend, setMessageToSend] = useState<{token: any, message: string, dices: any, target: any, damage?: any, bonus?: any, shield?: any, buff?: boolean, item?: boolean}>()
  const [nextActions, setNextActions] = useState()
  const [send, setSend] = useState<string>()
  const [isTypeboxOpen, setIsTypeboxOpen] = useState(false);
  const [wordToType, setWordToType] = useState('');
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [typeboxTimer, setTypeboxTimer] = useState<any>();
  const [typeboxAvailableTime, setTypeboxAvailableTime] = useState(0);
  const [SFX, setSFX] = useState<any[]>([]);
  const [currentTokenSkills, setCurrentTokenSkills] = useState<any>({own: [], target: []});
  const [currentTokenItems, setCurrentTokenItems] = useState<any>({own: [], target: []});
  const places = Array.from(Array(props.size).keys())

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

          setMessageToSend({
            ...messageToSend,
            ...{bonus: userTokenData.attr.dif}
          });
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
    updateCurrentTokenSkillsAndItems();
  }, [userTokenData]);

  useEffect(() => {
    if (messages && messages.length > 0 && messages[messages.length - 1].target ) {
      const is_buff = messages[messages.length - 1].buff;
      
      if (is_buff) {
        playAudio( 5 , 0.5);
      }
      else {
        playAudio( 4 , 0.5);
        setTimeout(function(){
          playAudio( 4 , 0.5);
          setTimeout(function(){
            playAudio( 4 , 0.5);
          },150);
        },150);
      }
      
      let token = document.querySelector('.token__' + messages[messages.length - 1].target + ' > div');

      if (token){
        token.classList.add(is_buff ? 'heal' : 'hurt');

        setTimeout(function(){
          token.classList.remove(is_buff ? 'heal' : 'hurt')
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

      (async() => {
        playAudio(6, 0.5)
        setTimeout(function(){
          document.getElementById('roll')?.click()
        },500)
      })()
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
      setTypeboxAvailableTime(5);
    }
  }, [isTypeboxOpen])

  useEffect(() => {
    if (typeof(send) !== 'undefined'){
      if (sendMessage){
        if (messageToSend){
          sendMessage(messageToSend.token, messageToSend.message, messageToSend.dices, send, messageToSend.target, messageToSend.damage, messageToSend.shield, messageToSend.bonus, messageToSend.buff, messageToSend.item)
  
          setMessageToSend(undefined)
        }
        else{
          sendMessage(userCurrentToken, 'Rolou dados', null, send)
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

  const formatSkills = (skills: any[], consumible = false) => {
    let all_skills = {
      own: [],
      target: []
    };

    skills.forEach(function(value, index){
      const skill = value.split(':::');
      let skill_obj = {};
      let is_own = skill[0].indexOf('proprio') > -1;
      let is_both = skill[0].indexOf('buff') > -1 && skill[0].indexOf('proprio') == -1;

      if (typeof(skill[1]) !== 'undefined'){
        skill.push(-1);
      }

      if ( skill[1] != 0 ) {

        if (skill[0].indexOf('nome=') > -1 && skill[0].indexOf('desc=') > -1 ) {  
          const skill_info = skill[0].split('|');

          skill_info.forEach(function(info, index) {
            info = info.split('=');

            if (info.length > 0){
              skill_obj[info[0]] = info.length == 2 ? info[1] : 1;
            } 
          });

          if (consumible) {
            skill_obj.item = true;
          }

          skill_obj['qtd'] = skill[1];
          skill_obj['index'] = index;
        }          
      }

      if (Object.keys(skill_obj).length > 0) {
        if (is_both || is_own) {
          all_skills.own.push(skill_obj);
        }

        if (is_both || !is_own) {
          all_skills.target.push(skill_obj);
        }
      }
    })

    return all_skills;
  }

  const updateCurrentTokenSkillsAndItems = () => {
    if (userTokenData.macros) {
      setCurrentTokenSkills(formatSkills(userTokenData.macros))
    }

    if (userTokenData.items) {
      console.log(formatSkills(userTokenData.items, true));
      setCurrentTokenItems(formatSkills(userTokenData.items, true));
    }
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

    const sumDicesByString = ( dados: any, value: string ) => {
      const all_dices = value.split('+');

      if (all_dices.length > 0) {
        all_dices.forEach(function(dice, index){
          const dice_split = dice.split('d');

          if (dice_split.length > 0){  
            const qtd = dice_split.length === 1 ? 1 : parseInt(dice_split[0]);
            const diceStr = 'd' + ( dice_split.length === 1 ? dice_split[0] : dice_split[1] );

            dados[diceStr] += qtd;
          }
        })
      }

      return dados;
    }

    const atknew = (slug: string, type: 'close' | 'ranged') => {
      if ( ! userTokenData.attr.damage || ! userTokenData.attr.dices || ! tokens[slug].attr?.df || ! userTokenData.attr?.dif || ! tokens[slug].attr.df ){
        return;
      }

      const message = 'Atacou '+ tokens[slug].name;
      
      let dados: any = {
        d4: 0,
        d6: 0,
        d8: 0,
        d10: 0,
        d12: 0,
        d20: 0
      };

      dados = sumDicesByString(dados, userTokenData.attr.dices);
      
      setMessageToSend({token: userCurrentToken, message: message, dices: dados, target: slug, shield: tokens[slug].attr.df, damage: userTokenData.attr.damage})
      
      setDices(dados);

      setActiveTokenMenu('');
      
      let def = parseInt(tokens[slug].attr?.df)

      let dif_count = 2 + def;

      switch (parseInt(userTokenData.attr.dif)){
        case 2: dif_count = 4 + def; break;
        case 3: dif_count = 6 + def; break;
        case 4: dif_count = 8 + def; break;
      }

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

    const useSkill = (slug : string, skill: any) => {
      if ( ! userTokenData.attr.damage || ! userTokenData.attr.dices || ! tokens[slug].attr?.df || ! userTokenData.attr?.dif || ! tokens[slug].attr.df ){
        return;
      }

      const pp = skill.pp ? ` ( ${skill.pp} PP ) ` : '';
      const desc = skill.desc ? '\\' + skill.desc : '';

      let toSend : any = {
        token: userCurrentToken,
        message: `${skill.nome}${pp}${desc}`,
        target: slug,
        shield: tokens[slug].attr.df,
        damage: 0,
      };
      
      let dados: any = {
        d4: 0,
        d6: 0,
        d8: 0,
        d10: 0,
        d12: 0,
        d20: 0
      };

      if (skill.dados) {
        dados = sumDicesByString(dados, skill.dados);
      } 
      
      if (skill.fixo) {
        toSend['damage'] += parseInt(skill.fixo);
      }

      if (skill.arma) {
        for (let i = 0; i < parseInt(skill.arma); i++) {
          toSend['damage'] += parseInt(userTokenData.attr.damage);
          dados = sumDicesByString(dados, userTokenData.attr.dices);
        }
      }

      if (skill.buff) {
        toSend['buff'] = true;
      }

      if (skill.item) {
        if (skill.qtd > 0 && updateItemQuantity){
          updateItemQuantity( skill.index, parseInt(skill.qtd) - 1 );
        }
        toSend['item'] = true;
      }

      toSend['dices'] = dados;

      setMessageToSend(toSend);

      setDices(dados);

      setActiveTokenMenu('');

      if ( skill.item || skill.buff ) {
        if ( skill.dados ) {
          playAudio(6, 0.5);
          setTimeout(function(){
            document.getElementById('roll')?.click()
          },500)
        }
        else {
          setSend('')
        }
      }
      else if ( skill.arma || skill.fixo || skill.dados ) {
        let def = parseInt(skill.buff ? userTokenData.attr.dif : tokens[slug].attr?.df)

        let dif_count = 2 + def;
  
        switch (parseInt(userTokenData.attr.dif)){
          case 2: dif_count = 4 + def; break;
          case 3: dif_count = 6 + def; break;
          case 4: dif_count = 8 + def; break;
        }
  
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
      else {
        setSend('');
      }
    }

    let menuOptions: any = []

    if (width === ''){

      if (token.slug !== userCurrentToken){
        if (userTokenData.position != token.position){
          menuOptions.push({action: () => {atknew( token.slug, 'ranged' )}, text: 'Atacar'})
        }

        if (currentTokenSkills.target.length > 0){
          let habilities_submenu = {
            text: 'Habilidades', 
            submenu: []
          }
         
          currentTokenSkills.target.forEach(function(skill, index){
            habilities_submenu.submenu.push({
              action: () => { useSkill( token.slug, skill ) },
              text: skill.nome,
            })
          })

          menuOptions.push(habilities_submenu);
        }

        if (currentTokenItems.target.length > 0) {
          let items_submenu = {
            text: 'Itens', 
            submenu: []
          }
  
          currentTokenItems.target.forEach(function(item, index){
            items_submenu.submenu.push({
              action: () => { useSkill( token.slug, item ) },
              text: item.nome + ' x' + item.qtd,
            })
          })
  
          menuOptions.push(items_submenu);
        }
      }

      if (token.slug === userCurrentToken) {

        if (currentTokenSkills.own.length > 0){
          let support_submenu = {
            text: 'Habilidades', 
            submenu: []
          }
  
          currentTokenSkills.own.forEach(function(skill, index){
            support_submenu.submenu.push({
              action: () => { useSkill( token.slug, skill ) },
              text: skill.nome,
            })
          })

          menuOptions.push(support_submenu);
        }
        
        if (currentTokenItems.own.length > 0) {
          let items_submenu = {
            text: 'Itens', 
            submenu: []
          }
  
          currentTokenItems.own.forEach(function(item, index){
            items_submenu.submenu.push({
              action: () => { useSkill( token.slug, item ) },
              text: item.nome + ' x' + item.qtd,
            })
          })
  
          menuOptions.push(items_submenu);
        }
      }

    }
    else if (userData.type === 'gm'){
      if (token.type !== 'player' && duplicateMonsterToken && deleteToken){
        menuOptions.push({action: () => {if (changeCurrentToken) duplicateMonsterToken(token.slug); setActiveTokenMenu('') }, text: 'Duplicar'})
        menuOptions.push({action: () => {if (changeCurrentToken && confirm(`Confirma exclusão do token "${token.name}" ?`)) deleteToken(token.slug); setActiveTokenMenu('') }, text: 'Excluir'})
      }
    }

    if (userData.type === 'gm') {
      menuOptions.push({action: editSheet, text: 'Editar Ficha'})
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
          {width === '' && <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} left={'-2.7rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.pv && token.attr?.pvmax && <Typography onClick={() => {setAttr('pv',token.slug,prompt(`Modificar PV (Máx: ${token.attr.pvmax})`))}} sx={[styles.attribute, {backgroundColor: '#0e7f0e', cursor: 'pointer'}]}><Image src={`/images/hearts.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.pv}</Typography>}
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.pm && token.attr?.pmmax && <Typography onClick={() => {setAttr('pm',token.slug,prompt(`Modificar PP (Máx: ${token.attr.pmmax})`))}} sx={[styles.attribute, {backgroundColor: '#0f4dbc', cursor: 'pointer'}]}><Image src={`/images/allied-star.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr.pm}</Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.pv && token.attr?.pvmax && <Typography sx={[styles.attribute, {backgroundColor: '#0e7f0e'}]}><Image src={`/images/hearts.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{ Math.round((token.attr.pv / token.attr.pvmax) * 100) } %</Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.pm && token.attr?.pmmax && <Typography sx={[styles.attribute, {backgroundColor: '#0f4dbc'}]}><Image src={`/images/allied-star.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /> ?</Typography>}
          </Box>}
          {width === '' && (token.type === 'player' || userData.type === 'gm') && token.attr && <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} right={'-2.7rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
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
        sx={{width: 'calc(100vw - 240px)', zIndex: 999999, '& > div:first-child': {width: 'calc(100vw - 240px)'} }}
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
          {false && <Box position='absolute' top='20px' left='0' display='flex' justifyContent='flex-start' paddingLeft='20px' alignItems='center' width={'100%'} flexDirection='column'>
            <Typography color="#FFF" textAlign='left' variant="h5" component='h2' style={{textShadow: '2px -2px 5px #000'}} alignSelf='flex-start' >{props.title}</Typography>
            {props.doom && <Box display='flex' gap='5px' justifyContent='flex-start' alignSelf='flex-start'>
              {props.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
            </Box>}
          </Box>}
          <Box display='flex' flexDirection='row-reverse' position='absolute' left='0' top='0' width='100%' height='100%'>
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
                <Box gap={'20px'} minHeight={1} aria-valuenow={-1} flex={1} className="droptarget" display='flex' flexDirection='column' justifyContent='center' alignItems='center' position='relative' onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
                  {availableTokens.map((token, idx) => {
                    return renderToken(token, 'av_'+idx, '60%')
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
          {userData && <Box position='fixed' zIndex={99999} padding='10px' left={'130px'} bottom={0} display='flex' justifyContent={'center'} alignItems='center' gap='15px' width={'calc(100% - 130px)'} bgcolor='rgba(0,0,0,0.4)'>
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
    left: '0',
    transform: 'translateY(-50%)',
    outline: 'none',
    boxShadow: '0px 0px 21px 0px rgba(16, 24, 40, 0.13)',
    height: '100%',
    width: 'calc(100vw - 240px)',
  },
  cardContainer: {
    animation: 'float 6s ease-in-out infinite',
    marginTop: '15px',
    maxWidth: '150px',
    transition: '300ms',
    outline: 'solid 5px transparent'
  },
  card: {
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
    height: 'calc(100% - 60px)',
    width: '100%',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridTemplateRows: 'repeat(5, 1fr)'
  },
  diceInput: {width: '45px', outline: 'none', border: 'none', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.6)', textAlign: 'center', paddingBottom: '5px', paddingTop: '7px', fontSize: '0.8rem'}
}

export default SaModal