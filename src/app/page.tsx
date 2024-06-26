import { Metadata } from 'next';
import { Box, Grid } from "@mui/material"
import LayoutUnlogged from '@/layouts/layout-unlogged';
import FormLogin from '@/parts/form-login';

export const metadata: Metadata = {
  title: "Login",
  description: "Generated by create next app",
};

const Index = () => {
  return <Grid container height={1} bgcolor='#FFF'>
    <Grid container  height={1} direction='column' justifyContent='center' alignItems='center'>
      <Box style={styles.container}>
        <FormLogin/>
      </Box>
    </Grid>
  </Grid>
}

const styles = {
  container:{
    width: 410,
    maxWidth: '100%',
    paddingInline: 20
  }
}

export default Index;