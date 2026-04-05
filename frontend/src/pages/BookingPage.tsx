import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Paper,
  Group,
  Text,
  Button,
  Box,
  Stack,
  Loader,
  Alert,
} from '@mantine/core'
import { Calendar } from '@mantine/dates'
import { 
  IconArrowLeft,
  IconArrowRight,
  IconAlertCircle
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export function BookingPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      setSelectedSlot(null)
      return
    }
    
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleContinue = () => {
    if (selectedSlot) {
      console.log('Продолжить с:', selectedSlot)
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

  // Format date for display: "воскресенье, 26 апреля"
  const formatSelectedDate = (date: Date | null) => {
    if (!date) return 'Дата не выбрана'
    return dayjs(date).format('dddd, D MMMM')
  }

  // Format time for display: "09:00 - 09:30"
  const formatSelectedTime = (slot: TimeSlot | null) => {
    if (!slot) return 'Время не выбрано'
    return `${dayjs(slot.startTime).format('HH:mm')} - ${dayjs(slot.endTime).format('HH:mm')}`
  }

  return (
    <Container size="xl" py={40}>
      <Title order={2} mb="xl" style={{ fontWeight: 700 }}>Запись на звонок</Title>
      
      <div className="booking-grid">
        {/* Left Panel - Information */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder 
          style={{ borderColor: '#e5e7eb', background: '#fff' }}
          className="booking-panel"
        >
          <Text fw={600} size="lg" mb="lg">Информация</Text>
          
          <Stack gap="md">
            <Box className="info-block">
              <Text size="sm" c="dimmed" mb={4}>Выбранная дата</Text>
              <Text fw={500} size="md">{formatSelectedDate(selectedDate)}</Text>
            </Box>
            
            <Box className="info-block">
              <Text size="sm" c="dimmed" mb={4}>Выбранное время</Text>
              <Text fw={500} size="md">{formatSelectedTime(selectedSlot)}</Text>
            </Box>
            
            <Box className="info-block">
              <Text size="sm" c="dimmed" mb={4}>Свободно</Text>
              <Text fw={500} size="md">{slots.length} слотов</Text>
            </Box>
            
            <Box className="info-block">
              <Text size="sm" c="dimmed" mb={4}>Длительность</Text>
              <Text fw={500} size="md">30 мин</Text>
            </Box>
          </Stack>
        </Paper>

        {/* Center Panel - Calendar */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder 
          style={{ borderColor: '#e5e7eb', background: '#fff' }}
          className="booking-panel"
        >
          <Calendar
            locale="ru"
            date={currentMonth}
            onDateChange={setCurrentMonth}
            minDate={new Date()}
            className="custom-calendar"
            getDayProps={(date) => ({
              selected: selectedDate ? dayjs(date).isSame(selectedDate, 'date') : false,
              onClick: () => handleDateSelect(new Date(date)),
            })}
          />
        </Paper>

        {/* Right Panel - Slot Status */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder 
          style={{ borderColor: '#e5e7eb', background: '#fff' }}
          className="booking-panel"
        >
          <Text fw={600} size="lg" mb="md">Статус слотов</Text>
          
          {!selectedDate && (
            <Text c="dimmed">Выберите дату в календаре.</Text>
          )}
          
          {selectedDate && loading && (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          )}
          
          {selectedDate && error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
              {error}
            </Alert>
          )}
          
          {selectedDate && !loading && !error && (
            <>
              <Stack gap="xs" mb="xl" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {timeSlots.slice(0, 6).map((slot) => {
                  const apiSlot = getSlotForTime(slot.label)
                  const isSelected = selectedSlot?.id === apiSlot?.id
                  const hasSlot = !!apiSlot
                  
                  return (
                    <Button
                      key={slot.time}
                      variant={isSelected ? 'filled' : 'default'}
                      color={isSelected ? 'orange' : undefined}
                      fullWidth
                      justify="space-between"
                      disabled={!hasSlot}
                      onClick={() => apiSlot && handleSlotSelect(apiSlot)}
                      styles={{
                        root: {
                          border: isSelected ? 'none' : '1px solid #e5e7eb',
                          backgroundColor: isSelected ? '#f97316' : '#fff',
                          color: isSelected ? '#fff' : '#000',
                          height: '44px',
                          borderRadius: '8px',
                        },
                        label: {
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                        },
                        inner: {
                          width: '100%',
                        }
                      }}
                    >
                      <span>{slot.label}</span>
                      <span style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#9ca3af', fontSize: '14px' }}>
                        {hasSlot ? 'Свободно' : '—'}
                      </span>
                    </Button>
                  )
                })}
              </Stack>
              
              <Group justify="space-between" mt="auto">
                <Button 
                  variant="outline" 
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleBack}
                  radius="md"
                  styles={{
                    root: {
                      borderColor: '#e5e7eb',
                      color: '#374151',
                    }
                  }}
                >
                  Назад
                </Button>
                <Button
                  color="orange"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={handleContinue}
                  disabled={!selectedSlot}
                  radius="md"
                  styles={{
                    root: {
                      backgroundColor: '#f97316',
                    }
                  }}
                >
                  Продолжить
                </Button>
              </Group>
            </>
          )}
        </Paper>
      </div>
    </Container>
  )
}
