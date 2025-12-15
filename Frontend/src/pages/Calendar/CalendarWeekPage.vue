<template>
  <div class="calendar-week-container">
    <!-- Selector de Sucursal -->
    <div v-if="!sucursalSeleccionada" class="sucursal-selector">
      <q-card class="selector-card">
        <q-card-section class="selector-header-section">
          <div class="selector-header">
            <i class="fa-solid fa-building"></i>
            <h2>Selecciona una Sucursal</h2>
          </div>
          <p class="selector-subtitle">Elige la sucursal para ver su calendario semanal</p>
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

    <!-- Calendario Semanal -->
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
              <i class="fa-solid fa-calendar-week header-icon"></i>
            </div>
            <div>
              <h1 class="page-title">Calendario Semanal</h1>
              <p class="page-subtitle">{{ sucursalSeleccionada.nombre }} - {{ weekRange }}</p>
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
            <div class="stat-value">{{ citasDeLaSemana.length }}</div>
            <div class="stat-label">Citas de la Semana</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-container today">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ reservasDeLaSemana.length }}</div>
            <div class="stat-label">Reservas de la Semana</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-container upcoming">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ weekNumber }}</div>
            <div class="stat-label">Semana del Año</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="navigation-section">
        <div class="navigation-container">
          <div class="week-navigation">
            <q-btn
              flat
              icon="fa-solid fa-chevron-left"
              label="Semana Anterior"
              @click="prevWeek"
              color="primary"
              no-caps
              size="md"
            />
            
            <div class="current-week">
              <span class="week-display">{{ weekRange }}</span>
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
              label="Semana Siguiente"
              @click="nextWeek"
              color="primary"
              no-caps
              size="md"
            />
          </div>

          <div class="view-switcher">
            <q-btn-group outline>
              <q-btn outline label="Día" @click="goToDay" color="grey-7" no-caps />
              <q-btn outline label="Semana" color="primary" no-caps />
              <q-btn outline label="Mes" @click="goToMonth" color="grey-7" no-caps />
            </q-btn-group>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="main-container">
        <div class="table-header">
          <div class="table-title-section">
            <h3 class="table-title">Vista Semanal</h3>
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

        <div class="week-grid-container">
          <div class="week-grid">
            <!-- Header Row -->
            <div class="week-header-row">
              <div class="week-header-cell" v-for="dia in diasSemana" :key="dia.dateStr">
                <div class="day-name">{{ dia.nombre }}</div>
                <div class="day-number" :class="{ 'today': esHoy(dia.dateStr) }">{{ dia.numero }}</div>
              </div>
            </div>

            <!-- Events Grid -->
            <div class="week-events-grid">
              <div
                v-for="dia in diasSemana"
                :key="dia.dateStr"
                class="day-column"
                @dragover.prevent
                @drop="onDropDay(dia.dateStr, $event)"
              >
                <div class="day-events">
                  <template v-if="getEventosDelDia(dia.dateStr).length">
                    <div
                      v-for="evento in getEventosDelDia(dia.dateStr)"
                      :key="evento.id + '-' + evento.type"
                      class="event-item"
                      :class="[evento.type, { 'bloqueado-admin': esReservaBloqueada(evento) }]"
                      draggable="true"
                      @dragstart="onDragStart(evento, $event)"
                    >
                      <div class="event-time">{{ evento.hora }}</div>
                      <div class="event-title">{{ evento.titulo }}</div>
                      <div class="event-badge" :class="evento.type">
                        {{ getTipoLabel(evento) }}
                      </div>
                    </div>
                  </template>
                  <div v-else class="no-events">
                    Sin eventos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog: Confirmar Mover -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-header-content">
            <i class="fa-solid fa-arrows-alt"></i>
            <h3>Confirmar Cambio de Fecha</h3>
          </div>
        </q-card-section>

        <q-card-section>
          <p>¿Desea mover esta cita?</p>
          <div class="move-details">
            <div class="detail-item">
              <i class="fa-solid fa-calendar-day"></i>
              <span>De: {{ formatDate(draggedFromDate) }}</span>
            </div>
            <div class="detail-item">
              <i class="fa-solid fa-arrow-right"></i>
              <span>A: {{ formatDate(confirmToDate) }}</span>
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
const currentWeekStart = ref(getMonday(new Date()))
const draggedEvent = ref(null)
const draggedFromDate = ref('')
const showConfirmDialog = ref(false)
const confirmToDate = ref('')
const moviendo = ref(false)

// Computed
const sucursalesActivas = computed(() => sucursalStore.sucursalesActivas || [])

const formatLocalDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeDateStr = (input) =>
  formatLocalDate(input)

const diasSemana = computed(() => {
  const dias = []
  const nombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(currentWeekStart.value)
    fecha.setDate(fecha.getDate() + i)
    
    const dateStr = formatLocalDate(fecha)
    
    dias.push({
      nombre: nombres[i],
      numero: fecha.getDate(),
      dateStr: dateStr,
      fecha: fecha
    })
  }
  
  return dias
})

const weekRange = computed(() => {
  const inicio = diasSemana.value[0].fecha
  const fin = diasSemana.value[6].fecha
  
  const mesInicio = inicio.toLocaleString('es-ES', { month: 'short' })
  const mesFin = fin.toLocaleString('es-ES', { month: 'short' })
  
  if (mesInicio === mesFin) {
    return `${inicio.getDate()} - ${fin.getDate()} ${mesFin} ${inicio.getFullYear()}`
  } else {
    return `${inicio.getDate()} ${mesInicio} - ${fin.getDate()} ${mesFin} ${inicio.getFullYear()}`
  }
})

