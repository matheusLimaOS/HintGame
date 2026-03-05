import { Button, Container, TextField } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Field, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import ButtonWrapper from '../../components/ButtonWrapper'
import ContainerWrapper from '../../components/ContainerWrapper'
import FormWrapper from '../../components/FormWrapper'
import api from '../../services/api'

const defaultValues = {
  email: '',
  password: '',
}

interface newUserData {
  email: string
  password: string
  id?: string
}

interface ApiErrorResponse {
  error: string
}

function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    email: Yup.string().email(t('login.yup.email.valid')).required(t('login.yup.email.required')),
    password: Yup.string()
      .min(6, t('login.yup.password.length'))
      .required(t('login.yup.password.required')),
  })

  const mutation = useMutation<newUserData, AxiosError<ApiErrorResponse>, newUserData>({
    mutationFn: (newUser) =>
      api.post('/login', newUser, { skipAuthRefresh: true }).then((res) => {
        return res.data
      }),
    onSuccess: () => {
      navigate('/home')
      toast.success(t('login.toast.success'))
    },
    onError: () => {
      toast.error(t('login.toast.error'))
    },
  })

  const onSubmit = (data: typeof defaultValues) => {
    mutation.mutate(data)
  }

  return (
    <ContainerWrapper>
      <Container maxWidth="md" style={{ backgroundColor: '#f5f5f5', borderRadius: '15px' }}>
        <Formik
          enableReinitialize
          initialValues={defaultValues}
          validationSchema={validationSchema}
          onSubmit={(data) => onSubmit(data)}
        >
          {({ handleSubmit, errors, touched }) => (
            <FormWrapper onSubmit={handleSubmit}>
              <img src="/P.png" alt={t('title')} style={{ height: 250 }} />
              <Field
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                as={TextField}
                label={t('login.fields.email')}
                name="email"
                fullWidth
              />
              <Field
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                as={TextField}
                type="password"
                label={t('login.fields.password')}
                fullWidth
                name="password"
              />
              <ButtonWrapper>
                <Button variant="outlined" component={RouterLink} to="/newUser" color="primary">
                  {t('login.buttons.register')}
                </Button>
                <Button
                  disabled={mutation.isPending}
                  type="submit"
                  variant="contained"
                  color="success"
                >
                  {mutation.isPending ? t('login.buttons.loging') : t('login.buttons.login')}
                </Button>
              </ButtonWrapper>
            </FormWrapper>
          )}
        </Formik>
      </Container>
    </ContainerWrapper>
  )
}

export default Login
