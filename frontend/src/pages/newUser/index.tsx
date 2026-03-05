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
  confirmPassword: '',
}

interface newUserData {
  email: string
  password: string
  id?: string
}

interface ApiErrorResponse {
  error: string
}

function NewUser() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('register.yup.email.valid'))
      .required(t('register.yup.email.required')),
    password: Yup.string()
      .min(6, t('register.yup.password.length'))
      .required(t('register.yup.password.required')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('register.yup.confirmPassword.equal'))
      .required(t('register.yup.confirmPassword.required')),
  })

  const mutation = useMutation<newUserData, AxiosError<ApiErrorResponse>, newUserData>({
    mutationFn: (newUser) =>
      api.post('/create-user', newUser, { skipAuthRefresh: true }).then((res) => {
        return res.data
      }),
    onSuccess: () => {
      navigate('/')
      toast.success(t('register.toast.success'))
    },
    onError: () => {
      toast.error(t('register.toast.error'))
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
              <img src="/P.png" alt={t('title')} style={{ height: 200 }} />
              <h1>{t('register.title')}</h1>
              <Field
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                as={TextField}
                label={t('register.fields.email')}
                name="email"
                fullWidth
              />
              <Field
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                as={TextField}
                type="password"
                label={t('register.fields.password')}
                fullWidth
                name="password"
              />
              <Field
                as={TextField}
                fullWidth
                label={t('register.fields.confirmPassword')}
                name="confirmPassword"
                type="password"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
              <ButtonWrapper>
                <Button
                  type="button"
                  variant="outlined"
                  component={RouterLink}
                  to="/"
                  color="error"
                >
                  {t('register.buttons.backToLogin')}
                </Button>
                <Button
                  disabled={mutation.isPending}
                  type="submit"
                  variant="contained"
                  color="success"
                >
                  {mutation.isPending
                    ? t('register.buttons.registering')
                    : t('register.buttons.register')}
                </Button>
              </ButtonWrapper>
            </FormWrapper>
          )}
        </Formik>
      </Container>
    </ContainerWrapper>
  )
}

export default NewUser
