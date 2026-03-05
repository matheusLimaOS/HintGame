import { Box, Button, Container, TextField } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import ContainerWrapper from '../../components/ContainerWrapper'
import api from '../../services/api'
interface Tips {
  tipOrder: number
  revealed: boolean
  size: number
  tip: string
}

function PlayCard() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { cardId } = useParams()
  const [guess, setGuess] = useState('')
  const fetchCard = async () => {
    const { data } = await api.get(`/api/card/${cardId}`)
    return data
  }
  const {
    data: card = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['card', cardId],
    queryFn: fetchCard,
    initialData: [],
  })
  const queryClient = useQueryClient()

  const getTip = useMutation({
    mutationFn: async (tipOrder: number) => {
      await api.get(`/api/tip/${cardId}/${tipOrder}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['card', cardId],
      })
    },
  })

  const guessFunc = useMutation({
    mutationFn: async () => {
      await api.post(`/api/guess/${cardId}`, {
        guess,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['card', cardId],
      })
    },
  })

  return (
    <ContainerWrapper>
      <Box
        maxWidth="lg"
        sx={{
          width: '80%',
          position: 'relative',
          margin: '0 auto',
        }}
      >
        <Container
          ref={containerRef}
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: '15px',
            maxHeight: 'calc(-128px + 100vh)',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            padding: '24px 0',
          }}
        >
          {isLoading && <p>{t('home.loading.loadingCategories')}</p>}
          {isError && <p>{t('home.loading.errorLoadingCategories')}</p>}
          <Box
            style={{
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #ccc',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
            }}
          >
            <p>{t('playCard.category.reveal') + card.category}</p>
            {card?.tips?.map((tip: Tips) => (
              <div key={tip.tipOrder} className={`tip ${tip.revealed ? 'revealed' : 'hidden'}`}>
                {tip.revealed ? tip.tip : '•'.repeat(tip.size)}
              </div>
            ))}
          </Box>
          <Box
            style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'row',
              border: '1px solid #ccc',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
              padding: '0 20px',
            }}
          >
            <TextField
              disabled={!card.guessRemaining}
              variant="standard"
              label={!card.alreadyGuessRight ? t('playCard.guess') : t('playCard.answer')}
              value={card.alreadyGuessRight ? card.answer : guess}
              onChange={(e) => {
                setGuess(e.target.value)
              }}
              name="guess"
              fullWidth
            />
            <Button onClick={() => guessFunc.mutate()} disabled={!card.guessRemaining}>
              CHUTA PIRANHA
            </Button>
          </Box>
          <Box
            style={{
              borderRadius: '15px',
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 2,
              marginTop: '20px',
              flexDirection: 'column',
              border: '1px solid #ccc',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
            }}
          >
            {card?.tips?.map((tip: Tips) => (
              <Button
                onClick={() => {
                  getTip.mutate(tip.tipOrder)
                }}
                key={tip.tipOrder}
                disabled={tip.revealed}
              >
                {tip.tipOrder}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>
    </ContainerWrapper>
  )
}

export default PlayCard
