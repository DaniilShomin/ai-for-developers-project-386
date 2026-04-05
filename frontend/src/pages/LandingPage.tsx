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
} from '@mantine/core'
import { IconArrowRight, IconCheck } from '@tabler/icons-react'

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
            БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
          </Badge>
          
          <Title order={1} size="3.5rem" mb="md" style={{ fontWeight: 800 }}>
            Calendar
          </Title>
          
          <Text size="lg" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
            Один экран, понятные слоты, быстрая бронь. Выберите время и запишитесь на звонок без лишних шагов.
          </Text>
          
          <Button
            size="lg"
            color="orange"
            rightSection={<IconArrowRight size={20} />}
            onClick={() => navigate('/booking')}
            style={{ borderRadius: 8 }}
          >
            Записаться
          </Button>
        </Box>

        {/* Right side */}
        <Paper 
          shadow="sm" 
          p="xl" 
          radius="lg" 
          style={{ 
            maxWidth: 450, 
            background: '#fff',
            border: '1px solid #e5e7eb'
          }}
        >
          <Title order={3} mb="md">
            Что доступно прямо сейчас
          </Title>
          
          <List
            spacing="md"
            size="md"
            icon={
              <ThemeIcon size={20} radius="xl" color="blue" variant="light">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            <List.Item>
              Фиксированные 30-минутные слоты с 09:00 до 18:00.
            </List.Item>
            <List.Item>
              Проверка конфликта при бронировании.
            </List.Item>
            <List.Item>
              Просмотр предстоящих событий в отдельном разделе.
            </List.Item>
          </List>
        </Paper>
      </Group>
    </Container>
  )
}
