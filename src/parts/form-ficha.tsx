'use client'

import { validateEmail, validateNotEmpty } from '@/helpers/validation';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import SaMessage from '@/components/sa-message';
import { useApp } from '@/context/app-context';

const FormFicha = () => {
  const {userTokenData, updateToken} = useApp()

  const [attrAtk, setAttrAtk] = useState('d4')
  const [attrDef, setAttrDef] = useState('d4')
  const [attrPow, setAttrPow] = useState('d4')
  const [combatSolo, setCombatSolo] = useState('d4')
  const [combatPartner, setCombatPartner] = useState('d4')
  const [combatGroup, setCombatGroup] = useState('d4')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (userTokenData){
      if (userTokenData.attr){
        if (userTokenData.attr.atk) setAttrAtk(userTokenData.attr.atk)
        if (userTokenData.attr.def) setAttrDef(userTokenData.attr.def)
        if (userTokenData.attr.pow) setAttrPow(userTokenData.attr.pow)
      }

      if (userTokenData.combat){
        if (userTokenData.combat.solo) setCombatSolo(userTokenData.combat.solo)
        if (userTokenData.combat.partner) setCombatPartner(userTokenData.combat.partner)
        if (userTokenData.combat.group) setCombatGroup(userTokenData.combat.group)
      }
    }
    
  }, [userTokenData])

  const onSubmit = () => {
    setErrorMessage('')

    setIsLoading(true);

    if (updateToken){
      updateToken({
        attr: {
          atk: attrAtk,
          def: attrDef,
          pow: attrPow,
        },
        combat: {
          solo: combatSolo,
          partner: combatPartner,
          group: combatGroup,
        },
      })
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
    <Box display='flex' flexDirection='column' style={styles.container}>
      {errorMessage && <SaMessage type='error' message={errorMessage} onClose={() => {setErrorMessage('')}} />}
      {userTokenData && <Typography component='h2' variant='h4'>Ficha de Personagem - {userTokenData.name}</Typography>}
      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={dice_data}
          label='Resistência Física'
          value={attrDef}
          getValue={setAttrDef}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Poder de Fogo'
          value={attrAtk}
          getValue={setAttrAtk}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Vínculo Ancestral'
          value={attrPow}
          getValue={setAttrPow}
        />
      </Box>
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start' gap='20px'>
        <SaInput
          select={true}
          items={dice_data}
          label='Combate Solo'
          value={combatSolo}
          getValue={setCombatSolo}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Combate em Dupla'
          value={combatPartner}
          getValue={setCombatPartner}
        />
        <SaInput
          select={true}
          items={dice_data}
          label='Combate em Grupo'
          value={combatGroup}
          getValue={setCombatGroup}
        />
      </Box>
      <SaButton loading={isLoading} variant='contained' text='Salvar' onClick={onSubmit}></SaButton>
    </Box>
  )
}

const styles = {
  container: {
    gap: '15px',
    marginTop: 20
  },
  text: {
    marginBottom: 10
  },
  btnForgetPassword: {
    alignSelf: 'flex-end',
    padding: '2px 6px'
  },
  btnSubmit: {
    marginTop: '5px'
  }
}

export default FormFicha