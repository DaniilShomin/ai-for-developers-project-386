import { useState } from 'react'
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
  ActionIcon,
  TextInput,
  Grid,
  ScrollArea,
} from '@mantine/core'
import { Calendar } from '@mantine/dates'
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconArrowLeft,
  IconArrowRight,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

dayjs.extend(utc)
dayjs.extend(timezone)
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
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; label: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [existingSlots, setExistingSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [bookerName, setBookerName] = useState('')
  const [bookerEmail, setBookerEmail] = useState('')
  const [formErrors, setFormErrors] = useState<{name?: string; email?: string}>({})

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setShowForm(false)
    setSuccess(false)
    setError(null)
    
    // Load existing time slots for selected date
    setSlotsLoading(true)
    try {
      const dateStr = dayjs(date).format('YYYY-MM-DD')
      const dateFrom = `${dateStr}T00:00:00`
      const dateTo = `${dateStr}T23:59:59`
      const slots = await apiClient.getTimeSlots('owner-1', dateFrom, dateTo) as TimeSlot[]
      setExistingSlots(slots)
    } catch (err) {
      console.error('Failed to load time slots:', err)
      setExistingSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleSlotSelect = (slot: { time: string; label: string }) => {
    setSelectedSlot(slot)
    setShowForm(false)
    setSuccess(false)
  }

  const handleBack = () => {
    if (showForm) {
      setShowForm(false)
    } else {
      navigate('/')
    }
  }

  const handleContinue = () => {
    if (selectedSlot && selectedDate) {
      setShowForm(true)
    }
  }

  const validateForm = () => {
    const errors: {name?: string; email?: string} = {}
    
    if (!bookerName.trim()) {
      errors.name = 'Введите имя'
    }
    
    if (!bookerEmail.trim()) {
      errors.email = 'Введите email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookerEmail)) {
      errors.email = 'Некорректный email'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !selectedDate || !selectedSlot) {
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Parse the selected time slot
      const [startHour, startMin] = selectedSlot.time.split(':').map(Number)
      
      // Create date with selected time
      const slotDate = new Date(selectedDate)
      slotDate.setHours(startHour, startMin, 0, 0)
      
      // Create time slot first
      const timeSlotData = await apiClient.createTimeSlot({
        ownerId: 'owner-1',
        startTime: slotDate.toISOString()
      }) as TimeSlot
      
      // Then create booking
      await apiClient.createBooking({
        timeSlotId: timeSlotData.id,
        bookerName: bookerName.trim(),
        bookerEmail: bookerEmail.trim(),
      })
      
      setSuccess(true)
      setShowForm(false)
      setSelectedSlot(null)
      setBookerName('')
      setBookerEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать запись')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').toDate())
  }

  const handleNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').toDate())
  }

  // Generate time slots for display (09:00 - 18:00, every 30 min)
  // Filter out past slots and already booked slots
  const generateTimeSlots = () => {
    const slots: { time: string; label: string }[] = []
    const now = dayjs()
    const isToday = selectedDate && dayjs(selectedDate).isSame(now, 'day')
    
    for (let hour = 9; hour < 18; hour++) {
      const time1 = `${hour.toString().padStart(2, '0')}:00`
      const time2 = `${hour.toString().padStart(2, '0')}:30`
      
      // Check if slot is in the past (for today)
      if (isToday) {
        const slotTime1 = dayjs(selectedDate).hour(hour).minute(0)
        const slotTime2 = dayjs(selectedDate).hour(hour).minute(30)
        if (slotTime1.isBefore(now)) {
          // Skip this slot, it's in the past
        } else {
        // Check if already booked - compare with UTC time converted to local
          const isBooked1 = existingSlots.some(slot => {
            const slotTimeLocal = dayjs.utc(slot.startTime).local()
            return slotTimeLocal.hour() === hour && slotTimeLocal.minute() === 0
          })
          if (!isBooked1) {
            slots.push({
              time: time1,
              label: `${hour.toString().padStart(2, '0')}:00 - ${hour.toString().padStart(2, '0')}:30`
            })
          }
        }
        
        if (slotTime2.isBefore(now)) {
          // Skip this slot, it's in the past
        } else {
          // Check if already booked - compare with UTC time converted to local
          const isBooked2 = existingSlots.some(slot => {
            const slotTimeLocal = dayjs.utc(slot.startTime).local()
            return slotTimeLocal.hour() === hour && slotTimeLocal.minute() === 30
          })
          if (!isBooked2) {
            slots.push({
              time: time2,
              label: `${hour.toString().padStart(2, '0')}:30 - ${(hour + 1).toString().padStart(2, '0')}:00`
            })
          }
        }
      } else {
        // Not today - only check if booked
        const isBooked1 = existingSlots.some(slot => {
          const slotTimeLocal = dayjs.utc(slot.startTime).local()
          return slotTimeLocal.hour() === hour && slotTimeLocal.minute() === 0
        })
        if (!isBooked1) {
          slots.push({
            time: time1,
            label: `${hour.toString().padStart(2, '0')}:00 - ${hour.toString().padStart(2, '0')}:30`
          })
        }
        
        const isBooked2 = existingSlots.some(slot => {
          const slotTimeLocal = dayjs.utc(slot.startTime).local()
          return slotTimeLocal.hour() === hour && slotTimeLocal.minute() === 30
        })
        if (!isBooked2) {
          slots.push({
            time: time2,
            label: `${hour.toString().padStart(2, '0')}:30 - ${(hour + 1).toString().padStart(2, '0')}:00`
          })
        }
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Format date for display: "воскресенье, 26 апреля"
  const formatSelectedDate = (date: Date | null) => {
    if (!date) return 'Дата не выбрана'
    return dayjs(date).format('dddd, D MMMM')
  }

  // Format time for display: "09:00 - 09:30"
  const formatSelectedTime = (slot: { time: string; label: string } | null) => {
    if (!slot) return 'Время не выбрано'
    return slot.label
  }

  if (success) {
    return (
      <Container size="xl" py={40}>
        <Paper 
          p="xl" 
          radius="md" 
          withBorder 
          style={{ borderColor: '#e5e7eb', background: '#fff', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}
        >
          <Box mb="lg">
            <IconCheck size={64} color="#22c55e" style={{ margin: '0 auto' }} />
          </Box>
          <Title order={2} mb="md" style={{ fontWeight: 700 }}>
            Запись подтверждена!
          </Title>
          <Text c="dimmed" mb="xl">
            Мы отправили подтверждение на ваш email. Ждём вас в назначенное время.
          </Text>
          <Group justify="center">
            <Button 
              color="orange"
              onClick={() => navigate('/events')}
              radius="md"
              styles={{
                root: {
                  backgroundColor: '#f97316',
                }
              }}
            >
              Мои записи
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setSuccess(false)
                setSelectedDate(null)
              }}
              radius="md"
              styles={{
                root: {
                  borderColor: '#e5e7eb',
                  color: '#374151',
                }
              }}
            >
              Новая запись
            </Button>
          </Group>
        </Paper>
      </Container>
    )
  }

  // Confirmation form view - 2 column layout
  if (showForm) {
    return (
      <Container size="xl" py={40}>
        <Title order={2} mb="xl" style={{ fontWeight: 700 }}>Запись на звонок</Title>
        
        <Grid gutter="xl">
          {/* Left Panel - Information */}
          <Grid.Col span={5}>
            <Paper 
              p="lg" 
              radius="md" 
              withBorder 
              style={{ borderColor: '#e5e7eb', background: '#fff', height: '100%' }}
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
                  <Text fw={500} size="md">{selectedDate ? timeSlots.length : 0}</Text>
                </Box>
                
                <Box className="info-block">
                  <Text size="sm" c="dimmed" mb={4}>Длительности в дне</Text>
                  <Text fw={500} size="md">30 мин</Text>
                </Box>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Right Panel - Confirmation Form */}
          <Grid.Col span={7}>
            <Paper 
              p="lg" 
              radius="md" 
              withBorder 
              style={{ borderColor: '#e5e7eb', background: '#fff', height: '100%' }}
            >
              <Group justify="space-between" mb="lg" align="center">
                <Text fw={600} size="lg">Подтверждение записи</Text>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  radius="md"
                  size="sm"
                  styles={{
                    root: {
                      borderColor: '#e5e7eb',
                      color: '#374151',
                    }
                  }}
                >
                  Изменить
                </Button>
              </Group>
              
              <Stack gap="md">
                <TextInput
                  placeholder="Имя"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  error={formErrors.name}
                  radius="md"
                  size="md"
                />
                
                <TextInput
                  placeholder="Email"
                  value={bookerEmail}
                  onChange={(e) => setBookerEmail(e.target.value)}
                  error={formErrors.email}
                  radius="md"
                  size="md"
                />
                
                {error && (
                  <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {error}
                  </Alert>
                )}
                
                <Button
                  color="orange"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={loading}
                  radius="md"
                  size="md"
                  mt="sm"
                  styles={{
                    root: {
                      backgroundColor: '#f97316',
                    }
                  }}
                >
                  {loading ? <Loader size="sm" color="white" /> : 'Подтвердить запись'}
                </Button>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    )
  }

  // Default view - 3 column layout
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
              <Text fw={500} size="md">{selectedDate ? timeSlots.length : 0} слотов</Text>
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
          <Group justify="space-between" mb="md" align="center">
            <Text fw={600} size="lg">Календарь</Text>
            <Group gap="xs" align="center">
              <ActionIcon 
                variant="default" 
                size="sm" 
                radius="md"
                onClick={handlePrevMonth}
                className="calendar-nav-btn"
              >
                <IconChevronLeft size={16} />
              </ActionIcon>
              <ActionIcon 
                variant="default" 
                size="sm" 
                radius="md"
                onClick={handleNextMonth}
                className="calendar-nav-btn"
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          </Group>
          
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
          
          {selectedDate && slotsLoading && (
            <Box py="xl" style={{ textAlign: 'center' }}>
              <Loader size="sm" />
              <Text size="sm" c="dimmed" mt="xs">Загрузка слотов...</Text>
            </Box>
          )}
          
          {selectedDate && !slotsLoading && (
            <>
              {timeSlots.length === 0 ? (
                <Box py="xl" style={{ textAlign: 'center' }}>
                  <Text c="dimmed">Нет доступных слотов на эту дату</Text>
                </Box>
              ) : (
                <ScrollArea h={320} mb="xl">
                  <Stack gap="xs">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedSlot?.time === slot.time
                      
                      return (
                        <Button
                          key={slot.time}
                          variant={isSelected ? 'filled' : 'default'}
                          color={isSelected ? 'orange' : undefined}
                          fullWidth
                          justify="space-between"
                          onClick={() => handleSlotSelect(slot)}
                          styles={{
                            root: {
                              border: isSelected ? 'none' : '1px solid #e5e7eb',
                              backgroundColor: isSelected ? '#f97316' : '#fff',
                              color: isSelected ? '#fff' : '#000',
                              height: '46px',
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
                          <span style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#22c55e', fontSize: '14px' }}>
                            Свободно
                          </span>
                        </Button>
                      )
                    })}
                  </Stack>
                </ScrollArea>
              )}
              
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
