'use client'

import { validateEmail, validateNotEmpty } from '@/helpers/validation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import SaMessage from '@/components/sa-message';
import { useApp, userModel } from '@/context/app-context';

type FormProps = {
  afterSave: () => void
}
const FormFicha = (props: FormProps) => {
  const {userTokenData, updateToken} = useApp()

  const [complications, setComplications] = useState<string[]>(['Ferimento','Sangramento','','','','','',''])
  const [macros, setMacros] = useState<string[]>(['','','','',''])
  const [itens, setItens] = useState<string[]>(['skill=Poção de Vida (ação)|desc=Recupera 15 pontos de vida.:::5','skill=Amuleto da Sorte (ação)|desc=Recupera 5 pontos de protagonismo.:::1','','',''])
  const [others, setOthers] = useState<string[]>(['','','','',''])
  const [canShowLoop, setCanShowLoop] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (userTokenData){
      if (userTokenData.complications){
        setComplications(userTokenData.complications)
      }
      
      if (userTokenData.macros){
        setMacros(userTokenData.macros)
      }

      if (userTokenData.itens){
        setItens(userTokenData.itens)
      }

      if (userTokenData.others){
        setOthers(userTokenData.others)
      }
    }

    setCanShowLoop(true)
  }, [userTokenData])

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
        updateToken(newTokenInfo)
      }

      props.afterSave()
    }

    setIsLoading(false)
  }

  const dice_data = [
    {value: '', label: '-'},
    {value: 'd4', label: 'D4'},
    {value: 'd6', label: 'D6'},
    {value: 'd8', label: 'D8'},
    {value: 'd10', label: 'D10'},
    {value: 'd12', label: 'D12'},
  ]

  const mv_al_data = [
    {value: '1', label: '1 casa'},
    {value: '2', label: '2 casas'},
    {value: '3', label: '3 casas'},
    {value: '4', label: '4 casas'},
    {value: '5', label: '5 casas'}
  ]

  const number_data = [
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'}
  ]

  const difficulty = [
    {value: '1', label: 'Fácil'},
    {value: '2', label: 'Médio'},
    {value: '3', label: 'Difícil'},
    {value: '4', label: 'Expert'}
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

  return (
    <Box paddingTop={'20px'}>
    {errorMessage && <SaMessage type='error' message={errorMessage} onClose={() => {setErrorMessage('')}} />}
    {userTokenData && <Typography component='h2' variant='h4'>Ficha de Personagem - {userTokenData.name}</Typography>}
    <form style={styles.container} onSubmit={onSubmit}>
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
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={difficulty}
          label='Dificuldade do Minigame'
          name='attr_dif'
          value={userTokenData?.attr?.dif}
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
      <Typography component='h2' variant='h6'>Arma Principal</Typography>
      <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
        <SaInput
          type='text'
          label='Nome da Arma'
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
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Habilidades <small style={{fontSize: '1rem', fontWeight: 'normal'}}>Macro = skill|desc|pp|dados|fixo|arma|proprio</small></Typography>
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
      <Typography component='h2' variant='h6' display='flex' justifyContent='space-between'>Consumíveis <small style={{fontSize: '1rem', fontWeight: 'normal'}}>Macro = skill|desc|pp|dados|fixo|arma|proprio</small></Typography>
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