'use client'

import { validateEmail, validateNotEmpty } from '@/helpers/validation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import SaMessage from '@/components/sa-message';
import { useApp, userModel } from '@/context/app-context';
import SaImageWithFallback from "@/components/sa-image-with-fallback";

type FormProps = {
  afterSave: () => void
}
const FormFicha = (props: FormProps) => {
  const {userTokenData, updateToken, userCurrentToken, users, userData, uploadBase64Image} = useApp()

  const [macros, setMacros] = useState<string[]>(['','','','','','','','','',''])
  const [itens, setItens] = useState<string[]>(['nome=Poção de Vida (ação)|desc=Recupera 15 pontos de vida.|fixo=10|buff:::5','nome=Fragmento de Cristal (ação)|desc=Recupera 5 pontos de poder.|fixo=5|buff:::1','','','','','','','',''])
  const [others, setOthers] = useState<string[]>(['','','','',''])
  const [canShowLoop, setCanShowLoop] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [tokenUrl, setTokenUrl] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const tokenInputRef = useRef();

  useEffect(() => {
    if (userTokenData?.macros){
      let newMacros = userTokenData.macros;

      if (newMacros.length === 5) {
        newMacros = [
          ...newMacros,
          ...['','','','','']
        ]
      }

      setMacros(newMacros)
    }

    if (userTokenData?.items){
      let newItems = userTokenData.items;

      if (newItems.length === 5) {
        newItems = [
          ...newItems,
          ...['','','','','']
        ]
      }
      
      setItens(newItems)
    }

    if (userTokenData?.others){
      setOthers(userTokenData.others)
    }

    if (userTokenData?.image) {
      setTokenUrl(userTokenData.image)
    }

    setCanShowLoop(true)
  }, [userTokenData])

  useEffect(() => {
    setTimeout(() => {
      setTokenLoading(false);
    }, 1000);
  }, [tokenUrl]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    setErrorMessage('')

    setIsLoading(true);

    if (updateToken){
      const newTokenInfo: any = {}

      data.forEach((value, key) => {
        const keys = key.split('_');

        if (keys.length > 1){
          if (keys.length > 2){
            if (!newTokenInfo[keys[0]]) newTokenInfo[keys[0]] = []

            if (!newTokenInfo[keys[0]][parseInt(keys[1])]){
              newTokenInfo[keys[0]][parseInt(keys[1])] = value
            }
            else{
              if (newTokenInfo[keys[0]][parseInt(keys[1])]) newTokenInfo[keys[0]][parseInt(keys[1])] += ':::'+ value
            }
            
          }
          else{
            if (!newTokenInfo[keys[0]]) newTokenInfo[keys[0]] = {}

            newTokenInfo[keys[0]][keys[1]] = value
          }
          
        }
        else{
          newTokenInfo[key] = value
        }
      });

      if (updateToken){
        updateToken( newTokenInfo,userCurrentToken ? userCurrentToken : Date.now() );
      }

      props.afterSave()
    }

    setIsLoading(false)
  }

  const dice_data = [
    {value: '', label: '-'},
    {value: '1d4', label: '1D4'},
    {value: '2d4', label: '2D4'},
    {value: '1d6', label: '1D6'},
    {value: '2d6', label: '2D6'},
    {value: '1d8', label: '1D8'},
    {value: '2d8', label: '2D8'},
  ]

  const mv_al_data = [
    {value: '1', label: '1 casa'},
    {value: '2', label: '2 casas'},
    {value: '3', label: '3 casas'},
    {value: '4', label: '4 casas'},
    {value: '5', label: '5 casas'},
    {value: '6', label: '6 casas'},
    {value: '7', label: '7 casas'},
    {value: '8', label: '8 casas'},
  ]

  const number_data = [
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'}
  ]

  const difficulty = [
    {value: '1', label: 'Novato, Nível 1, Bônus + 3'},
    {value: '2', label: 'Experiente, Nível 2, Bônus + 6'},
    {value: '3', label: 'Veterano, Nível 3, Bônus + 9'},
    {value: '4', label: 'Especialista, Nível 4, Bônus + 12'},
    {value: '5', label: 'Lendário, Nível 5, Bônus + 15'},
  ]

  const pv_pm_max = [
    {value: '15', label: '15'},
    {value: '20', label: '20'},
    {value: '25', label: '25'},
    {value: '30', label: '30'},
    {value: '35', label: '35'},
    {value: '40', label: '40'},
    {value: '45', label: '45'},
    {value: '50', label: '50'},
  ]

  const tokenTypes = [
    {value: 'npc', label: 'NPC'},
    {value: 'monster', label: 'Monstro'},
    {value: 'player', label: 'Jogador'},
  ]

  const handleImageClick = () => {
    tokenInputRef.current.click(); // ativa o input oculto
  };

  const handleTokenChange = async (e) => {
    const file = e.target.files[0];

    if (! file || ! uploadBase64Image) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1]; // remove "data:image/png;base64," etc
      const matches = reader.result.match(/^data:(image\/[a-zA-Z]*);base64,/);
      
      if ( ! matches || ! matches[1] ) {
        return;
      }

      // Calcula o tamanho da string base64 em bytes
      const byteLength = (base64.length * 3) / 4;

      // 300KB = 300 * 1024 bytes = 307200 bytes
      if (byteLength > 307200) {
        alert( 'Tamanho da imagem não pode ultrapassar 300kb' );
        return false;
      }

      setTokenLoading(true);
      
      const url = await uploadBase64Image( base64, matches[1] );

      if ( !url ) {
        alert( 'Failed to upload the image. ');
      }

      setTokenUrl(url);
    };

    reader.readAsDataURL(file);
  };

  return (
    <Box paddingTop={'20px'}>
    {errorMessage && <SaMessage type='error' message={errorMessage} onClose={() => {setErrorMessage('')}} />}
    <Typography component='h2' variant='h4'>Ficha de Personagem - {userTokenData ? userTokenData.name : 'Nova Ficha'}</Typography>
    <form style={styles.container} onSubmit={onSubmit}>
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <Box width={'160px'} height={'160px'} flexShrink={'0'}>
          <input type="file" accept="image/*" onChange={handleTokenChange} ref={tokenInputRef} style={{ display: "none" }} />
          <input type="hidden" name="image" value={tokenUrl} />
          <SaImageWithFallback
              fallback={`/tokens/default.png`} 
              src={tokenUrl} 
              alt='' 
              width={160} 
              height={160} 
              style={{width: '100%', height: '100%', cursor: 'pointer', border: 'dashed 2px #000'}}
              onClick={handleImageClick}
          />
          {tokenLoading && <Typography fontSize={'12px'} textAlign={'center'}>Enviando imagem...</Typography>}
        </Box>
        <Box width={'100%'} marginTop={'10px'} display='flex' flexDirection='column' justifyContent='space-between' alignItems='flex-start' gap='20px'>
          <SaInput
            type='text'
            label='Nome'
            name='name'
            value={userTokenData?.name}
          />
          <SaInput
            select={true}
            items={difficulty}
            label='Nível do Herói'
            name='attr_dif'
            value={userTokenData?.attr?.dif}
          />
        </Box>
      </Box>
      { userData && userData.type === 'gm' && <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={Object.entries(users).map(([ key, data ]) => ({value: key, label: data.name}))}
          label='Usuário'
          name='uid'
          value={userTokenData?.uid ? userTokenData.uid : '' }
        />
      </Box> }
      { userData && userData.type === 'player' && <input type="hidden" name="uid" value={userData.uid}/> }
      { userData && userData.type === 'gm' && <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={Object.entries(tokenTypes).map(([ key, data ]) => ({value: data.value, label: data.label}))}
          label='Tipo'
          name='type'
          value={userTokenData?.type ? userTokenData.type : 'npc' }
        />
      </Box> }
      { userData && userData.type === 'player' && <input type="hidden" name="type" value={'player'}/> }
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          type='number'
          label='PV Atual'
          name='attr_pv'
          value={userTokenData?.attr?.pv}
        />
        <SaInput
          type='number'
          label='PV Máximo'
          name='attr_pvmax'
          value={userTokenData?.attr?.pvmax}
        />
      </Box>
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          type='number'
          label='PP Atual'
          name='attr_pm'
          value={userTokenData?.attr?.pm}
        />
        <SaInput
          type='number'
          label='PP Máximo'
          name='attr_pmmax'
          value={userTokenData?.attr?.pmmax}
        />
      </Box>
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Atributos</Typography>
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={mv_al_data}
          label='Movimentação'
          name='attr_mv'
          value={userTokenData?.attr?.mv}
        />
        <SaInput
          select={true}
          items={number_data}
          label='Defesa'
          name='attr_df'
          value={userTokenData?.attr?.df}
        />
      </Box>
      <Typography component='h2' variant='h6'>Armas</Typography>
      <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
        <SaInput
          type='text'
          label='Nome (Principal)'
          name='attr_weapon'
          value={userTokenData?.attr?.weapon}
        />
        <SaInput
          type='number'
          label='Dano Fixo'
          name='attr_damage'
          value={userTokenData?.attr?.damage}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Dano Variável'
          name='attr_dices'
          value={userTokenData?.attr?.dices}
        />
        <SaInput
          select={true}
          items={mv_al_data}
          label='Alcance'
          name='attr_al'
          value={userTokenData?.attr?.al}
        />
      </Box>
      <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
        <SaInput
          type='text'
          label='Nome (Secundária)'
          name='attr_weapon2'
          value={userTokenData?.attr?.weapon2}
        />
        <SaInput
          type='number'
          label='Dano Fixo'
          name='attr_damage2'
          value={userTokenData?.attr?.damage2}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Dano Variável'
          name='attr_dices2'
          value={userTokenData?.attr?.dices2}
        />
        <SaInput
          select={true}
          items={mv_al_data}
          label='Alcance'
          name='attr_al2'
          value={userTokenData?.attr?.al2}
        />
      </Box>
      <Typography component='h2' variant='h6'>Arma Equipada</Typography>
      <SaInput
          select={true}
          name='attr_equipped'
          items={[{value: 'main', label: 'Principal'}, {value: 'sub', label: 'Secundária'}]}
          label='Selecione'
          value={userTokenData?.attr?.equipped ? userTokenData?.attr?.equipped : 'main'}
        />
      <Typography component='h2' variant='h6'>Montaria</Typography>
      <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
        <SaInput
          type='text'
          label='Nome'
          name='attr_mname'
          value={userTokenData?.attr?.mname}
        />
        <SaInput
          select={true}
          name='attr_mequipped'
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Equipada?'
          value={userTokenData?.attr?.mequipped ? userTokenData?.attr?.mequipped : '0'}
        />
      </Box>
      <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
        <SaInput
          type='number'
          label='PV Atual'
          name='attr_mpv'
          value={userTokenData?.attr?.mpv}
        />
        <SaInput
          type='number'
          label='PV Máximo'
          name='attr_mpvmax'
          value={userTokenData?.attr?.mpvmax}
        />
        <SaInput
          select={true}
          items={mv_al_data}
          label='Movimentação'
          name='attr_mmv'
          value={userTokenData?.attr?.mmv}
        />
      </Box>
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Frases de Efeito <small style={{fontSize: '0.8rem', padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.2)', fontWeight: 'normal'}}>separe as frases com ponto e vírgula ;</small></Typography>
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          type='text'
          label='Frases'
          name='shouts'
          value={userTokenData?.shouts}
        />
      </Box>
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Habilidades <small style={{fontSize: '0.8rem', padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.2)', fontWeight: 'normal'}}>nome|desc|pp|dados|fixo|arma|proprio|buff|postroll|postmessage|fx</small></Typography>
      {canShowLoop && macros.map((item, index) => {
        const comp = item.split(':::')
        return <Box display='flex' key={'m_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
          <SaInput
            type="text"
            placeholder="Macro"
            name={`macros_${index}_value`}
            value={comp[0] ? comp[0] : ''}
          />
        </Box>
      })}
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Consumíveis <small style={{fontSize: '0.8rem', padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.2)', fontWeight: 'normal'}}>nome|desc|pp|dados|fixo|arma|proprio|buff|postroll|postmessage|fx</small></Typography>
      {canShowLoop && itens.map((item, index) => {
        const comp = item.split(':::')
        return <Box display='flex' key={'i_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
          <SaInput
            type="text"
            placeholder="Macro"
            name={`items_${index}_value`}
            value={comp[0] ? comp[0] : ''}
          />
          <Box sx={{width: '25%'}}>
          <SaInput
            type="number"
            placeholder={'Qtd'}
            name={`items_${index}_quantity`}
            value={comp[1] ? comp[1] : ''}
          />
          </Box>
        </Box>
      })}
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Anotações / Outros</Typography>
      {canShowLoop && others.map((item, index) => {
        const comp = item.split(':::')
        return <Box display='flex' key={'o_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
          <SaInput
            type="text"
            placeholder="Descrição"
            name={`others_${index}`}
            value={comp[0] ? comp[0] : ''}
          />
        </Box>
      })}
      <SaButton style={styles.btnSubmit} loading={isLoading} variant='contained' text='Salvar'></SaButton>
    </form>
    </Box>
  )
}

const styles = {
  container: {
    gap: '15px',
    marginTop: 20,
    display:'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingRight: '20px',
    maxHeight: '60vh',
    position: 'relative'
  },
  text: {
    marginBottom: 10
  },
  btnForgetPassword: {
    alignSelf: 'flex-end',
    padding: '2px 6px'
  },
  btnSubmit: {
    position: 'sticky',
    bottom: 0,
    zIndex: 2
  }
}

export default FormFicha