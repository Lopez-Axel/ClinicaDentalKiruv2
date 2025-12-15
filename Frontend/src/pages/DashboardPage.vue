<template>
  <q-page class="dashboard-home-page">
    <div class="page-container">
      <!-- Header de Bienvenida -->
      <div class="welcome-header q-mb-xl">
        <div class="welcome-text">
          <h1 class="text-h3 text-weight-bold q-mb-sm">
            ¡Bienvenido, {{ userName }}
          </h1>
          <p class="text-h6 text-grey-7">
            {{ greetingMessage }}
          </p>
        </div>
      </div>

      <!-- Tarjetas Principales -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- Reloj en Tiempo Real -->
        <div class="col-12 col-md-4">
          <q-card class="info-card clock-card" style="height: 100%;">
            <q-card-section class="text-center">
              <q-icon name="access_time" size="48px" color="primary" class="q-mb-md" />
              <div class="clock-time text-h2 text-weight-bold q-mb-xs">
                {{ currentTime }}
              </div>
              <div class="clock-seconds text-h5 text-grey-7">
                {{ currentSeconds }}
              </div>
              <div class="text-subtitle1 text-grey-6 q-mt-md">
                Hora actual
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Fecha Actual -->
        <div class="col-12 col-md-4">
          <q-card class="info-card date-card" style="height: 100%;">
            <q-card-section class="text-center">
              <q-icon name="calendar_today" size="48px" color="secondary" class="q-mb-md" />
              <div class="date-day text-h3 text-weight-bold q-mb-xs">
                {{ currentDay }}
              </div>
              <div class="date-month text-h6 text-grey-7 q-mb-xs">
                {{ currentMonth }}
              </div>
              <div class="date-year text-subtitle1 text-grey-6">
                {{ currentYear }}
              </div>
              <div class="text-subtitle1 text-grey-6 q-mt-md">
                {{ currentDayName }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Citas de Hoy (Solo para Admin y Dentista) -->
        <div class="col-12 col-md-4" v-if="showAppointmentsCard">
          <q-card class="info-card appointments-card" style="height: 100%;">
            <q-card-section class="text-center">
              <q-icon name="event_note" size="48px" color="accent" class="q-mb-md" />
              <div class="appointments-count text-h2 text-weight-bold q-mb-xs">
                {{ todayAppointmentsCount }}
              </div>
              <div class="text-subtitle1 text-grey-6">
                {{ todayAppointmentsCount === 1 ? 'Cita programada' : 'Citas programadas' }}
              </div>
              <div class="text-caption text-grey-6 q-mt-md">
                Para hoy, {{ currentDate }}
              </div>
              <q-btn
                flat
                dense
                color="primary"
                label="Ver Calendario"
                icon-right="arrow_forward"
                class="q-mt-md"
                @click="goToCalendar"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Reservas Pendientes (Solo para Cliente) -->
        <div class="col-12 col-md-4" v-if="userRole === 'CLIENT'">
          <q-card class="info-card reservations-card">
            <q-card-section class="text-center">
              <q-icon name="event_available" size="48px" color="positive" class="q-mb-md" />
              <div class="reservations-count text-h2 text-weight-bold q-mb-xs">
                {{ userReservationsCount }}
              </div>
              <div class="text-subtitle1 text-grey-6">
                {{ userReservationsCount === 1 ? 'Reserva activa' : 'Reservas activas' }}
              </div>
              <q-btn
                flat
                dense
                color="primary"
                label="Ver Mis Reservas"
                icon-right="arrow_forward"
                class="q-mt-md"
                @click="goToReservations"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Atajos Rápidos -->
      <div class="shortcuts-section q-mb-xl">
        <h2 class="text-h5 text-weight-bold q-mb-lg">
          <q-icon name="bolt" size="28px" color="orange" class="q-mr-sm" />
          Accesos Rápidos
        </h2>
        
        <div class="row q-col-gutter-md">
          <div 
            v-for="(shortcut, index) in filteredShortcuts" 
            :key="index"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card 
              class="shortcut-card cursor-pointer"
              @click="navigateTo(shortcut.route)"
            >
              <q-card-section class="text-center">
                <q-icon 
                  :name="shortcut.icon" 
                  :color="shortcut.color" 
                  size="40px" 
                  class="q-mb-sm"
                />
                <div class="text-subtitle1 text-weight-medium">
                  {{ shortcut.title }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ shortcut.description }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Estadísticas Rápidas (Solo para Admin) -->
      <div class="quick-stats q-mb-xl" v-if="userRole === 'ADMIN'">
        <h2 class="text-h5 text-weight-bold q-mb-lg">
          <q-icon name="bar_chart" size="28px" color="primary" class="q-mr-sm" />
          Resumen del Sistema
        </h2>

        <div class="row q-col-gutter-md">
          <div class="col-6 col-sm-3">
            <q-card class="stat-card">
              <q-card-section class="text-center">
                <q-icon name="people" color="blue" size="32px" class="q-mb-sm" />
                <div class="text-h6 text-weight-bold">{{ totalPatients }}</div>
                <div class="text-caption text-grey-6">Pacientes</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-3">
            <q-card class="stat-card">
              <q-card-section class="text-center">
                <q-icon name="medical_services" color="teal" size="32px" class="q-mb-sm" />
                <div class="text-h6 text-weight-bold">{{ totalDentists }}</div>
                <div class="text-caption text-grey-6">Dentistas</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-3">
            <q-card class="stat-card">
              <q-card-section class="text-center">
                <q-icon name="event" color="purple" size="32px" class="q-mb-sm" />
                <div class="text-h6 text-weight-bold">{{ totalAppointmentsMonth }}</div>
                <div class="text-caption text-grey-6">Citas este mes</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-3">
            <q-card class="stat-card">
              <q-card-section class="text-center">
                <q-icon name="payments" color="green" size="32px" class="q-mb-sm" />
                <div class="text-h6 text-weight-bold">{{ totalPaymentsMonth }}</div>
                <div class="text-caption text-grey-6">Pagos este mes</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Acciones Recomendadas -->
      <div class="recommended-actions" v-if="recommendedActions.length > 0">
        <h2 class="text-h5 text-weight-bold q-mb-lg">
          <q-icon name="lightbulb" size="28px" color="amber" class="q-mr-sm" />
          Acciones Recomendadas
        </h2>

        <q-list bordered separator class="rounded-borders">
          <q-item 
            v-for="(action, index) in recommendedActions" 
            :key="index"
            clickable
            v-ripple
            @click="navigateTo(action.route)"
          >
            <q-item-section avatar>
              <q-avatar :color="action.color" text-color="white" :icon="action.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ action.title }}</q-item-label>
              <q-item-label caption>{{ action.description }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import { useReserveStore } from 'src/stores/reservaStore'

export default defineComponent({
  name: 'DashboardHomePage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const reserveStore = useReserveStore()

    // Estado del reloj
    const currentTime = ref('')
    const currentSeconds = ref('')
    const currentDay = ref('')
    const currentMonth = ref('')
    const currentYear = ref('')
    const currentDayName = ref('')
    const currentDate = ref('')
    let clockInterval = null

    // Datos del usuario
    const userName = computed(() => authStore.userName || 'Usuario')
    const userRole = computed(() => authStore.userRole)

    // Mensaje de bienvenida según la hora
    const greetingMessage = computed(() => {
      const hour = new Date().getHours()
      if (hour < 12) return 'Buenos días, que tengas un excelente inicio de jornada'
      if (hour < 19) return 'Buenas tardes, esperamos que tu día vaya muy bien'
      return 'Buenas noches, gracias por tu dedicación'
    })

    // Mostrar tarjeta de citas solo para Admin y Dentista
    const showAppointmentsCard = computed(() => {
      return userRole.value === 'ADMIN' || userRole.value === 'DENTIST'
    })

    // Citas de hoy (simulado - integrar con datos reales)
    const todayAppointmentsCount = computed(() => {
      // Aquí se integraría con citasData para contar citas del día actual
      // Por ahora, retornamos un valor de ejemplo
      return 12 // Este valor vendría de citasData.citas.filter(cita => cita.fecha === today).length
    })

    // Reservas del usuario (para clientes)
    const userReservationsCount = computed(() => {
      return reserveStore.reservas.length
    })

    // Estadísticas (simuladas - integrar con datos reales)
    const totalPatients = ref(5)
    const totalDentists = ref(9)
    const totalAppointmentsMonth = ref(0)
    const totalPaymentsMonth = ref(2)

    // Actualizar reloj
    const updateClock = () => {
      const now = new Date()
      
      // Hora y minutos
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      currentTime.value = `${hours}:${minutes}`
      
      // Segundos
      const seconds = now.getSeconds().toString().padStart(2, '0')
      currentSeconds.value = `:${seconds}`
      
      // Fecha
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      
      currentDay.value = now.getDate().toString()
      currentMonth.value = months[now.getMonth()]
      currentYear.value = now.getFullYear().toString()
      currentDayName.value = days[now.getDay()]
      currentDate.value = `${currentDay.value} de ${currentMonth.value}`
    }

    // Atajos rápidos por rol
    const shortcuts = computed(() => {
      const baseShortcuts = {
        ADMIN: [
          {
            title: 'Gestionar Pacientes',
            description: 'Ver y editar pacientes',
            icon: 'person_search',
            color: 'blue',
            route: '/patients'
          },
          {
            title: 'Calendario de Citas',
            description: 'Ver agenda del día',
            icon: 'calendar_month',
            color: 'purple',
            route: '/Calendar-Month'
          },
          {
            title: 'Registrar Pago',
            description: 'Cobrar tratamiento',
            icon: 'payment',
            color: 'green',
            route: '/purchase'
          },
          {
            title: 'Ver Estadísticas',
            description: 'Reportes y métricas',
            icon: 'analytics',
            color: 'orange',
            route: '/statistics'
          },
          {
            title: 'Gestionar Usuarios',
            description: 'Admin de usuarios',
            icon: 'manage_accounts',
            color: 'deep-purple',
            route: '/users'
          },
          {
            title: 'Odontograma',
            description: 'Registro dental',
            icon: 'fa-solid fa-tooth header-icon',
            color: 'teal',
            route: '/odontogram'
          }
        ],
        DENTIST: [
          {
            title: 'Mis Citas Hoy',
            description: 'Ver agenda del día',
            icon: 'today',
            color: 'blue',
            route: '/Calendar-Day'
          },
          {
            title: 'Buscar Paciente',
            description: 'Historial clínico',
            icon: 'person_search',
            color: 'teal',
            route: '/patients'
          },
          {
            title: 'Odontograma',
            description: 'Registro dental',
            icon: 'dental_care',
            color: 'purple',
            route: '/odontogram'
          },
          {
            title: 'Calendario Completo',
            description: 'Ver todas las citas',
            icon: 'calendar_month',
            color: 'orange',
            route: '/Calendar-Month'
          }
        ],
        CLIENT: [
          {
            title: 'Nueva Reserva',
            description: 'Agendar una cita',
            icon: 'add_circle',
            color: 'primary',
            route: '/reservations/new'
          },
          {
            title: 'Mis Reservas',
            description: 'Ver mis citas',
            icon: 'event_available',
            color: 'blue',
            route: '/reservations'
          },
          {
            title: 'Mi Historial',
            description: 'Seguimiento clínico',
            icon: 'folder_open',
            color: 'teal',
            route: '/history'
          }
        ]
      }

      return baseShortcuts[userRole.value] || []
    })

    const filteredShortcuts = computed(() => shortcuts.value)

    // Acciones recomendadas según rol
    const recommendedActions = computed(() => {
      const actions = {
        ADMIN: [
          {
            title: 'Revisar citas pendientes de confirmación',
            description: 'Hay citas que requieren tu atención',
            icon: 'notification_important',
            color: 'orange',
            route: '/calendar'
          },
          {
            title: 'Verificar pagos pendientes',
            description: 'Algunos tratamientos tienen pagos sin procesar',
            icon: 'receipt_long',
            color: 'red',
            route: '/purchase'
          }
        ],
        DENTIST: [
          {
            title: 'Completar odontogramas pendientes',
            description: 'Actualiza los registros dentales de tus pacientes',
            icon: 'edit_note',
            color: 'blue',
            route: '/odontogram'
          }
        ],
        CLIENT: [
          {
            title: 'Revisa tus reservas próximas',
            description: 'Asegúrate de estar al tanto de tus citas agendadas',
            icon: 'event_available',
            color: 'teal',
            route: '/reserves'
          }
        ]
      }

      return actions[userRole.value] || []
    })

    // Navegación
    const navigateTo = (route) => {
      if (route) {
        router.push(route)
      }
    }

    const goToCalendar = () => {
      router.push('/Calendar-Month')
    }

    const goToReservations = () => {
      router.push('/reservations')
    }

    // Lifecycle
    onMounted(() => {
      updateClock()
      clockInterval = setInterval(updateClock, 1000)
    })

    onUnmounted(() => {
      if (clockInterval) {
        clearInterval(clockInterval)
      }
    })

    return {
      // Usuario
      userName,
      userRole,
      greetingMessage,
      
      // Reloj y fecha
      currentTime,
      currentSeconds,
      currentDay,
      currentMonth,
      currentYear,
      currentDayName,
      currentDate,
      
      // Citas y reservas
      showAppointmentsCard,
      todayAppointmentsCount,
      userReservationsCount,
      
      // Estadísticas
      totalPatients,
      totalDentists,
      totalAppointmentsMonth,
      totalPaymentsMonth,
      
      // Atajos y acciones
      filteredShortcuts,
      recommendedActions,
      
      // Métodos
      navigateTo,
      goToCalendar,
      goToReservations
    }
  }
})
</script>

