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

type saBattleGridProps = {
  children: React.ReactNode,
  isOpen?: boolean,
  doom?: string,
  getCanvasOpen: (open: boolean) => void,
  getIsOpen?: (value: boolean) => void
}

type diceTypes = {
  d4: number, d6: number, d8: number, d10: number, d12: number
}

const SaBattleGrid = (props: saBattleGridProps) => {
  const {audioContext, audioFiles, windowSize, userData, sendMessage, changeTerrain, duplicateMonsterToken, tokens, addPP, subtractPP, setAttr, deleteToken, gameData, userCurrentToken, updateToken, changeCurrentToken, setIsSheetOpen, userTokenData, messages, updateItemQuantity, isCardsOpen, setIsCardsOpen, userTokens, alternateMount, alternateWeapon} = useApp()
  const [sceneTokens, setSceneTokens] = useState<any[]>([false])
  const [availableTokens, setAvailableTokens] = useState<any[]>([])
  const [activeTokenMenu, setActiveTokenMenu] = useState('')
  const [dices, setDices] = useState<any>({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0})
  const [dices2, setDices2] = useState<any>({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0})
  const [messageToSend, setMessageToSend] = useState<{token: any, message: string, dices: any, target: any, dices2?: any, damage?: any, damage2?: any, message2?: string, bonus?: any, shield?: any, buff?: boolean, item?: boolean, effect?: number}>()
  const [nextActions, setNextActions] = useState()
  const [send, setSend] = useState<string>()
  const [previousResult, setPreviousResult] = useState<string>()
  const [isTypeboxOpen, setIsTypeboxOpen] = useState(false);
  const [wordToType, setWordToType] = useState('');
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [typeboxTimer, setTypeboxTimer] = useState<any>();
  const [typeboxAvailableTime, setTypeboxAvailableTime] = useState(1000);
  const [SFX, setSFX] = useState<any[]>([]);
  const [currentTokenSkills, setCurrentTokenSkills] = useState<any>({own: [], target: []});
  const [currentTokenItems, setCurrentTokenItems] = useState<any>({own: [], target: []});
  const [postRoll, setPostRoll] = useState<boolean>(false);
  const places = Array.from(Array(props.size).keys())

  const generateRandomLetter = (dflevel: number) => {
    let alphabet = '⇦⇨⇧⇩'; // Easy
    
    /*
    if (dflevel > 3)  {
      alphabet = '⇦⇨⇧⇩fdbzykx!@#$%+';
    } else if (dflevel >= 2) {
      alphabet = '⇦⇨⇧⇩abcdefgh';
    }
      */
    
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
          setTimeout(function(){
            setTypeboxAvailableTime(0);
            clearWord();
            playAudio(3, 0.1);
            setMessageToSend({
              ...messageToSend,
              ...{bonus: userTokenData.attr.dif}
            });
          },300); 
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
      
      let damage1 = 0;
      let damage2 = 0;
      
      if ( messages[messages.length - 1].firstResult ) {
        messages[messages.length - 1].firstResult.split(',').forEach((item) => {
          item = item.split('|')
          let max = item[0].replace('d','')
          if (max == 10 && item[1] == 0){
            item[1] = 10
          }
          damage1 += parseInt(item[1]);
        });

        if (messages[messages.length - 1].bonus && messages[messages.length - 1].shield) {
          damage1 += parseInt(messages[messages.length - 1].bonus) * 3;
        }
      }

      if (messages[messages.length - 1].damage) {
        damage1 += parseInt(messages[messages.length - 1].damage);
      }

      if ( messages[messages.length - 1].secondResult ) {
        messages[messages.length - 1].secondResult.split(',').forEach((item) => {
          item = item.split('|')
          let max = item[0].replace('d','')
          if (max == 10 && item[1] == 0){
            item[1] = 10
          }
          damage2 += parseInt(item[1]);
        });

        if (messages[messages.length - 1].damage2) {
          damage2 += parseInt(messages[messages.length - 1].damage2);
        }
      }

      if (is_buff) {
        playAudio( 5 , 0.5);
      }
      else {
        playAudio( 4 , 0.5);
        if (messages[messages.length - 1].bonus) {
          setTimeout(function(){
            playAudio( 4 , 0.5);
            setTimeout(function(){
              playAudio( 4 , 0.5);
            },150);
          },150);
        } 
      }

      let actor = document.querySelector('.token__' + messages[messages.length - 1].token);

      let phrase2 = '';
      let phrase = '';

      let shouts = typeof( tokens[ messages[messages.length - 1].token ].shouts ) !== 'undefined' ? tokens[ messages[messages.length - 1].token ].shouts.split(';') : ['Toma essa!', 'Minha vez!', 'Você não vai escapar!', 'Isso acaba aqui!'];
      
      if (messages[messages.length - 1].message.indexOf('Atacou') > -1) {
        phrase = shouts[Math.floor(Math.random() * shouts.length)];
      }
      else {
        phrase = messages[messages.length - 1].message;
        phrase = phrase.replace('(ação)', '').replace('(suporte)', '').replace('(reação)', '').trim();
        phrase = phrase.indexOf('\\') > -1 ? phrase.split('\\')[0].split('(')[0].trim() : phrase;
        phrase += '!';
      }

      if (actor && phrase) {
        actor.setAttribute('phrase', phrase);
        setTimeout(function(){
          actor.removeAttribute('phrase');
          if (phrase2) {
            actor.setAttribute('phrase', phrase2);
            setTimeout(function(){
              actor.removeAttribute('phrase');
            },3500);
          }
        },phrase2 ? 2000 : 4000);
      }
      
      let token = document.querySelector('.token__' + messages[messages.length - 1].target + ' > div');

      if (token){
        token.classList.add(is_buff ? 'heal' : 'hurt');

        setTimeout(function(){
          token.classList.remove(is_buff ? 'heal' : 'hurt')
        },500);

        token.setAttribute('type', is_buff ? 'heal' : 'hurt');

        setTimeout(function(){
          token.removeAttribute('type');
        },4000);

        if (damage1) {
          token.setAttribute('damage1', damage1.toString());

          setTimeout(function(){
            token.removeAttribute('damage1');
          },4000);
        }

        if (damage2) {
          token.setAttribute('damage2', '+' + damage2.toString());

          setTimeout(function(){
            token.removeAttribute('damage2');
          },4000);
        }
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
    if (typeboxAvailableTime === 1000) {
      return;
    }

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
        if ( postRoll ) {
          setPostRoll(false);
          setPreviousResult(send);
          define_dices(dices2.d4+'d4+'+dices2.d6+'d6+'+dices2.d8+'d8+'+dices2.d10+'d10+'+dices2.d12+'d12');
          setTimeout(function() {
            playAudio(6, 0.5);
            setTimeout(function() {
              document.getElementById('roll')?.click()
            },300);
          },800);
          return;
        } else {
          setPreviousResult('');
        }

        if (messageToSend){
          const firstResult = previousResult ? previousResult : send;
          const secondResult = previousResult ? send : '';

          console.log(messageToSend);
          
          sendMessage(messageToSend.token, messageToSend.message, messageToSend.dices, firstResult, secondResult, messageToSend.target, messageToSend.damage, messageToSend.shield, messageToSend.bonus, messageToSend.buff, messageToSend.item, messageToSend.effect, messageToSend.dices2, messageToSend.message2)
  
          setMessageToSend(undefined)
        }
        else{
          sendMessage(userCurrentToken, 'Rolou dados', dices, send, '', userCurrentToken, null, null, null, true)
        }

        setDices({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0});
        
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
    if (userTokenData && userTokenData.macros) {
      setCurrentTokenSkills(formatSkills(userTokenData.macros))
    }

    if (userTokenData && userTokenData.items) {
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
      let equippedWeapon = userTokenData?.attr?.equipped ? userTokenData?.attr?.equipped : 'main';
      let weaponDamage = equippedWeapon === 'main' ? userTokenData.attr?.damage : userTokenData.attr?.damage2;
      let weaponDices = equippedWeapon === 'main' ? userTokenData.attr?.dices : userTokenData.attr?.dices2;

      if ( ! weaponDamage || ! weaponDices || ! tokens[slug].attr?.df || ! userTokenData.attr?.dif || ! tokens[slug].attr.df ){
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

      dados = sumDicesByString(dados, weaponDices);
      
      setMessageToSend({token: userCurrentToken, message: message, dices: dados, target: slug, shield: tokens[slug].attr.df, damage: weaponDamage})
      
      setDices(dados);

      setActiveTokenMenu('');
      
      let def = parseInt(tokens[slug].attr?.df)

      let dif_count = 3 + def;

      switch (def){
        case 2: dif_count = 4 + def; break;
        case 3: dif_count = 5 + def; break;
        case 4: dif_count = 6 + def; break;
        case 5: dif_count = 7 + def; break;
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

    const useskill = (slug : string, skill: any) => {
      let equippedWeapon = userTokenData?.attr?.equipped ? userTokenData?.attr?.equipped : 'main';
      let weaponDamage = equippedWeapon === 'main' ? userTokenData.attr?.damage : userTokenData.attr?.damage2;
      let weaponDices = equippedWeapon === 'main' ? userTokenData.attr?.dices : userTokenData.attr?.dices2;
      
      if ( ! weaponDamage || ! weaponDices || ! tokens[slug].attr?.df || ! userTokenData.attr?.dif || ! tokens[slug].attr.df ){
        return;
      }

      const effects = {
        fire: 3,
        ice: 2
      };

      const pp = skill.pp ? ` ( ${skill.pp} PP ) ` : '';
      const desc = skill.desc ? '\\' + skill.desc : '';

      let toSend : any = {
        token: userCurrentToken,
        message: `${skill.nome}${pp}${desc}`,
        target: slug,
        shield: tokens[slug].attr.df,
        damage: 0,
        effect: skill.fx && typeof( effects[ skill.fx ] ) !== undefined ? effects[ skill.fx ] : '',
        damage2: 0,
        message2: skill.postmessage ? skill.postmessage : '',
      };
      
      let dados: any = {
        d4: 0,
        d6: 0,
        d8: 0,
        d10: 0,
        d12: 0,
        d20: 0
      };

      let dados2: any = {
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
        toSend.damage += parseInt(skill.fixo);
      }

      if (skill.postroll) {
        dados2 = sumDicesByString(dados2, skill.postroll);
      }

      if (skill.mensagem) {
        toSend.message = skill.mensagem;
      }

      if (skill.arma) {
        for (let i = 0; i < parseInt(skill.arma); i++) {
          toSend.damage += parseInt(weaponDamage);
          dados = sumDicesByString(dados, weaponDices);
        }
      }

      if (skill.buff) {
        toSend.buff = true;
      }

      if (skill.item) {
        if (skill.qtd > 0 && updateItemQuantity){
          updateItemQuantity( skill.index, parseInt(skill.qtd) - 1 );
        }
        toSend.item = true;
      }

      toSend.dices = dados;
      toSend.dices2 = dados2;

      setMessageToSend(toSend);

      setDices(dados);
      setDices2(dados2);

      if ( dados2.d4 > 0 || dados2.d6 > 0 || dados2.d8 > 0 || dados2.d10 > 0 || dados2.d12 > 0 ) {
        setPostRoll(true);
      }

      setActiveTokenMenu('');

      if ( skill.item || skill.buff ) {
        if ( dados.d4 > 0 || dados.d6 > 0 || dados.d8 > 0 || dados.d10 > 0 || dados.d12 > 0 ) {
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
        let def = parseInt(tokens[slug].attr?.df)

        let dif_count = 3 + def;

        switch (def){
          case 2: dif_count = 4 + def; break;
          case 3: dif_count = 5 + def; break;
          case 4: dif_count = 6 + def; break;
          case 5: dif_count = 7 + def; break;
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

      if (userCurrentToken && token.slug !== userCurrentToken){
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
              action: () => { useskill( token.slug, skill ) },
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
              action: () => { useskill( token.slug, item ) },
              text: item.nome + ' x' + item.qtd,
            })
          })
  
          menuOptions.push(items_submenu);
        }
      }

      if (userCurrentToken && token.slug === userCurrentToken) {

        if (currentTokenSkills.own.length > 0){
          let support_submenu = {
            text: 'Habilidades', 
            submenu: []
          }
  
          currentTokenSkills.own.forEach(function(skill, index){
            support_submenu.submenu.push({
              action: () => { useskill( token.slug, skill ) },
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
              action: () => { useskill( token.slug, item ) },
              text: item.nome + ' x' + item.qtd,
            })
          })
  
          menuOptions.push(items_submenu);
        }
      }
  
      if (userCurrentToken && (token.slug === userCurrentToken || userData.type === 'gm')) {
        let other_submenu = {
          text: 'Outros', 
          submenu: []
        }

        other_submenu.submenu.push({action: () => { alternateWeapon(token.slug); setActiveTokenMenu('') } , text: 'Alternar Arma (ação)'});
        other_submenu.submenu.push({action: () => { alternateMount(token.slug); setActiveTokenMenu('') }, text: 'Alternar Montaria (ação)'});
        other_submenu.submenu.push({action: editSheet, text: 'Editar Ficha'}); 

        menuOptions.push(other_submenu);
      }

    }
    else if (userData.type === 'gm'){
      if (token.type !== 'player' && duplicateMonsterToken && deleteToken){
        menuOptions.push({action: () => {if (changeCurrentToken) duplicateMonsterToken(token.slug); setActiveTokenMenu('') }, text: 'Duplicar'})
        menuOptions.push({action: () => {if (changeCurrentToken && confirm(`Confirma exclusão do token "${token.name}" ?`)) deleteToken(token.slug); setActiveTokenMenu('') }, text: 'Excluir'})
      }

      menuOptions.push({action: editSheet, text: 'Editar Ficha'});
    }

    let equippedWeapon = token.attr?.equipped ? token?.attr?.equipped : 'main';

    let al = equippedWeapon === 'main' ? token.attr?.al : token.attr?.al2;

    let attr_style = {'& span': { width: '1.4rem', textAlign: 'center'}};

    return (
      <Box onDoubleClick={() => { if ( token.slug !== userCurrentToken && changeCurrentToken) { changeCurrentToken(token.slug); setActiveTokenMenu(''); } }} className={'token__'+token.slug} width={width ? width : '35%'} sx={[{aspectRatio: '1/1', zIndex: activeTokenMenu === token.slug ? 10 : 1 , ...styles.cardContainer}, width !== '' ? styles.cardNormal : {}]} key={index+'t'} onContextMenu={(event) => {event.preventDefault(); setActiveTokenMenu(token.slug)}} onClick={(event) => {event.stopPropagation()}}>
        <Box width={'100%'} height='100%' sx={[styles.card, width !== '' ? styles.cardNormal : {}, token.slug === userCurrentToken ? styles.cardSelected : {}]} className={(userData.type === 'gm' || ( token.uid && token.uid === userData.uid ) ) ? 'draggable' : ''} >
          <Box className="tokenSFX" sx={[styles.tokenSFX]}></Box>
          <SaImageWithFallback
            fallback={`/tokens/default.png`} 
            src={token.image ? token.image : `/tokens/default.png`} 
            alt='' 
            width={500} 
            height={500} 
            style={{width: '100%', height: '100%', cursor: 'pointer'}}
            onDragStart={(event) => {
              if ( userData.type === 'gm' || ( token.uid && token.uid === userData.uid ) ){
                event.dataTransfer.setData('text/plain', token.slug)
              }
              else{
                event.preventDefault()
              }
            }}
          />
          <Box className='tokenName' position={'absolute'} display='flex' flexDirection='column' justifyContent='center' alignItems='center' bgcolor='rgba(0,0,0,0.4)' padding='0.2rem' left={0} bottom={0} width='100%' sx={{opacity: 1, pointerEvents: 'none', marginTop: '10px'}}>
            <Typography textAlign={'center'} fontSize='0.8rem' color='#FFF' fontWeight={'600'} lineHeight={'1.2'}>{token.name}</Typography>
          </Box>
          {width === '' && <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} left={'-3.8rem'} width={'3.4rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.pv && token.attr?.pvmax && <Typography onClick={() => {setAttr('pv',token.slug,prompt(`Modificar PV (Máx: ${token.attr.pvmax})`))}} sx={[styles.attribute, {backgroundColor: '#0e7f0e', cursor: 'pointer'}, attr_style]}><Image src={`/images/hearts.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /><span>{token.attr.pv}</span></Typography>}
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.mequipped === '1' && token.attr?.mpv && token.attr?.mpvmax && <Typography onClick={() => {setAttr('mpv',token.slug,prompt(`Modificar PV (Máx: ${token.attr.mpvmax})`))}} sx={[styles.attribute, {backgroundColor: '#d96e16', cursor: 'pointer'}, attr_style]}><Image src={`/images/horse-head.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /><span>{token.attr.mpv}</span></Typography>}
            {(token.slug === userCurrentToken || userData.type === 'gm') && token.attr?.pm && token.attr?.pmmax && <Typography onClick={() => {setAttr('pm',token.slug,prompt(`Modificar PP (Máx: ${token.attr.pmmax})`))}} sx={[styles.attribute, {backgroundColor: '#0f4dbc', cursor: 'pointer'}, attr_style]}><Image src={`/images/allied-star.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /><span>{token.attr.pm}</span></Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.pv && token.attr?.pvmax && <Typography sx={[styles.attribute, {backgroundColor: '#0e7f0e'}, attr_style]}><Image src={`/images/hearts.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /><span>{ Math.round((token.attr.pv / token.attr.pvmax) * 100) }%</span></Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.mequipped === '1' && token.attr?.mpv && token.attr?.mpvmax && <Typography sx={[styles.attribute, {backgroundColor: '#d96e16'}, attr_style]}><Image src={`/images/horse-head.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /><span>{ Math.round((token.attr.mpv / token.attr.mpvmax) * 100) }%</span></Typography>}
            {(token.slug !== userCurrentToken && userData.type !== 'gm') && token.attr?.pm && token.attr?.pmmax && <Typography sx={[styles.attribute, {backgroundColor: '#0f4dbc'}, attr_style]}><Image src={`/images/allied-star.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} /> <span>?</span></Typography>}
          </Box>}
          {width === '' && (token.type === 'player' || userData.type === 'gm') && token.attr && <Box position={'absolute'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'} gap={'5px'} width={'2.5rem'} right={'-2.9rem'} padding={'5px'} top={'50%'} style={{transform: 'translateY(-50%)'}}>
            {token.attr?.mequipped === '1' && token.attr?.mmv && <Typography sx={styles.attribute}><Image src={`/images/horseshoe.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr?.mmv}</Typography>}
            {token.attr?.mv && <Typography sx={styles.attribute}><Image src={`/images/footprint.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{token.attr?.mv}</Typography>}
            {al && <Typography sx={styles.attribute}><Image src={`/images/targeted.png`} alt='' width={20} height={20} style={{width: '20px', height: '20px', objectFit: 'cover', pointerEvents: 'none' }} />{al}</Typography>}
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
    if (tokens && userData){
      const scene_key = gameData.map.current + '_' + gameData.maps[gameData.map.current].active_scene

      setSceneTokens(Object.values(tokens).filter((token: any, idx) => token.position !== undefined && token.scene !== undefined && token.scene === scene_key))
      setAvailableTokens(Object.values(tokens).filter((token: any, idx) => {
        return (userData.type === 'gm' && ((token.position === undefined || token.position < 0)))
        || 
        (userData.type === 'player' && token.uid && token.uid === userData.uid && (token.position === undefined || token.position < 0))
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

  let active_turn = gameData.turn ? gameData.turn : 'player';
  let active_turn_text = 'Turno dos ';

  switch (active_turn) {
    case 'player': active_turn_text += 'Jogadores'; break;
    case 'enemy': active_turn_text += 'Inimigos'; break;
    default: active_turn_text += 'NPCs'; break;
  }

  const newSheet = () => {
    if (changeCurrentToken) changeCurrentToken('');
      
    setActiveTokenMenu('')

    if (setIsSheetOpen) setIsSheetOpen(true)
  }

  return (
    <>
      <Modal
        hideBackdrop={true}
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
          {props.children}
          {false && <Box position='absolute' top='20px' left='0' display='flex' justifyContent='flex-start' paddingLeft='20px' alignItems='center' width={'100%'} flexDirection='column'>
            <Typography color="#FFF" textAlign='left' variant="h5" component='h2' style={{textShadow: '2px -2px 5px #000'}} alignSelf='flex-start' >{props.title}</Typography>
            {props.doom && <Box display='flex' gap='5px' justifyContent='flex-start' alignSelf='flex-start'>
              {props.doom.split(',').map((item: string, index: number)=><Typography key={index} color='#FFF' fontSize='1rem' fontWeight='bold' padding='0 5px' style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>{item}</Typography>)}
            </Box>}
          </Box>}
          <Box display='flex' flexDirection='row-reverse' position='absolute' left='0' top='0' width='100%' height='100%' className='game'>
            <Box width={'100%'}>
              <Box sx={[styles.battleGrid]}>
                {tokens && gameData && Array.from(Array(25).keys()).map((item: number, index: number) => {
                  const mapping = {
                      A: [1, 2, 3, 4, 5],
                      B: [6, 7, 8, 9, 10],
                      C: [11, 12, 13, 14, 15],
                      D: [16, 17, 18, 19, 20],
                      E: [21, 22, 23, 24, 25]
                  };

                  let tileLetter = '-';
                  
                  for (const [letter, range] of Object.entries(mapping)) {
                      if (range.includes(( index + 1 ))) {
                          tileLetter = letter;
                      }
                  }

                  let tileNumber = ( index + 1 ) % 5;

                  if (tileNumber === 0){
                    tileNumber = 5;
                  }

                  let bgStyle = {backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative'};
                  const tileStyle = {
                    '&:not([datadamage="0"])::before': {content: 'attr(datadamage)', whiteSpace: 'nowrap', fontSize: '0.8rem', position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', padding: '0.2em', color: '#FFF', textAlign: 'center', backgroundColor: '#000'},
                    '&::after': {content: 'attr(datatile)', fontSize: '1em', position: 'absolute', top: '0', left: '0', padding: '0.2em', color: '#FFF', width: '1em', textAlign: 'center', backgroundColor: '#000', opacity: '0.6'},
                  }
                  const active_scene = gameData.maps[gameData.map.current];
                  let terrain_damage = 0;
                  if (active_scene.terrain) {
                    let terrain = active_scene.terrain.split(',');
                    
                    const terrain_data = terrain[index].split('|');
                    const terrain_type = parseInt(terrain_data[0]);
                    if (terrain_data[1]){
                      terrain_damage = terrain_data[1];
                    }

                    if (terrain.length === 25 && terrain_type > 0){
                      switch (terrain_type){
                        case 1: bgStyle.backgroundColor = '#000'; break;
                        case 2: bgStyle = styles.iceTerrain; break;
                        case 3: bgStyle = styles.fireTerrain; break;
                        case 4: bgStyle = styles.breachTerrain; break;
                        case 5: bgStyle = styles.targetTerrain; break;
                      }

                      bgStyle.backgroundColor += ' !important';
                    }
                  }
                  return (
                    <Box aria-valuenow={index} border='dashed 2px rgba(0,0,0,0.2)' sx={[bgStyle, tileStyle, {'&:not(.hover):hover .terrain': {display: 'flex !important'}}]} display='flex' gap='60px' justifyContent='center' alignItems='center' key={index} position='relative' className="droptarget" onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}} dataTile={tileLetter + tileNumber} dataDamage={terrain_damage}>
                      {userData.type === 'gm' && <Box className='terrain' position={'absolute'} left='0' bottom='0' display={'none'} width={'100%'} height='100%' justifyContent={'center'} flexDirection={'column'} gap={'2px'} alignItems={'flex-end'} >
                        <button style={styles.terrainButton} onClick={() => { changeTerrain(index, '0'); }}>Clear</button>
                        <button style={styles.terrainButton} onClick={() => { changeTerrain(index, '5'); }}>Target</button>
                        <button style={styles.terrainButton} onClick={() => { changeTerrain(index, '1'); }}>Blocked</button>
                        <button style={styles.terrainButton} onClick={() => { changeTerrain(index, '2'); }}>Ice</button>
                        <button style={styles.terrainButton} onClick={() => { changeTerrain(index, '3'); }}>Fire</button>
                        <button style={styles.terrainButton} onClick={() => { changeTerrain(index, '4'); }}>Wood</button>
                      </Box>}
                      {sceneTokens.filter((token, idx) => token.position === index).map((token, idx) => {
                        return renderToken(token, index+'_'+idx)
                      })}
                    </Box>
                  )
                }) }
              </Box>
            </Box>
            <Box height={'100%'} width='150px' style={{backgroundColor: '#000', position: 'absolute', left: (isCardsOpen ? '0px' : '-150px'), transition: 'left 300ms', zIndex: 999999999}}>
              <Box height={'100%'} style={{overflowY: 'auto', overflowX: 'hidden'}} >
                <Box gap={'20px'} minHeight={1} aria-valuenow={-1} flex={1} className="droptarget" display='flex' flexDirection='column' justifyContent='center' alignItems='center' position='relative' onDragOver={(event) => {event.preventDefault()}} onDragLeave={(event) => {event.target.classList.remove('hover')}} onDragEnter={(event) => {event.target.classList.add('hover')}} onDrop={(event) => {event.target.classList.remove('hover'); dropToken(event.dataTransfer.getData('text/plain'), event.target.ariaValueNow)}}>
                  <Box onClick={newSheet} sx={{marginTop: '30px', cursor: 'pointer', fontSize: '60px', aspectRatio: '1/1', width: '60%', textAlign: 'center', lineHeight: '1.1', border: 'dashed 3px #FFF', color: '#FFF'}}>+</Box>
                  {availableTokens.map((token, idx) => {
                    return renderToken(token, 'av_'+idx, '60%')
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
          {userData && <Box position='fixed' zIndex={99999} padding='10px' left={0} bottom={0} display='flex' justifyContent={'space-between'} alignItems='center' gap='15px' width={'100%'} bgcolor='rgba(0,0,0,0.4)'>
            {active_turn && <Typography textAlign={'center'} fontSize='0.8rem' color='#FFF' sx={[{backgroundColor: '#000', padding: '0.5rem'}]} lineHeight={'1.2'}>{active_turn_text}</Typography>}
            <Box display='flex' justifyContent={'space-between'} alignItems='center' gap='15px'>
              <input type="text" style={{visibility: 'hidden', position: 'absolute', zIndex: -1}} name="dice_result" id="dice_result"/>
              {['d4','d6','d8','d10','d12'].map((item: any, index) => <Box display={'flex'} justifyContent={'space-between'}  key={index}>
                <button style={styles.diceButton} onClick={() => { if (dices[item] > 0) setDices({...dices, [item]: dices[item] - 1}) }}>-</button>
                <input type="text" readOnly name={item} value={dices[item] + ' ' + item} style={styles.diceInput} />
                <button style={styles.diceButton} onClick={() => { if (dices[item] < 10) setDices({...dices, [item]: dices[item] + 1}) }}>+</button>
              </Box>)}
              <button onClick={() => {setDices({d4: 0, d6: 0, d8: 0, d10: 0, d12: 0})}} style={{...styles.diceButton, padding: '8px 0.5rem', fontSize: '0.8rem' }}>Limpar</button>
              <button onClick={() => {playAudio(6, 0.5); document.getElementById('roll')?.click();}} style={{...styles.diceButton, padding: '8px 0.5rem', fontSize: '0.8rem' }}>Rolar</button>
            </Box>
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
    position: 'relative',
    outline: 'solid 5px transparent',
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: '80%',
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: '0',
      textAlign: 'center',
      color: '#000',
      backgroundColor: '#FFF',
      padding: '0.3rem',
      fontSize: '0.7rem',
      whiteSpace: 'nowrap',
      fontWeight: 'normal',
      borderRadius: '5px',
      boxShadow: '0 0 5px rgba(0,0,0,0.2)',
      zIndex: '2',
    },
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: '80%',
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: '0',
      borderBottom: 'solid 0.5em #FFF',
      borderLeft: 'solid 0.5em transparent',
      borderTop: 'solid 0.5em transparent',
      borderRight: 'solid 0.5em transparent',
      zIndex: '2',
      marginTop: '-0.9em'
    },
    '& > div::before': {
      content: '""',
      background: 'black',
      display: 'block',
      position: 'absolute',
      padding: '0.2em',
      top: '0.5em',
      left: '50%',
      fontSize: '1.3em',
      fontWeight: '600',
      color: '#FFF',
      transform: 'translateX(-50%)',
      opacity: '0',
      textAlign: 'center',
    },
    '& > div::after': {
      content: '""',
      background: 'black',
      display: 'block',
      position: 'absolute',
      padding: '0.2em',
      top: '0.5em',
      left: '50%',
      fontSize: '1em',
      fontWeight: '600',
      color: '#FFF',
      transform: 'translateX(-50%)',
      opacity: '0',
      textAlign: 'center',
    },
    '&[phrase]::before': {
      content: 'attr(phrase)',
      top: '115%',
      opacity: '1',
      transition: 'opacity 1500ms, top 1500ms',
    },
    '&[phrase]::after': {
      top: '115%',
      opacity: '1',
      transition: 'opacity 1500ms, top 1500ms',
    },
    '& > div[damage1][damage2]::before': {
      transform: 'none',
      right: '50%',
      left: 'auto',
    },
    '& > div[damage1]::before': {
      content: 'attr(damage1)',
      top: '-1em',
      opacity: '1',
      transition: 'opacity 2000ms, top 2000ms',
    },
    '& > div[damage1][damage2]::before': {
      transform: 'none',
      right: '50%',
      left: 'auto',
    },
    '& > div[damage2]::after': {
      transform: 'none',
      left: '50%',
      marginLeft: '0.5em',
      content: 'attr(damage2)',
      top: '-1em',
      opacity: '1',
      transition: 'opacity 2000ms, top 2000ms',
    },
    '& > div[type="heal"]::before': {
      backgroundColor: 'green',
    },
    '& > div[type="heal"]::after': {
      backgroundColor: 'green',
    },
    '& > div[type="hurt"]::before': {
      backgroundColor: 'red',
    },
    '& > div[type="hurt"]::after': {
      backgroundColor: 'red',
    },
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
    minWidth: '100%',
    textAlign: 'center',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0 0.2rem',
    '& span': {
      width: '1rem',
      textAlign: 'right'
    },
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
  terrainButton: {
    color: '#FFF', backgroundColor: '#000', outline: 'none', border: 'none', minWidth: '30px', fontSize: '0.6rem', cursor: 'pointer'
  },
  iceTerrain: {
    background: 'transparent url(/images/ice.png) no-repeat !important',
    backgroundSize: '100% 100% !important'
  },
  fireTerrain: {
    backgroundImage: 'url(/images/fire.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100% !important'
  },
  breachTerrain: {
    backgroundImage: 'url(/images/breach.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100% !important'
  },
  targetTerrain: {
    border: 'dashed 4px red',
  },
  diceInput: {width: '2rem', outline: 'none', border: 'none', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.6)', textAlign: 'center', paddingBottom: '5px', paddingTop: '7px', fontSize: '0.8rem'}
}

export default SaBattleGrid