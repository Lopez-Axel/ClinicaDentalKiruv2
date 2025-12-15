<template>
  <div class="calendar-day-container">
    <!-- Selector de Sucursal -->
    <div v-if="!sucursalSeleccionada" class="sucursal-selector">
      <q-card class="selector-card">
        <q-card-section class="selector-header-section">
          <div class="selector-header">
            <i class="fa-solid fa-building"></i>
            <h2>Selecciona una Sucursal</h2>
          </div>
          <p class="selector-subtitle">Elige la sucursal para ver su calendario diario</p>
        </q-card-section>
        
        <q-card-section>
          <div class="sucursales-grid">
            <q-card
              v-for="sucursal in sucursalesActivas"
              :key="sucursal.id"
              class="sucursal-card"
              clickable
              @click="seleccionarSucursal(sucursal)"
            >
              <q-card-section class="sucursal-content">
                <div class="sucursal-icon">
                  <i class="fa-solid fa-hospital"></i>
                </div>
                <div class="sucursal-name">{{ sucursal.nombre }}</div>
                <div class="sucursal-location">
                  <i class="fa-solid fa-map-marker-alt"></i>
                  {{ sucursal.ubicacion }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Calendario (solo visible si hay sucursal seleccionada) -->
    <div v-else class="calendar-content">
      <!-- Header -->
      <div class="calendar-header">
        <div class="header-background">
          <div class="header-shape header-shape-1"></div>
          <div class="header-shape header-shape-2"></div>
          <div class="header-shape header-shape-3"></div>
        </div>
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper">
              <i class="fa-solid fa-calendar-day header-icon"></i>
            </div>
            <div>
              <h1 class="page-title">Calendario Diario</h1>
              <p class="page-subtitle">{{ sucursalSeleccionada.nombre }} - {{ dayTitle }}</p>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              icon="fa-solid fa-building"
              label="Cambiar Sucursal"
              color="white"
              @click="cambiarSucursal"
              no-caps
              size="md"
            />
            <q-btn
              flat
              icon="fa-solid fa-arrow-left"
              label="Volver"
              color="white"
              @click="salir"
              no-caps
              size="md"
            />
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon-container total">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ citasDelDia.length }}</div>
            <div class="stat-label">Citas del Día</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-container today">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ reservasDelDia.length }}</div>
            <div class="stat-label">Reservas del Día</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-container upcoming">
            <i class="fa-solid fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dayName }}</div>
            <div class="stat-label">Día de la Semana</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="navigation-section">
        <div class="navigation-container">
          <div class="day-navigation">
            <q-btn
              flat
              icon="fa-solid fa-chevron-left"
              label="Día Anterior"
              @click="prevDay"
              color="primary"
              no-caps
              size="md"
            />
            
            <div class="current-day">
              <span class="day-display">{{ dayTitle }}</span>
              <q-btn
                flat
                icon="fa-solid fa-calendar-day"
                label="Hoy"
                @click="goToToday"
                color="primary"
                no-caps
                size="sm"
              />
            </div>
            
            <q-btn
              flat
              icon="fa-solid fa-chevron-right"
              label="Día Siguiente"
              @click="nextDay"
              color="primary"
              no-caps
              size="md"
            />
          </div>

          <div class="view-switcher">
            <q-btn-group outline>
              <q-btn outline label="Día" color="primary" no-caps />
              <q-btn outline label="Semana" @click="goToWeek" color="grey-7" no-caps />
              <q-btn outline label="Mes" @click="goToMonth" color="grey-7" no-caps />
            </q-btn-group>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="main-container">
        <div class="table-header">
          <div class="table-title-section">
            <h3 class="table-title">Horario del Día</h3>
          </div>
          <div class="table-actions">
            <div class="legend">
              <div class="legend-item">
                <div class="legend-color cita"></div>
                <span>Citas</span>
              </div>
              <div class="legend-item">
                <div class="legend-color reserva"></div>
                <span>Reservas</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bloqueado"></div>
                <span>Bloqueado Admin</span>
              </div>
            </div>
          </div>
        </div>

        <div class="day-grid-container">
          <div class="day-grid">
            <div class="day-header-row">
              <div class="time-header-cell">Hora</div>
              <div class="day-header-cell">
                <div class="day-header-content">
                  <div class="day-name">{{ dayName }}</div>
                  <div class="day-date">{{ currentDate.getDate() }}</div>
                  <div class="day-month">{{ currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }}</div>
                </div>
              </div>
            </div>

            <div
              v-for="hora in horariosDisponibles"
              :key="hora"
              class="time-row"
            >
              <div class="time-slot-label">
                <div class="time-display">{{ hora }}</div>
              </div>
              
              <div
                class="time-slot-content"
                :class="{ 'has-events': getEventosEnHora(hora).length > 0 }"
                @dragover.prevent
                @drop="onDrop(hora, $event)"
                @click="handleCellClick(hora)"
                @dblclick="handleCellDoubleClick(hora)"
              >
                <div class="slot-inner">
                  <template v-if="getEventosEnHora(hora).length">
                    <div
                      v-for="evento in getEventosEnHora(hora)"
                      :key="evento.id + '-' + evento.type"
                      class="event-card"
                      :class="[evento.type, { 'bloqueado-admin': esReservaBloqueada(evento) }]"
                      draggable="true"
                      @dragstart="onDragStart(evento, hora, $event)"
                      @click.stop
                    >
                      <div class="event-type-indicator" :class="evento.type"></div>
                      <div class="event-details">
                        <div class="event-header">
                          <div class="event-type-badge" :class="evento.type">
                            {{ getTipoLabel(evento) }}
                          </div>
                          <div class="event-time">{{ hora }}</div>
                        </div>
                        <div class="event-title">{{ evento.titulo }}</div>
                        <div class="event-subtitle" v-if="evento.subtitulo">{{ evento.subtitulo }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="empty-time-slot">
                      <i class="fa-solid fa-calendar-plus"></i>
                      <span>Disponible</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog: Bloquear Horario -->
    <q-dialog v-model="showBloqueoDialog" persistent>
      <q-card class="bloqueo-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-header-content">
            <i class="fa-solid fa-lock"></i>
            <h3>Bloquear Horario</h3>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="bloqueo-info">
            <div class="info-item">
              <i class="fa-solid fa-calendar"></i>
              <span>Fecha: {{ formatDate(currentDateStr) }}</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-clock"></i>
              <span>Hora: {{ horarioABloquear }}</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-building"></i>
              <span>Sucursal: {{ sucursalSeleccionada?.nombre }}</span>
            </div>
          </div>

          <q-input
            v-model="notasBloqueo"
            label="Notas (opcional)"
            type="textarea"
            rows="3"
            outlined
            class="q-mt-md"
            placeholder="Ej: Reunión de equipo, mantenimiento, etc."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Bloquear"
            color="primary"
            @click="bloquearHorario"
            :loading="bloqueando"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Confirmar Mover -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-header-content">
            <i class="fa-solid fa-arrows-alt"></i>
            <h3>Confirmar Cambio de Hora</h3>
          </div>
        </q-card-section>

        <q-card-section>
          <p>¿Desea mover esta cita?</p>
          <div class="move-details">
            <div class="detail-item">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
              <span>De: {{ draggedFromHour }} → A: {{ confirmToHour }}</span>
            </div>
            <div class="detail-item">
              <i class="fa-solid fa-calendar-day"></i>
              <span>Fecha: {{ formatDate(currentDateStr) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" @click="cancelarMovimiento" no-caps />
          <q-btn
            unelevated
            label="Confirmar"
            color="primary"
            @click="confirmarMovimiento"
            :loading="moviendo"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCitaStore } from 'stores/citaStore'
import { useReserveStore } from 'stores/reservaStore'
import { useSucursalStore } from 'stores/sucursalStore'
import { useAuthStore } from 'stores/authStore'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const citaStore = useCitaStore()
const reservaStore = useReserveStore()
const sucursalStore = useSucursalStore()
const authStore = useAuthStore()

// Estado
const sucursalSeleccionada = ref(null)
const currentDate = ref(new Date())
const draggedEvent = ref(null)
const draggedFromHour = ref(null)
const showConfirmDialog = ref(false)
const confirmToHour = ref('')
const moviendo = ref(false)
const showBloqueoDialog = ref(false)
const horarioABloquear = ref('')
const notasBloqueo = ref('')
const bloqueando = ref(false)

// Horarios laborales (8-11, 14-17)
const horariosDisponibles = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

// Computed
const sucursalesActivas = computed(() => sucursalStore.sucursalesActivas || [])

const currentDateStr = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const dayName = computed(() => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[currentDate.value.getDay()]
})

const dayTitle = computed(() => {
  return `${currentDate.value.getDate()} de ${currentDate.value.toLocaleString('es-ES', { month: 'long' })} de ${currentDate.value.getFullYear()}`
})



const citasDelDia = computed(() => {
  if (!sucursalSeleccionada.value) return []
  const normalizeDate = (date) =>
    new Date(date).toISOString().split('T')[0]

  return citaStore.citas.filter(c =>
    c.state === 1 &&
    c.sucursal_id === sucursalSeleccionada.value.id &&
    normalizeDate(c.fecha) === currentDateStr.value
  )
})

const reservasDelDia = computed(() => {
  if (!sucursalSeleccionada.value) return []
  const normalizeDate = (date) =>
    new Date(date).toISOString().split('T')[0]
  return reservaStore.reservas.filter(r => 
    r.state === 'active' &&
    r.sucursal_id === sucursalSeleccionada.value.id &&
    normalizeDate(r.fecha_reserva) === currentDateStr.value
  )
})

// Funciones
const seleccionarSucursal = (sucursal) => {
  sucursalSeleccionada.value = sucursal
  cargarDatos()
}

const cambiarSucursal = () => {
  sucursalSeleccionada.value = null
}

const cargarDatos = async () => {
  try {
    await Promise.all([
      citaStore.cargarCitas(),
      reservaStore.cargarDatos()
    ])
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

const getEventosEnHora = (hora) => {
  const eventos = []
  
  // Citas
  citasDelDia.value.forEach(cita => {
    const horaCita = cita.hora ? cita.hora.substring(0, 5) : ''
    if (horaCita === hora) {
      eventos.push({
        id: cita.id,
        type: 'cita',
        titulo: cita.asunto || 'Cita',
        subtitulo: cita.paciente_nombre || '',
        data: cita
      })
    }
  })
  
  // Reservas
  reservasDelDia.value.forEach(reserva => {
    const horaReserva = reserva.hora_reserva ? reserva.hora_reserva.substring(0, 5) : ''
    if (horaReserva === hora) {
      eventos.push({
        id: reserva.id,
        type: 'reserva',
        titulo: reserva.titular_nombre || 'Reserva',
        subtitulo: reserva.servicio_nombre || '',
        data: reserva
      })
    }
  })

  console.log(`Eventos en hora ${hora}:`, eventos)
  return eventos
}

const esReservaBloqueada = (evento) => {
  if (evento.type !== 'reserva') return false
  return evento.data.user_id === authStore.user.id && authStore.userRole === 'ADMIN'
}

const getTipoLabel = (evento) => {
  if (evento.type === 'cita') return 'Cita'
  if (esReservaBloqueada(evento)) return 'Bloqueado'
  return 'Reserva'
}

const handleCellClick = (hora) => {
  if (getEventosEnHora(hora).length === 0) {
    horarioABloquear.value = hora
    notasBloqueo.value = ''
    showBloqueoDialog.value = true
  }
}

const handleCellDoubleClick = async (hora) => {
  const eventos = getEventosEnHora(hora)
  const reservaBloqueada = eventos.find(e => esReservaBloqueada(e))
  
  if (reservaBloqueada) {
    $q.dialog({
      title: 'Desbloquear Horario',
      message: '¿Desea desbloquear este horario?',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        await reservaStore.hardDelete(reservaBloqueada.id)
        await cargarDatos()
        $q.notify({
          type: 'positive',
          message: 'Horario desbloqueado'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al desbloquear horario' + error.message
        })
      }
    })
  }
}

const bloquearHorario = async () => {
  bloqueando.value = true
  try {
    const datosReserva = {
      dependiente_id: null,
      servicio_id: 1,
      sucursal_id: sucursalSeleccionada.value.id,
      fecha_reserva: currentDateStr.value,
      hora_reserva: horarioABloquear.value,
      notas: notasBloqueo.value || 'Horario bloqueado por administrador',
    }
    
    const resultado = await reservaStore.crearReserva(datosReserva)
    
    if (resultado.success) {
      await cargarDatos()
      showBloqueoDialog.value = false
      $q.notify({
        type: 'positive',
        message: 'Horario bloqueado exitosamente'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al bloquear horario' + error.message
    })
  } finally {
    bloqueando.value = false
  }
}

const onDragStart = (evento, hora, e) => {
  if (evento.type !== 'cita') {
    e.preventDefault()
    return
  }
  draggedEvent.value = evento
  draggedFromHour.value = hora
}

const onDrop = (hora, e) => {
  e.preventDefault()
  if (!draggedEvent.value || draggedEvent.value.type !== 'cita') return
  
  if (getEventosEnHora(hora).length > 0) {
    $q.notify({
      type: 'warning',
      message: 'El horario ya está ocupado'
    })
    return
  }
  
  confirmToHour.value = hora
  showConfirmDialog.value = true
}

const confirmarMovimiento = async () => {
  moviendo.value = true
  try {
    const citaActualizada = {
      ...draggedEvent.value.data,
      hora: confirmToHour.value
    }
    
    await citaStore.actualizarCita(citaActualizada)
    await cargarDatos()
    
    showConfirmDialog.value = false
    draggedEvent.value = null
    draggedFromHour.value = null
    
    $q.notify({
      type: 'positive',
      message: 'Cita reprogramada exitosamente'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al mover la cita' + error.message
    })
  } finally {
    moviendo.value = false
  }
}

const cancelarMovimiento = () => {
  showConfirmDialog.value = false
  draggedEvent.value = null
  draggedFromHour.value = null
}

const prevDay = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 1))
  cargarDatos()
}

const nextDay = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 1))
  cargarDatos()
}

