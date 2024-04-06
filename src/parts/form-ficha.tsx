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
  const [distinctions, setDistinctions] = useState<string[]>(['','',''])
  const [habilities, setHabilities] = useState<string[]>(['','',''])
  const [equips, setEquips] = useState<string[]>(['','','','',''])
  const [resources, setResources] = useState<string[]>(['','','','',''])
  const [canShowLoop, setCanShowLoop] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (userTokenData){
      if (userTokenData.complications){
        setComplications(userTokenData.complications)
      }

      if (userTokenData.resources){
        setResources(userTokenData.resources)
      }

      if (userTokenData.distinctions){
        setDistinctions(userTokenData.distinctions)
      }

      if (userTokenData.habilities){
        setHabilities(userTokenData.habilities)
      }

      if (userTokenData.equips){
        setEquips(userTokenData.equips)
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
              if (newTokenInfo[keys[0]][parseInt(keys[1])]) newTokenInfo[keys[0]][parseInt(keys[1])] += '|'+ value
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
    {value: 'd4', label: 'D4'},
    {value: 'd6', label: 'D6'},
    {value: 'd8', label: 'D8'},
    {value: 'd10', label: 'D10'},
    {value: 'd12', label: 'D12'},
  ]

  return (
    <Box paddingTop={'20px'}>
    {errorMessage && <SaMessage type='error' message={errorMessage} onClose={() => {setErrorMessage('')}} />}
    {userTokenData && <Typography component='h2' variant='h4'>Ficha de Personagem - {userTokenData.name}</Typography>}
    <form style={styles.container} onSubmit={onSubmit}>
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={dice_data}
          label='Resistência Física'
          name='attr_def'
          value={userTokenData?.attr?.def}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Poder de Fogo'
          name='attr_atk'
          value={userTokenData?.attr?.atk}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Vínculo Ancestral'
          name='attr_pow'
          value={userTokenData?.attr?.pow}
        />
      </Box>
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={dice_data}
          label='Combate Solo'
          name='combat_solo'
          value={userTokenData?.combat?.solo}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Combate em Dupla'
          name='combat_partner'
          value={userTokenData?.combat?.partner}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Combate em Grupo'
          name='combat_group'
          value={userTokenData?.combat?.group}
        />
      </Box>
      <Box display={'flex'} justifyContent={'space-between'} gap={'20px'}>
        <Box width={'50%'} flexDirection={'column'} display={'flex'} gap='15px'>
          <Typography component='h2' variant='h6'>Pontos de Plot</Typography>
          <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
            <SaInput
              placeholder={''}
              readonly={true}
              value={'Plot Points'}
            />
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[0,1,2,3,4,5,6,7,8,9,10].map((item) => {return {label: item.toString(), value: item.toString()}})}
                name='attr_pp'
                value={userTokenData && userTokenData.attr && userTokenData.attr.pp ? userTokenData.attr.pp : '0'}
              />
            </Box>
          </Box>
          <Typography component='h2' variant='h6'>Equipamento</Typography>
          {canShowLoop && equips.map((item, index) => {
            const comp = item.split('|')
            return <Box display='flex' key={'h_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
              <SaInput
                label={index === 0 ? 'À distância' : (index === 1 ? 'Corpo a corpo' : (index === 2 ? 'Defensivo' : 'Acessório'))}
                name={`equips_${index}_name`}
                value={comp[0] ? comp[0] : ''}
              />
              <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                name={`equips_${index}_value`}
                items={[{label: '-', value: '-'}, ...dice_data]}
                value={comp[1] ? comp[1] : '-'}
              />
              </Box>
            </Box>
          })}
          <Typography component='h2' variant='h6'>Bônus de Classe</Typography>
          <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
            <SaInput
              placeholder={''}
              readonly={true}
              value={'Ataque'}
            />
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[{label: '-', value: '-'}, ...dice_data]}
                name='bonus_atk1'
                value={userTokenData?.bonus?.atk1}
              />
            </Box>
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[{label: '-', value: '-'}, ...dice_data]}
                name='bonus_atk2'
                value={userTokenData?.bonus?.atk2}
              />
            </Box>
          </Box>
          <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
            <SaInput
              placeholder={''}
              readonly={true}
              value={'Defesa'}
            />
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[{label: '-', value: '-'}, ...dice_data]}
                name='bonus_def1'
                value={userTokenData?.bonus?.def1}
              />
            </Box>
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[{label: '-', value: '-'}, ...dice_data]}
                name='bonus_def2'
                value={userTokenData?.bonus?.def2}
              />
            </Box>
          </Box>
          <Typography component='h2' variant='h6'>Distinções</Typography>
          {canShowLoop && distinctions.map((item, index) => {
            const comp = item.split('|')
            return <Box display='flex' key={'d_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
              <SaInput
                placeholder={''}
                name={`distinctions_${index}_name`}
                value={comp[0] ? comp[0] : ''}
              />
              <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                name={`distinctions_${index}_value`}
                items={[{label: '-', value: '-'}, ...dice_data]}
                value={comp[1] ? comp[1] : '-'}
              />
              </Box>
            </Box>
          })}
          <Typography component='h2' variant='h6'>Habilidades</Typography>
          {canShowLoop && habilities.map((item, index) => {
            const comp = item.split('|')
            return <Box display='flex' key={'h_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
              <SaInput
                placeholder={''}
                name={`habilities_${index}_name`}
                value={comp[0] ? comp[0] : ''}
              />
              <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                name={`habilities_${index}_value`}
                items={[{label: '-', value: '-'}, ...dice_data]}
                value={comp[1] ? comp[1] : '-'}
              />
              </Box>
            </Box>
          })}
        </Box>
        <Box width={'50%'} flexDirection={'column'} display={'flex'} gap='15px'>
          <Typography component='h2' variant='h6'>Stress</Typography>
          <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
            <SaInput
              placeholder={''}
              readonly={true}
              value={'Corpo'}
            />
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[{label: '-', value: '-'}, ...dice_data]}
                name='stress_body'
                value={userTokenData?.stress?.body}
              />
            </Box>
          </Box>
          <Box display='flex' flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
            <SaInput
              placeholder={''}
              readonly={true}
              value={'Mente'}
            />
            <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                items={[{label: '-', value: '-'}, ...dice_data]}
                name='stress_mind'
                value={userTokenData?.stress?.mind}
              />
            </Box>
          </Box>
          <Typography component='h2' variant='h6'>Complicações</Typography>
          {canShowLoop && complications.map((item, index) => {
            const comp = item.split('|')

            return <Box display='flex' key={'c_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
              <SaInput
                placeholder={''}
                name={`complications_${index}_name`}
                value={
                  index === 0 ? 'Ferimento' : 
                  (index === 1 ? 'Sangramento' : (comp[0] ? comp[0] : ''))
                }
                readonly={index <= 1}
              />
              <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                name={`complications_${index}_value`}
                items={[{label: '-', value: '-'}, ...dice_data]}
                value={comp[1] ? comp[1] : '-'}
              />
              </Box>
            </Box>
          })}
          <Typography component='h2' variant='h6'>Itens / Recursos</Typography>
          {canShowLoop && resources.map((item, index) => {
            const comp = item.split('|')
            return <Box display='flex' key={'r_'+index} flexDirection='row' justifyContent='flex' alignItems='flex-start' gap='20px'>
              <SaInput
                name={`resources_${index}_name`}
                value={index === 0 ? 'Dinheiro' : (comp[0] ? comp[0] : '')}
                readonly={index === 0}
              />
              <Box sx={{width: '35%'}}>
              <SaInput
                select={true}
                name={`resources_${index}_value`}
                items={[{label: '-', value: '-'}, ...dice_data]}
                value={comp[1] ? comp[1] : '-'}
              />
              </Box>
            </Box>
          })}
        </Box>
      </Box>
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