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
  items: {text: string, action: () => void, icon?: string, submenu?: {text: string, action: () => void}[]}[],
  position: 'left' | 'center'
}

const SaMenu = (props: saMenuProps) => {
  return (
    <Box sx={{position: 'absolute', backgroundColor: '#000', width: '120px', zIndex: 2, left: props.position === 'left' ? '100%' : '50%', top: '50%', transform: `translate(${props.position === 'center' ? '-50%' : '0'}, -50%)`, display: props.visible ? 'block' : 'none' }}>
      <MenuList>
        {props.items.map((item, index) => {
          return (
            <MenuItem className='menu-item' key={index} onClick={item.action} sx={{'&:hover': {backgroundColor: 'rgba(255,255,255,0.2)', '.submenu': {display: 'block !important'} }}}>
              {item.icon !== undefined && <ListItemIcon>
                <SaIcon name={item.icon} size={16} />
              </ListItemIcon>}
              <ListItemText><Typography color='#FFF' style={{fontWeight: '500'}} fontSize={18}>{item.text}{item.submenu && item.submenu.length > 0 ? ' >' : ''}</Typography></ListItemText>
              {item.submenu && item.submenu.length > 0 && <>
                <Box className='submenu' sx={{position: 'absolute', display: 'none', backgroundColor: '#000', width: '200px', zIndex: 2, left: props.position === 'left' ? '115px' : '50%', top: '50%', transform: `translate(${props.position === 'center' ? '-50%' : '0'}, -50%)` }}>
                  <MenuList>
                    {item.submenu.map((subitem, subindex) => {
                      subitem.text = subitem.text.replace('(ação)', '<span class="tag tag-red">A</span>');
                      subitem.text = subitem.text.replace('(suporte)', '<span class="tag tag-blue">S</span>');
                      subitem.text = subitem.text.replace('(reação)', '<span class="tag tag-purple">R</span>');

                      return (
                        <MenuItem key={index + '_' + subindex} onClick={subitem.action} sx={{'&:hover': {backgroundColor: 'rgba(255,255,255,0.2)'}}}>
                          <ListItemText><Typography color='#FFF' style={{fontWeight: '500'}} fontSize={18} dangerouslySetInnerHTML={{__html: subitem.text}}></Typography></ListItemText>
                        </MenuItem>
                      )
                    })}
                  </MenuList>
                </Box>
              </>}
            </MenuItem>
          )
        })}
      </MenuList>
    </Box>
  );
}

export default SaMenu