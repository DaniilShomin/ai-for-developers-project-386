import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Paper,
  Group,
  Text,
  Loader,
  Alert,
  Stack,
  Badge,
} from '@mantine/core'
import { IconAlertCircle, IconCalendar } from '@tabler/icons-react'
import { apiClient } from '../api/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ru')

interface Booking {
  id: string
  timeSlot: {
    startTime: string
    endTime: string
  }
  booker: {
    name: string
    email: string
  }
  createdAt: string
  status: 'confirmed' | 'cancelled'
}

export function EventsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient.getBookings('owner-1', undefined, 'confirmed')
        setBookings(data as Booking[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить бронирования')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <Container size="xl" py={40}>
      <Title order={2} mb="xl">Предстоящие события</Title>
      
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
      
      {!loading && !error && bookings.length === 0 && (
        <Paper p="xl" radius="md" withBorder ta="center">
          <Text c="dimmed">Нет предстоящих событий</Text>
        </Paper>
      )}
      
      <Stack gap="md">
        {bookings.map((booking) => (
          <Paper key={booking.id} p="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Text fw={600} size="lg">{booking.booker.name}</Text>
                <Text size="sm" c="dimmed">{booking.booker.email}</Text>
                <Group gap="xs" mt={4}>
                  <IconCalendar size={16} color="#6b7280" />
                  <Text size="sm" c="dimmed">
                    Слот: {dayjs.utc(booking.timeSlot.startTime).local().format('YYYY-MM-DD-HH:mm')}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">
                  Создано: {dayjs.utc(booking.createdAt).local().format('DD.MM.YYYY, HH:mm')}
                </Text>
              </Stack>
              <Badge color="green" variant="light">Подтверждено</Badge>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  )
}
