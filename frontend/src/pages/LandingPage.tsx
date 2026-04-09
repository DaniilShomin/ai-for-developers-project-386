import { useNavigate } from 'react-router-dom'
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Box,
  Paper,
  List,
  ThemeIcon,
  Badge,
  Divider,
} from '@mantine/core'
import {
  IconArrowRight,
  IconCheck,
  IconSettings,
  IconCalendar,
} from '@tabler/icons-react'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <Container size="xl" py={80}>
      <Group align="flex-start" justify="center" gap={50}>
        {/* Left side */}
        <Box style={{ maxWidth: 500 }}>
          <Badge
            variant="light"
            color="gray"
            size="lg"
            mb="md"
            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            БЫСТРАЯ ЗАПИСЬ НА ВСТРЕЧУ
          </Badge>

          <Title order={1} size="3.5rem" mb="md" style={{ fontWeight: 800 }}>
            Calendar
          </Title>

          <Text size="lg" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
            Удобная система бронирования встреч. Выберите тип события, дату и
            время — запишитесь за минуту.
          </Text>

          <Group gap="md">
            <Button
              size="lg"
              color="orange"
              rightSection={<IconArrowRight size={20} />}
              onClick={() => navigate('/booking')}
              style={{ borderRadius: 8 }}
            >
              Записаться
            </Button>

            <Button
              size="lg"
              variant="outline"
              leftSection={<IconSettings size={20} />}
              onClick={() => navigate('/event-types')}
              style={{ borderRadius: 8 }}
            >
              Управление типами
            </Button>
          </Group>
        </Box>

        {/* Right side */}
        <Paper
          shadow="sm"
          p="xl"
          radius="lg"
          style={{
            maxWidth: 450,
            background: '#fff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Title order={3} mb="md">
            Что доступно прямо сейчас
          </Title>

          <List
            spacing="md"
            size="md"
            icon={
              <ThemeIcon size={20} radius="xl" color="orange" variant="light">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <strong>Типы событий:</strong> создавайте разные виды встреч с
              разной длительностью.
            </List.Item>
            <List.Item>
              <strong>Гибкие слоты:</strong> автоматическая генерация слотов на
              основе длительности события.
            </List.Item>
            <List.Item>
              <strong>Проверка конфликтов:</strong> невозможно записаться на
              занятое время.
            </List.Item>
            <List.Item>
              <strong>Предстоящие события:</strong> просмотр всех бронирований в
              одном месте.
            </List.Item>
          </List>

          <Divider my="md" />

          <Group gap="xs">
            <IconCalendar size={16} color="#6b7280" />
            <Text size="sm" c="dimmed">
              Для записи не требуется регистрация
            </Text>
          </Group>
        </Paper>
      </Group>
    </Container>
  )
}
