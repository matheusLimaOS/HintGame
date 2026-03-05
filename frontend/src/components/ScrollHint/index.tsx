import { Box } from '@mui/material'

const ScrollHint = ({ position }: { position: string }) => {
  return (
    <Box
      sx={{
        pointerEvents: 'none',
        position: 'absolute',
        [position]: 0,
        left: 0,
        right: 0,
        height: 40,
        background:
          position == 'bottom'
            ? 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))'
            : 'linear-gradient(to top, rgba(255,255,255,0), rgba(255,255,255,1))',
        transition: 'opacity 0.3s',
        borderRadius: position === 'bottom' ? '0 0 15px 15px' : '15px 15px 0 0',
      }}
    />
  )
}

export default ScrollHint
