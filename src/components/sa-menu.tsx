import * as React from 'react';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SaIcon from './sa-icon';

type saMenuProps = {
  visible: boolean,
  items: {text: string, action: () => void, icon?: string}[],
  position: 'left' | 'center'
}

const SaMenu = (props: saMenuProps) => {
  return (
    <Box sx={{position: 'absolute', backgroundColor: '#000', width: '120px', zIndex: 2, left: props.position === 'left' ? '80%' : '50%', top: '50%', transform: `translate(${props.position === 'center' ? '-50%' : '0'}, -50%)`, display: props.visible ? 'block' : 'none' }}>
      <MenuList>
        {props.items.map((item, index) => {
          return (
            <MenuItem key={index} onClick={item.action} sx={{'&:hover': {backgroundColor: 'rgba(255,255,255,0.2)'}}}>
              {item.icon !== undefined && <ListItemIcon>
                <SaIcon name={item.icon} size={16} />
              </ListItemIcon>}
              <ListItemText><Typography color='#FFF' style={{fontWeight: '500'}} fontSize={18}>{item.text}</Typography></ListItemText>
            </MenuItem>
          )
        })}
      </MenuList>
    </Box>
  );
}

export default SaMenu