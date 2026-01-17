'use client'

import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaInput from '@/components/sa-input';
import SaButton from '@/components/sa-button';
import SaImageWithFallback from '@/components/sa-image-with-fallback';
import { useApp } from '@/context/app-context';

type FormProps = {
  afterSave: () => void
}

const EFFECTS_LIST = [
  {value: '', label: 'Nenhum'},
  {value: 'camp', label: 'Acampamento'},
  {value: 'dust', label: 'Poeira'},
  {value: 'fire', label: 'Fogo'},
  {value: 'fog', label: 'Neblina'},
  {value: 'magic_purple', label: 'Magia Roxa'},
  {value: 'magic_yellow', label: 'Magia Amarela'},
  {value: 'rain', label: 'Chuva'},
  {value: 'snow', label: 'Neve'},
  {value: 'storm', label: 'Tempestade'},
  {value: 'sunlight', label: 'Luz do Sol'},
  {value: 'tavern', label: 'Taverna'},
  {value: 'wind', label: 'Vento'},
]

const FormOptions = (props: FormProps) => {
  const {gameData, updateEffect, updateMapName, updateNight, updateMapImage, uploadBase64Image} = useApp()

  const imageInputRef = useRef<HTMLInputElement>(null)

  const [night, setNight] = useState<boolean>()
  const [effect, setEffect] = useState<string>()
  const [mapName, setMapName] = useState<string>()
  const [mapImage, setMapImage] = useState<string>('')
  const [imageLoading, setImageLoading] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (gameData){
      setNight(gameData.map.night || false)
      setEffect(gameData.map.effect || '')
      setMapName(gameData.map.name || '')
      setMapImage(gameData.map.image || '')
    }

  }, [gameData])

  const handleImageClick = () => {
    imageInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file || !uploadBase64Image || !updateMapImage) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = reader.result as string
      const base64 = result.split(",")[1]
      const matches = result.match(/^data:(image\/[a-zA-Z]*);base64,/)

      if (!matches || !matches[1]) {
        return
      }

      const byteLength = (base64.length * 3) / 4

      if (byteLength > 512000) {
        alert('Tamanho da imagem não pode ultrapassar 500kb')
        return
      }

      setImageLoading(true)

      const url = await uploadBase64Image(base64, matches[1])

      if (url) {
        setMapImage(url)
        updateMapImage(url)
      } else {
        alert('Falha ao fazer upload da imagem.')
      }

      setImageLoading(false)
    }

    reader.readAsDataURL(file)
  }

  const onSubmit = () => {
    setIsLoading(true)

    if (updateNight && night !== undefined && night !== (gameData.map.night || false)) {
      updateNight(night)
    }

    if (updateEffect && effect !== undefined && effect !== (gameData.map.effect || '')) {
      updateEffect(effect)
    }

    if (updateMapName && mapName !== undefined && mapName !== (gameData.map.name || '')) {
      updateMapName(mapName)
    }

    props.afterSave()

    setIsLoading(false)
  }

  return (
    <Box display='flex' flexDirection='column' style={styles.container}>
      <Typography component='h2' variant='h4'>Opções de Jogo</Typography>

      <Box marginTop={'10px'} display='flex' flexDirection='row' justifyContent='flex-start' alignItems='flex-start' gap='20px'>
        <Box width={'160px'} height={'100px'} flexShrink={'0'} position='relative'>
          <input type="file" accept="image/*" onChange={handleImageChange} ref={imageInputRef} style={{ display: "none" }} />
          {mapImage ? (
            <SaImageWithFallback
              fallback={'/images/placeholder-map.png'}
              src={mapImage}
              alt='Imagem do Mapa'
              width={160}
              height={100}
              style={{width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', opacity: imageLoading ? 0.5 : 1, border: 'dashed 2px #000'}}
              onClick={handleImageClick}
            />
          ) : (
            <Box
              onClick={handleImageClick}
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Typography color='rgba(255,255,255,0.5)' fontSize='0.8rem'>Clique para adicionar</Typography>
            </Box>
          )}
        </Box>
        {night !== undefined && <SaInput
          select={true}
          items={[{value: '0', label: 'Não'}, {value: '1', label: 'Sim'}]}
          label='Noite'
          value={night ? '1' : '0'}
          getValue={(value: string) => setNight(value === '1')}
        />}
        {gameData?.map && effect !== undefined && 
        <SaInput
          select={true}
          items={EFFECTS_LIST}
          label='Efeito'
          value={effect}
          getValue={setEffect}
        />}
        {gameData?.map && mapName !== undefined && 
          <SaInput
            label='Nome do Mapa'
            value={mapName}
            getValue={setMapName}
          />}
      </Box>
      <SaButton loading={isLoading} variant='contained' text='Salvar' onClick={onSubmit}></SaButton>
    </Box>
  )
}

const styles = {
  container: {
    gap: '15px',
    marginTop: 20
  }
}

export default FormOptions
