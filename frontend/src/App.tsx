import { Routes, Route } from 'react-router-dom'
import { AppShell, Group, NavLink, Title } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'
import { LandingPage } from './pages/LandingPage'
import { BookingPage } from './pages/BookingPage'
import { EventsPage } from './pages/EventsPage'
import './index.css'

function App() {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Group>
            <IconCalendarEvent size={28} color="#f97316" />
            <Title order={4}>Calendar</Title>
          </Group>
          <Group gap="lg">
            <NavLink 
              component="a" 
              href="/#/booking" 
              label="Записаться" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            />
            <NavLink 
              component="a" 
              href="/#/events" 
              label="Предстоящие события" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #fff 50%, #ffedd5 100%)', minHeight: 'calc(100vh - 60px)' }}>
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
