import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import { Box, Container, IconButton } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ContainerWrapper from '../../components/ContainerWrapper'
import ScrollHint from '../../components/ScrollHint'
import api from '../../services/api'
const fetchCategories = async () => {
  const { data } = await api.get('/api/category')
  return data
}

interface categoriesType {
  id: number
  name: string
  cards?: Array<Card>
}

interface Card {
  id: number
}

function Home() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showHintUp, setShowHintUp] = useState(false)
  const navigate = useNavigate()
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [],
    queryFn: fetchCategories,
    initialData: [],
  })

  const handlePlay = async (category: number) => {
    try {
      const response = await api.get(`/api/card/random?category=${category}`)

      const { cardId } = response.data

      navigate(`/playCard/${cardId}`)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const el = containerRef.current
    console.log(el)
    if (!el) return

    const checkScroll = () => {
      const hasMore = el.scrollTop + el.clientHeight < el.scrollHeight - 1
      const hasMoreUp = el.scrollTop > 1
      setShowHint(hasMore)
      setShowHintUp(hasMoreUp)
    }
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
    }
  }, [categories])

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
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
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
          {categories.map((category: categoriesType) => (
            <Box
              maxWidth="md"
              style={{
                borderRadius: '15px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #ccc',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fff',
              }}
              key={category.id}
            >
              <p>{category.name}</p>
              {category.cards?.length && category.cards?.length > 0 ? (
                <IconButton onClick={() => handlePlay(category.id)}>
                  <PlayCircleFilledWhiteIcon color="success" />
                </IconButton>
              ) : (
                t('home.noCards')
              )}
            </Box>
          ))}
        </Container>
        {showHint && <ScrollHint position="bottom" />}
        {showHintUp && <ScrollHint position="top" />}
      </Box>
    </ContainerWrapper>
  )
}

export default Home
