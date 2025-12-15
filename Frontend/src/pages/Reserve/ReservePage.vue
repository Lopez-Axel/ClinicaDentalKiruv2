<template>
  <div class="reserve-page-container">
    <!-- Header Section -->
    <div class="reserve-page-header">
      <div class="reserve-header-background">
        <div class="reserve-header-shape reserve-header-shape-1"></div>
        <div class="reserve-header-shape reserve-header-shape-2"></div>
      </div>
      <div class="reserve-header-content">
        <div class="reserve-title-section">
          <div class="reserve-icon-wrapper">
            <i class="fa-solid fa-calendar-check reserve-header-icon"></i>
          </div>
          <div>
            <h1 class="reserve-page-title">Gestión de Reservas</h1>
            <p class="reserve-page-subtitle">
              {{ isAdmin ? 'Administra todas las reservas de pacientes' : 'Administra tus reservas y las de tus dependientes' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="reserve-stats-section">
      <div class="reserve-stat-card">
        <div class="reserve-stat-icon-container total">
          <i class="fa-solid fa-calendar-days"></i>
        </div>
        <div class="reserve-stat-content">
          <div class="reserve-stat-value">{{ totalReservas }}</div>
          <div class="reserve-stat-label">Total de Reservas</div>
        </div>
        <div class="reserve-stat-glow total"></div>
      </div>
      <div class="reserve-stat-card">
        <div class="reserve-stat-icon-container dependientes">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="reserve-stat-content">
          <div class="reserve-stat-value">{{ reservasConDependientes }}</div>
          <div class="reserve-stat-label">Con Dependientes</div>
        </div>
        <div class="reserve-stat-glow dependientes"></div>
      </div>
      <div class="reserve-stat-card">
        <div class="reserve-stat-icon-container today">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div class="reserve-stat-content">
          <div class="reserve-stat-value">{{ reservasHoy }}</div>
          <div class="reserve-stat-label">Reservas Hoy</div>
        </div>
        <div class="reserve-stat-glow today"></div>
      </div>
      <div class="reserve-stat-card">
        <div class="reserve-stat-icon-container pending">
          <i class="fa-solid fa-hourglass-half"></i>
        </div>
        <div class="reserve-stat-content">
          <div class="reserve-stat-value">{{ reservasPendientes }}</div>
          <div class="reserve-stat-label">Pendientes</div>
        </div>
        <div class="reserve-stat-glow pending"></div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="reserve-search-section">
      <div class="reserve-search-container">
        <q-input
          v-model="search"
          class="reserve-search-input"
          outlined
          type="search"
          placeholder="Buscar por nombre, email, dependiente o fecha..."
          @input="filterRows"
          clearable
        >
          <template v-slot:prepend>
            <i class="fa-solid fa-search reserve-search-icon"></i>
          </template>
          <template v-slot:append>
            <q-icon 
              v-if="search" 
              name="fa-solid fa-filter" 
              class="text-primary"
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargandoHistorial" class="reserve-loading-state">
      <q-spinner size="50px" color="primary" />
      <p>Cargando reservas...</p>
    </div>

    <!-- Table Section -->
    <div v-else class="reserve-table-container">
      <div class="reserve-table-header">
        <div class="reserve-table-title-section">
          <h3 class="reserve-table-title">Lista de Reservas</h3>
          <div class="reserve-table-underline"></div>
        </div>
        <div class="reserve-results-count">
          <span class="reserve-count-badge">
            <i class="fa-solid fa-list-check"></i>
            {{ filteredRows.length }} reserva{{ filteredRows.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <q-table
        class="reserve-data-table"
        flat
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :rows-per-page-options="[5, 10, 15, 20, 0]"
        :pagination="{ rowsPerPage: 10 }"
        separator="cell"
      >
        <template v-slot:no-data>
          <div class="reserve-no-data-container">
            <div class="reserve-no-data-illustration">
              <i class="fa-solid fa-calendar-xmark reserve-no-data-icon"></i>
              <div class="reserve-no-data-circle reserve-no-data-circle-1"></div>
              <div class="reserve-no-data-circle reserve-no-data-circle-2"></div>
            </div>
            <p class="reserve-no-data-text">No se encontraron reservas</p>
            <p class="reserve-no-data-subtext">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </template>

        <template v-slot:body-cell-fechaReserva="props">
          <q-td :props="props">
            <div class="reserve-date-info">
              <div class="reserve-date-icon">
                <i class="fa-solid fa-calendar-day"></i>
              </div>
              <div class="reserve-date-content">
                <div class="reserve-date-label">Fecha</div>
                <div class="reserve-date-value">{{ formatDate(props.row.fecha_reserva) }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-horaReserva="props">
          <q-td :props="props">
            <div class="reserve-time-info">
              <div class="reserve-time-icon">
                <i class="fa-solid fa-clock"></i>
              </div>
              <div class="reserve-time-content">
                <div class="reserve-time-label">Hora</div>
                <div class="reserve-time-value">{{ formatTime(props.row.hora_reserva) }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-nombreCompleto="props">
          <q-td :props="props">
            <div class="reserve-patient-info">
              <div class="reserve-patient-main">
                <div class="reserve-patient-avatar">
                  {{ getPatientInitials(props.row.titular_nombre) }}
                </div>
                <div class="reserve-patient-content">
                  <div class="reserve-patient-name">{{ props.row.titular_nombre }}</div>
                  <div class="reserve-patient-email">
                    <i class="fa-solid fa-envelope"></i>
                    {{ props.row.titular_email }}
                  </div>
                </div>
              </div>
              <div v-if="props.row.dependiente_nombre" class="reserve-dependiente-info">
                <div class="reserve-dependiente-badge">
                  <i class="fa-solid fa-user-friends"></i>
                  Dependiente: {{ props.row.dependiente_nombre }}
                </div>
                <div v-if="props.row.parentesco" class="reserve-dependiente-relation">
                  <i class="fa-solid fa-heart"></i>
                  {{ props.row.parentesco }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-servicio="props">
          <q-td :props="props">
            <div class="reserve-service-badge">
              <i class="fa-solid fa-stethoscope"></i>
              {{ props.row.servicio_nombre }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-sucursal="props">
          <q-td :props="props">
            <div class="reserve-branch-info">
              <div class="reserve-branch-icon">
                <i class="fa-solid fa-map-marker-alt"></i>
              </div>
              <div class="reserve-branch-content">
                <div class="reserve-branch-label">Sucursal</div>
                <div class="reserve-branch-value">{{ props.row.sucursal_nombre }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge 
              :color="getEstadoColor(props.row.estado)" 
              :label="formatEstado(props.row.estado)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="reserve-action-buttons">
              <q-btn
                class="reserve-action-btn reserve-view-btn"
                flat
                dense
                round
                icon="fa-solid fa-eye"
                size="sm"
                @click="viewReserve(props.row)"
                color="grey-8"
              >
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
              <q-btn
                v-if="isAdmin && props.row.estado === 'pendiente'"
                class="reserve-action-btn reserve-confirm-btn"
                flat
                dense
                round
                icon="fa-solid fa-check"
                size="sm"
                @click="confirmReserve(props.row)"
                color="positive"
              >
                <q-tooltip>Confirmar reserva</q-tooltip>
              </q-btn>
              <q-btn
                v-if="isAdmin && props.row.estado === 'pendiente'"
                class="reserve-action-btn reserve-reject-btn"
                flat
                dense
                round
                icon="fa-solid fa-ban"
                size="sm"
                @click="confirmRejectReserve(props.row)"
                color="negative"
              >
                <q-tooltip>Rechazar reserva</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Dialogs -->
    <DetailReserveDialog
      v-model="showDetailDialog"
      :reserveData="selectedReserve"
      @refresh="loadReservas"
    />

    <q-dialog v-model="showRejectDialog">
      <q-card class="reserve-reject-dialog">
        <q-card-section class="reserve-dialog-header">
          <div class="reserve-dialog-icon-container">
            <i class="fa-solid fa-exclamation-triangle"></i>
          </div>
          <div class="reserve-dialog-title">Rechazar Reserva</div>
          <p class="reserve-dialog-subtitle">
            ¿Está seguro de rechazar la reserva de
            <strong>{{ selectedReserve?.titular_nombre }}</strong>?
          </p>
        </q-card-section>

        <q-card-section class="reserve-dialog-content">
          <q-input
            v-model="rejectMotivo"
            type="textarea"
            label="Motivo del rechazo"
            outlined
            rows="3"
            class="reserve-dialog-textarea"
          />
        </q-card-section>

        <q-card-actions class="reserve-dialog-actions">
          <q-btn 
            flat 
            label="Cancelar" 
            color="grey-7" 
            v-close-popup 
            no-caps
            class="reserve-dialog-btn"
          />
          <q-btn 
            unelevated
            label="Rechazar Reserva" 
            color="negative" 
            @click="rejectReserve"
            v-close-popup 
            no-caps
            class="reserve-dialog-btn reserve-dialog-reject-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useReserveStore } from 'src/stores/reservaStore'
import { useAuthStore } from 'src/stores/authStore'
import Fuse from 'fuse.js'
import DetailReserveDialog from './DetailReserveDialog.vue'

const columns = [
  {
    name: 'fechaReserva',
    label: 'Fecha',
    align: 'center',
    field: row => row.fecha_reserva,
    sortable: true,
    style: 'width: 140px'
  },
  {
    name: 'horaReserva',
    label: 'Hora',
    align: 'center',
    field: row => row.hora_reserva,
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'nombreCompleto',
    label: 'Paciente',
    align: 'left',
    field: row => row.titular_nombre,
    sortable: true,
    style: 'min-width: 250px'
  },
  {
    name: 'servicio',
    label: 'Servicio',
    align: 'center',
    field: row => row.servicio_nombre,
    sortable: true,
    style: 'width: 160px'
  },
  {
    name: 'sucursal',
    label: 'Sucursal',
    align: 'center',
    field: row => row.sucursal_nombre,
    sortable: true,
    style: 'width: 150px'
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: row => row.estado,
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center',
    sortable: false,
    style: 'width: 180px'
  }
]

const FUSE_OPTIONS = {
  keys: [
    'titular_nombre', 
    'titular_email', 
    'fecha_reserva', 
    'hora_reserva',
    'servicio_nombre',
    'sucursal_nombre',
    'dependiente_nombre',
    'parentesco'
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 1
}

export default {
  name: 'ReserveTable',
  components: {
    DetailReserveDialog,
  },
  setup() {
    const $q = useQuasar()
    const reservaStore = useReserveStore()
    const authStore = useAuthStore()

    const search = ref('')
    const selectedReserve = ref(null)
    const showDetailDialog = ref(false)
    const showRejectDialog = ref(false)
    const rejectMotivo = ref('')
    let fuse = null

    const isAdmin = computed(() => authStore.userRole === 'ADMIN')
    const allReservas = computed(() => reservaStore.reservasCompletas || [])
    const cargandoHistorial = computed(() => reservaStore.cargandoHistorial)
    const filteredRows = ref([])

    const totalReservas = computed(() => reservaStore.totalReservas)
    const reservasPendientes = computed(() => reservaStore.reservasPendientes)

    const reservasConDependientes = computed(() => {
      return allReservas.value.filter(row => row.dependiente_nombre).length
    })

    const reservasHoy = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return allReservas.value.filter(row => row.fecha_reserva === today).length
    })

    const loadReservas = async () => {
      try {
        await reservaStore.cargarDatos()
        filteredRows.value = allReservas.value
        initializeFuse()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al cargar reservas' + error.message,
          position: 'top'
        })
      }
    }

    const initializeFuse = () => {
      fuse = new Fuse(allReservas.value, FUSE_OPTIONS)
    }

    const filterRows = () => {
      if (!search.value?.trim()) {
        filteredRows.value = allReservas.value
        return
      }
      const results = fuse.search(search.value.trim())
      filteredRows.value = results.map(result => result.item)
    }

    const rejectReserve = async () => {
      if (!selectedReserve.value) return
      
      try {
        const resultado = await reservaStore.rechazarReserva(selectedReserve.value.id, rejectMotivo.value)
        rejectMotivo.value = ''
        
        if (resultado.success) {
          $q.notify({
            type: 'positive',
            message: 'Reserva rechazada exitosamente',
            position: 'top',
            icon: 'fa-solid fa-check-circle'
          })
          await loadReservas()
        } else {
          $q.notify({
            type: 'negative',
            message: resultado.message || 'Error al rechazar reserva',
            position: 'top'
          })
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al rechazar reserva' + error.message,
          position: 'top'
        })
      }
    }

    const confirmReserve = async (reserve) => {
      try {
        const resultado = await reservaStore.confirmarReserva(reserve.id)
        
        if (resultado.success) {
          $q.notify({
            type: 'positive',
            message: `Reserva de ${reserve.titular_nombre} confirmada`,
            position: 'top',
            icon: 'fa-solid fa-calendar-check'
          })
          await loadReservas()
        } else {
          $q.notify({
            type: 'negative',
            message: resultado.message || 'Error al confirmar reserva',
            position: 'top'
          })
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al confirmar reserva' + error.message,
          position: 'top'
        })
      }
    }

    const viewReserve = (reserve) => {
      selectedReserve.value = { ...reserve }
      showDetailDialog.value = true
    }

    const confirmRejectReserve = (reserve) => {
      selectedReserve.value = { ...reserve }
      showRejectDialog.value = true
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No disponible'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) {
          const [year, month, day] = dateString.split('-')
          return `${day}/${month}/${year}`
        }
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      } catch {
        return 'Fecha inválida'
      }
    }

    const formatTime = (timeString) => {
      if (!timeString) return 'No disponible'
      try {
        const [hours, minutes] = timeString.split(':')
        return `${hours}:${minutes}`
      } catch {
        return 'Hora inválida'
      }
    }

    const formatEstado = (estado) => {
      const estados = {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'cancelada': 'Cancelada',
        'completada': 'Completada'
      }
      return estados[estado] || estado
    }

    const getEstadoColor = (estado) => {
      const colores = {
        'pendiente': 'warning',
        'confirmada': 'positive',
        'cancelada': 'negative',
        'completada': 'info'
      }
      return colores[estado] || 'grey'
    }

    const getPatientInitials = (name) => {
      if (!name) return '?'
      const words = name.trim().split(' ')
      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase()
      }
      return (words[0][0] + (words[1]?.[0] || '')).toUpperCase()
    }

    onMounted(async () => {
      await loadReservas()
    })

    watch(search, () => {
      filterRows()
    })

    watch(allReservas, () => {
      filteredRows.value = allReservas.value
      initializeFuse()
    })

    return {
      search,
      columns,
      filteredRows,
      selectedReserve,
      showDetailDialog,
      showRejectDialog,
      rejectMotivo,
      isAdmin,
      cargandoHistorial,
      totalReservas,
      reservasConDependientes,
      reservasHoy,
      reservasPendientes,
      filterRows,
      rejectReserve,
      confirmReserve,
      viewReserve,
      confirmRejectReserve,
      formatDate,
      formatTime,
      formatEstado,
      getEstadoColor,
      getPatientInitials,
      loadReservas
    }
  }
}
</script>