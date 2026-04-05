import { Routes, Route } from 'react-router-dom'
import { AppShell, Group, Title, Button, UnstyledButton } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'
import { LandingPage } from './pages/LandingPage'
import { BookingPage } from './pages/BookingPage'
import { EventsPage } from './pages/EventsPage'
import { useNavigate } from 'react-router-dom'
import './index.css'

function App() {
  const navigate = useNavigate()

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Header style={{ borderBottom: '1px solid #e5e7eb' }}>
        <Group h="100%" px="md" justify="space-between" style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Group>
            <IconCalendarEvent size={28} color="#f97316" />
            <Title order={4}>Calendar</Title>
          </Group>
          <Group gap="lg">
            <Button 
              color="orange"
              radius="xl"
              onClick={() => navigate('/booking')}
              styles={{
                root: {
                  backgroundColor: '#f97316',
                }
              }}
            >
              Записаться
            </Button>
            <UnstyledButton 
              onClick={() => navigate('/events')}
              style={{ 
                color: '#9ca3af',
                fontWeight: 500,
              }}
            >
              Предстоящие события
            </UnstyledButton>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #fff 50%, #ffedd5 100%)', minHeight: 'calc(100vh - 70px)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
