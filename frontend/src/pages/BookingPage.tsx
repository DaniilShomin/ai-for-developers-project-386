import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Paper,
  Group,
  Text,
  Button,
  Box,
  Grid,
  Stack,
  ActionIcon,
  Loader,
  Alert,
  TextInput,
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { notifications } from '@mantine/notifications'

dayjs.locale('ru')

type Step = 'date' | 'time' | 'confirm' | 'success'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export function BookingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('date')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) return
    
    const fetchSlots = async () => {
      setLoading(true)
      setError(null)
      try {
        const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
        const dateFrom = new Date(`${dateStr}T00:00:00`).toISOString()
        const dateTo = new Date(`${dateStr}T23:59:59`).toISOString()
        
        const data = await apiClient.getTimeSlots('owner-1', dateFrom, dateTo)
        setSlots((data as TimeSlot[]).filter(s => !s.isBooked))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить слоты')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSlots()
  }, [selectedDate])

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      setCurrentStep('time')
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  const handleContinue = () => {
    if (currentStep === 'time' && selectedSlot) {
      setCurrentStep('confirm')
    }
  }

  const handleBack = () => {
    if (currentStep === 'time') {
      setCurrentStep('date')
      setSelectedSlot(null)
    } else if (currentStep === 'confirm') {
      setCurrentStep('time')
    } else if (currentStep === 'success') {
      navigate('/')
    }
  }

  const handleConfirm = async () => {
    if (!selectedSlot || !name || !email) return
    
    setLoading(true)
    try {
      await apiClient.createBooking({
        timeSlotId: selectedSlot.id,
        bookerName: name,
        bookerEmail: email,
      })
      
      notifications.show({
        title: 'Успех!',
        message: 'Бронирование успешно создано',
        color: 'green',
      })
      
      setCurrentStep('success')
    } catch (err) {
      notifications.show({
        title: 'Ошибка',
        message: err instanceof Error ? err.message : 'Не удалось создать бронирование',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots for display (09:00 - 18:00, every 30 min)
  const generateTimeSlots = () => {
    const slots: { time: string; label: string }[] = []
    for (let hour = 9; hour < 18; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour.toString().padStart(2, '0')}:00 - ${hour.toString().padStart(2, '0')}:30`
      })
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        label: `${hour.toString().padStart(2, '0')}:30 - ${(hour + 1).toString().padStart(2, '0')}:00`
      })
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Filter API slots to match our time slots
  const getSlotForTime = (timeLabel: string) => {
    return slots.find(slot => {
      const start = dayjs(slot.startTime).format('HH:mm')
      return timeLabel.startsWith(start)
    })
  }

  const renderInfoPanel = () => (
    <Paper p="lg" radius="md" withBorder style={{ background: '#f8fafc' }}>
      <Stack gap="md">
        <Box>
          <Text size="sm" c="dimmed" mb={4}>Выбранная дата</Text>
          <Text fw={500}>
            {selectedDate ? dayjs(selectedDate).format('dddd, D MMMM') : 'Дата не выбрана'}
          </Text>
        </Box>
        
        <Box>
          <Text size="sm" c="dimmed" mb={4}>Выбранное время</Text>
          <Text fw={500}>
            {selectedSlot 
              ? `${dayjs(selectedSlot.startTime).format('HH:mm')} - ${dayjs(selectedSlot.endTime).format('HH:mm')}`
              : 'Время не выбрано'
            }
          </Text>
        </Box>
        
        <Box>
          <Text size="sm" c="dimmed" mb={4}>Свободно</Text>
          <Text fw={500}>{slots.length} слотов</Text>
        </Box>
        
        <Box>
          <Text size="sm" c="dimmed" mb={4}>Длительность в дне</Text>
          <Text fw={500}>30 мин</Text>
        </Box>
      </Stack>
    </Paper>
  )

  const renderDateStep = () => (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        {renderInfoPanel()}
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">Календарь</Text>
            <Group gap="xs">
              <ActionIcon variant="subtle" size="sm">
                <IconChevronLeft size={16} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="sm">
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Text ta="center" mb="md" fw={500}>
            {dayjs().format('MMMM YYYY')}
          </Text>
          
          <DatePicker
            value={selectedDate}
            onChange={handleDateSelect}
            minDate={new Date()}
            locale="ru"
          />
        </Paper>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper p="lg" radius="md" withBorder h="100%">
          <Text fw={600} size="lg" mb="md">Статус слотов</Text>
          <Text c="dimmed">Выберите дату в календаре.</Text>
        </Paper>
      </Grid.Col>
    </Grid>
  )

  const renderTimeStep = () => (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        {renderInfoPanel()}
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">Календарь</Text>
            <Group gap="xs">
              <ActionIcon variant="subtle" size="sm">
                <IconChevronLeft size={16} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="sm">
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Text ta="center" mb="md" fw={500}>
            {selectedDate ? dayjs(selectedDate).format('MMMM YYYY') : ''}
          </Text>
          
          <DatePicker
            value={selectedDate}
            onChange={handleDateSelect}
            minDate={new Date()}
            locale="ru"
          />
        </Paper>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} size="lg" mb="md">Статус слотов</Text>
          
          {loading && (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          )}
          
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
              {error}
            </Alert>
          )}
          
          {!loading && !error && (
            <Stack gap="xs">
              {timeSlots.map((slot) => {
                const apiSlot = getSlotForTime(slot.label)
                const isSelected = selectedSlot?.id === apiSlot?.id
                const hasSlot = !!apiSlot
                
                return (
                  <Button
                    key={slot.time}
                    variant={isSelected ? 'filled' : 'light'}
                    color={isSelected ? 'orange' : hasSlot ? 'blue' : 'gray'}
                    fullWidth
                    justify="space-between"
                    disabled={!hasSlot}
                    onClick={() => apiSlot && handleSlotSelect(apiSlot)}
                    styles={{
                      root: {
                        border: isSelected ? '2px solid #f97316' : '1px solid #e5e7eb',
                      }
                    }}
                  >
                    <span>{slot.label}</span>
                    <span>{hasSlot ? 'Свободно' : '—'}</span>
                  </Button>
                )
              })}
            </Stack>
          )}
          
          <Group justify="space-between" mt="xl">
            <Button 
              variant="outline" 
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Назад
            </Button>
            <Button
              color="orange"
              rightSection={<IconArrowRight size={16} />}
              onClick={handleContinue}
              disabled={!selectedSlot}
            >
              Продолжить
            </Button>
          </Group>
        </Paper>
      </Grid.Col>
    </Grid>
  )

  const renderConfirmStep = () => (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        {renderInfoPanel()}
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="lg">
            <Text fw={600} size="lg">Подтверждение записи</Text>
            <Button variant="subtle" size="sm" onClick={() => setCurrentStep('time')}>
              Изменить
            </Button>
          </Group>
          
          <Stack gap="md">
            <TextInput
              label="Имя"
              placeholder="Введите ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <TextInput
              label="Email"
              placeholder="Введите ваш email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Button
              color="orange"
              fullWidth
              size="lg"
              mt="md"
              onClick={handleConfirm}
              loading={loading}
              disabled={!name || !email}
            >
              Подтвердить запись
            </Button>
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  )

  const renderSuccessStep = () => (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        {renderInfoPanel()}
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper p="xl" radius="md" withBorder ta="center">
          <IconCheck size={64} color="#22c55e" style={{ marginBottom: 16 }} />
          <Title order={3} mb="md">
            Бронь подтверждена. До встречи!
          </Title>
          <Button
            color="orange"
            fullWidth
            size="lg"
            onClick={() => navigate('/booking')}
          >
            Забронировать ещё
          </Button>
        </Paper>
      </Grid.Col>
    </Grid>
  )

  return (
    <Container size="xl" py={40}>
      <Title order={2} mb="xl">Запись на звонок</Title>
      
      {currentStep === 'date' && renderDateStep()}
      {currentStep === 'time' && renderTimeStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </Container>
  )
}