const goToToday = () => {
  currentDate.value = new Date()
  cargarDatos()
}

const goToWeek = () => router.push('/calendar/week')
const goToMonth = () => router.push('/calendar/month')
const salir = () => router.push('/calendar')

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

onMounted(async () => {
  await sucursalStore.listar()
})
</script>

<style scoped>
.calendar-day-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Selector de Sucursal */
.sucursal-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.selector-card {
  max-width: 900px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.selector-header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 2rem;
  margin-bottom: 8px;
}

.selector-header i {
  font-size: 2.5rem;
}

.selector-header h2 {
  margin: 0;
  font-weight: 700;
}

.selector-subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 1.1rem;
}

.sucursales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.sucursal-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 12px;
  border: 2px solid transparent;
}

.sucursal-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.sucursal-content {
  text-align: center;
}

.sucursal-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 16px;
}

.sucursal-name {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #2c3e50;
}

.sucursal-location {
  font-size: 0.95rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* Header */
.calendar-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.3;
}

.header-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.header-shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
}

.header-shape-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -60px;
}

.header-shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 30%;
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  font-size: 2.2rem;
}

.page-title {
  font-size: 2rem;
  margin: 0;
  font-weight: 700;
}

.page-subtitle {
  margin: 6px 0 0 0;
  opacity: 0.95;
  font-size: 1.05rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.stat-icon-container {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.stat-icon-container.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon-container.today {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon-container.upcoming {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin-top: 4px;
}

/* Navigation */
.navigation-section {
  padding: 0 24px 24px;
}

.navigation-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.day-navigation {
  display: flex;
  align-items: center;
  gap: 24px;
}

.current-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.day-display {
  font-weight: 600;
  font-size: 1.15rem;
  color: #2c3e50;
}

/* Calendar Grid */
.main-container {
  padding: 0 24px 24px;
}

.table-header {
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.table-title {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
}

.legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #2c3e50;
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.legend-color.cita {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.legend-color.reserva {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.legend-color.bloqueado {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
}

.day-grid-container {
  background: white;
  border-radius: 0 0 16px 16px;
  overflow-x: auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.day-grid {
  min-width: 700px;
}

.day-header-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  border-bottom: 2px solid #e0e0e0;
}

.time-header-cell,
.day-header-cell {
  padding: 20px;
  font-weight: 600;
  background: #f8f9fa;
}

.day-header-content {
  text-align: center;
}

.day-name {
  font-size: 1.15rem;
  color: #667eea;
  font-weight: 700;
}

.day-date {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 8px 0;
  color: #2c3e50;
}

.day-month {
  font-size: 0.95rem;
  color: #7f8c8d;
}

.time-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  border-bottom: 1px solid #e0e0e0;
  min-height: 90px;
}

.time-slot-label {
  padding: 16px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e0e0e0;
}

.time-display {
  font-weight: 600;
  font-size: 1.2rem;
  color: #2c3e50;
}

.time-slot-content {
  padding: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.time-slot-content:hover {
  background: #f8f9fa;
}

.slot-inner {
  min-height: 66px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-time-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #95a5a6;
  gap: 8px;
  font-size: 0.95rem;
}

.empty-time-slot i {
  font-size: 1.5rem;
}

.event-card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid;
  cursor: move;
  transition: all 0.3s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.event-card.cita {
  border-left-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.event-card.reserva {
  border-left-color: #f5576c;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.05) 100%);
}

.event-card.bloqueado-admin {
  border-left-color: #7f8c8d;
  background: linear-gradient(135deg, rgba(127, 140, 141, 0.1) 0%, rgba(149, 165, 166, 0.05) 100%);
  opacity: 0.9;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-type-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-type-badge.cita {
  background: #667eea;
}

.event-type-badge.reserva {
  background: #f5576c;
}

.event-type-badge.bloqueado-admin {
  background: #7f8c8d;
}

.event-time {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.event-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: #2c3e50;
  margin-bottom: 4px;
}

.event-subtitle {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Dialogs */
.bloqueo-dialog,
.confirm-dialog {
  min-width: 450px;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-header-content i {
  font-size: 1.8rem;
}

.dialog-header-content h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.4rem;
}

.bloqueo-info,
.move-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item,
.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #2c3e50;
}

.info-item i,
.detail-item i {
  color: #667eea;
  width: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .sucursales-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .navigation-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .day-navigation {
    flex-direction: column;
    width: 100%;
  }
  
  .table-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .legend {
    flex-wrap: wrap;
  }
  
  .bloqueo-dialog,
  .confirm-dialog {
    min-width: 90vw;
  }
}
</style>