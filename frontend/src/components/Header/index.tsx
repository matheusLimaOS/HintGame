import { AppBar, Box, Button, FormControl, MenuItem, Select, Toolbar } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import type { FlagIconCode } from 'react-flag-kit'
import { FlagIcon } from 'react-flag-kit'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { clearAccessToken } from '../../storage'

type Language = {
  code: string
  label: string
  countryCode: FlagIconCode
}

const languages: Array<Language> = [
  { code: 'pt', label: 'Português', countryCode: 'BR' },
  { code: 'en', label: 'English', countryCode: 'US' },
]

const Header = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language
  const hideLogoutRoutes = ['/', '/login', '/register']
  const showLogout = !hideLogoutRoutes.includes(location.pathname)

  const handleChangeLanguage = (event: { target: { value: string } }) => {
    i18n.changeLanguage(event.target.value)
  }

  const logout = useMutation({
    mutationFn: async () => {
      await api.post(`/logout`)
    },
    onSuccess: () => {
      clearAccessToken()
      document.cookie = `X-Refresh-Token=; Max-Age=0; path=/`
      window.location.href = '/'
    },
  })

  return (
    <AppBar color="inherit" position="fixed">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box onClick={() => (window.location.href = '/home')} sx={{ cursor: 'pointer' }}>
          <img src="/P.png" alt="Logo" style={{ height: 80 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl
            variant="standard"
            sx={{ minWidth: 120, display: 'flex', alignItems: 'end', justifyContent: 'end' }}
          >
            <Select
              IconComponent={() => null}
              value={currentLanguage}
              onChange={handleChangeLanguage}
              label={t('header.label.language')}
              sx={{
                '& .MuiSelect-select': {
                  paddingRight: '14px !important',
                  paddingLeft: '14px !important',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              {languages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  value={lang.code}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    padding: '4px 0',
                    margin: '0 8px',
                  }}
                >
                  <FlagIcon code={lang.countryCode} size={26} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {showLogout && <Button onClick={() => logout.mutate()}>{t('logout')}</Button>}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