const weekNumber = computed(() => {
  const fecha = new Date(currentWeekStart.value)
  const startOfYear = new Date(fecha.getFullYear(), 0, 1)
  const days = Math.floor((fecha - startOfYear) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
})

const citasDeLaSemana = computed(() => {
  if (!sucursalSeleccionada.value) return []
  const inicio = diasSemana.value[0].dateStr
  const fin = diasSemana.value[6].dateStr
  
  return citaStore.citas.filter(c => 
    c.state === 1 &&
    c.sucursal_id === sucursalSeleccionada.value.id &&
    normalizeDateStr(c.fecha) >= inicio &&
    normalizeDateStr(c.fecha) <= fin
  )
})

const reservasDeLaSemana = computed(() => {
  if (!sucursalSeleccionada.value) return []
  const inicio = diasSemana.value[0].dateStr
  const fin = diasSemana.value[6].dateStr
  
  return reservaStore.reservas.filter(r => 
    r.state === 'active' &&
    r.sucursal_id === sucursalSeleccionada.value.id &&
    normalizeDateStr(r.fecha_reserva) >= inicio &&
    normalizeDateStr(r.fecha_reserva) <= fin
  )
})

// Funciones
function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

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

const getEventosDelDia = (dateStr) => {
  const eventos = []
  
  // Citas
  citasDeLaSemana.value.forEach(cita => {
    if (normalizeDateStr(cita.fecha) === dateStr) {
      eventos.push({
        id: cita.id,
        type: 'cita',
        titulo: cita.asunto || 'Cita',
        hora: cita.hora ? cita.hora.substring(0, 5) : '',
        data: cita
      })
    }
  })
  
  // Reservas
  reservasDeLaSemana.value.forEach(reserva => {
    if (normalizeDateStr(reserva.fecha_reserva) === dateStr){
      eventos.push({
        id: reserva.id,
        type: 'reserva',
        titulo: reserva.titular_nombre || 'Reserva',
        hora: reserva.hora_reserva ? reserva.hora_reserva.substring(0, 5) : '',
        data: reserva
      })
    }
  })
  console.log(`Eventos del día ${dateStr}:`, eventos)
  return eventos.sort((a, b) => a.hora.localeCompare(b.hora))
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

const esHoy = (dateStr) => {
  const hoy = new Date().toISOString().split('T')[0]
  return dateStr === hoy
}

const onDragStart = (evento, e) => {
  if (evento.type !== 'cita') {
    e.preventDefault()
    return
  }
  draggedEvent.value = evento
  draggedFromDate.value = normalizeDateStr(evento.data.fecha)
}

const onDropDay = (dateStr, e) => {
  e.preventDefault()
  if (!draggedEvent.value || draggedEvent.value.type !== 'cita') return
  
  if (draggedFromDate.value === dateStr) {
    return
  }
  
  confirmToDate.value = dateStr
  showConfirmDialog.value = true
}

const confirmarMovimiento = async () => {
  moviendo.value = true
  try {
    const citaActualizada = {
      ...draggedEvent.value.data,
      fecha: confirmToDate.value
    }
    
    await citaStore.actualizarCita(citaActualizada)
    await cargarDatos()
    
    showConfirmDialog.value = false
    draggedEvent.value = null
    draggedFromDate.value = ''
    
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
  draggedFromDate.value = ''
}

const prevWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
  cargarDatos()
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
  cargarDatos()
}

const goToToday = () => {
  currentWeekStart.value = getMonday(new Date())
  cargarDatos()
}

const goToDay = () => router.push('/calendar/day')
const goToMonth = () => router.push('/calendar/month')
const salir = () => router.push('/calendar')

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
}

onMounted(async () => {
  await sucursalStore.listar()
})
</script>

<style scoped>
.calendar-week-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Reutilizar estilos del selector de CalendarDayPage */
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

.week-navigation {
  display: flex;
  align-items: center;
  gap: 24px;
}

.current-week {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.week-display {
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

.week-grid-container {
  background: white;
  border-radius: 0 0 16px 16px;
  overflow-x: auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 20px;
}

.week-grid {
  min-width: 900px;
}

.week-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.week-header-cell {
  text-align: center;
  padding: 16px 8px;
  background: #f8f9fa;
  border-radius: 12px;
}

.day-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #667eea;
  margin-bottom: 8px;
}

.day-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.day-number.today {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.week-events-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  min-height: 400px;
}

.day-column {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  min-height: 400px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid;
  cursor: move;
  transition: all 0.3s;
}

.event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.event-item.cita {
  border-left-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.event-item.reserva {
  border-left-color: #f5576c;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.05) 100%);
}

.event-item.bloqueado-admin {
  border-left-color: #7f8c8d;
  background: linear-gradient(135deg, rgba(127, 140, 141, 0.1) 0%, rgba(149, 165, 166, 0.05) 100%);
}

.event-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
}

.event-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.event-badge.cita {
  background: #667eea;
}

.event-badge.reserva {
  background: #f5576c;
}

.event-badge.bloqueado-admin {
  background: #7f8c8d;
}

.no-events {
  text-align: center;
  color: #95a5a6;
  padding: 20px;
  font-size: 0.9rem;
}

/* Dialogs */
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

.move-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #2c3e50;
}

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
  
  .week-navigation {
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
  
  .week-grid-container {
    overflow-x: scroll;
  }
  
  .confirm-dialog {
    min-width: 90vw;
  }
}
</style>