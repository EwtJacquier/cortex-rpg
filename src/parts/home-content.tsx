'use client'

import { useApp } from '@/context/app-context';
import SaDB from '@/helpers/firebase';
import { Box } from "@mui/material"
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const HomeContent = () => {
  const [gameData, setGameData] = useState<any>()
  const videoRef = useRef<any>()
  const {windowSize} = useApp()
  const updateGameData = (data: any) => {
    setGameData(data)
  }

  useEffect(() => {
    if (gameData){
      //
      if (gameData.map){
        videoRef.current.load()
      }
    }
    else{
      SaDB.update(updateGameData)
    }
  },[gameData])

  const renderVideo = (url: string) => {
    return (
      <video ref={videoRef} loop autoPlay muted style={{position: 'absolute', top: 0, left: 0, objectFit: 'cover', width: '100%', height: '100%', pointerEvents: 'none'}}>
        <source src={url}/>
      </video>
    )
  }

  return (
    <>
      {gameData && <>
        <Box width='100%' height='100%' position='relative' overflow='hidden'>
          {gameData.map && gameData.map.primary && <Image src={`/scenes/${gameData.map.primary}.webp`} alt='' width={windowSize?.width} height={windowSize?.height} style={{width: '100%', height: '100%', objectFit:'cover', pointerEvents: 'none' }}/>}
          {gameData.map && gameData.map.effect && renderVideo(`/effects/${gameData.map.effect}.webm`)}
        </Box>
      </>}
    </>

  )
}

const styles = {
  banner: {
    width: '100%'
  },
  bannerContainer: {
    borderRadius: '16px', 
    overflow: 'hidden', 
    position: 'relative', 
    height: '22vw'
  }
}

export default HomeContent;