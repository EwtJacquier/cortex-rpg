'use client'

import { Modal, Box } from "@mui/material"
import theme from "@/app/theme"
import SaIcon from "./sa-icon"

type saModalProps = {
  children: React.ReactNode,
  isOpen?: boolean,
  getIsOpen?: (value: boolean) => void
}

const SaModalBasic = (props: saModalProps) => {
  const handleClose = () => {
    if (props.getIsOpen !== undefined) props.getIsOpen(false)
  };

  return (
    <Modal
      open={props.isOpen ?? false}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >
      <Box sx={styles.container}>
        {props.children}
        <Box position='absolute' display='flex' justifyContent='flex-end' top='20px' right='20px'>
          <SaIcon name="cross" size={45} onClick={handleClose} />
        </Box>
      </Box>
    </Modal>
  )
}

const styles = {
  container: {
    position: 'absolute',
    width: '800px',
    padding: '0 20px 20px 20px',
    border: '0',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    outline: 'none',
    borderRadius: '12px',
    boxShadow: '0px 0px 21px 0px rgba(16, 24, 40, 0.13)',
    maxWidth: 'calc(100% - 40px)'
  }
}

export default SaModalBasic