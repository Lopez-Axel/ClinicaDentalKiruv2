<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="detail-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-title">
            <i class="fa-solid fa-calendar-day"></i>
            <span>Detalles de la Cita</span>
          </div>
          <q-btn
            flat
            round
            dense
            icon="fa-solid fa-times"
            v-close-popup
            class="close-btn"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Content -->
      <q-card-section class="dialog-content">
        <div v-if="!quote" class="no-data">
          <i class="fa-solid fa-exclamation-circle"></i>
          <p>No hay información disponible</p>
        </div>

        <div v-else class="quote-details">
          <!-- Asunto -->
          <div class="detail-row highlight">
            <div class="detail-label">
              <i class="fa-solid fa-comment-medical"></i>
              <span>Asunto</span>
            </div>
            <div class="detail-value">{{ quote.asunto }}</div>
          </div>

          <!-- Tipo de Cita -->
          <div class="detail-row">
            <div class="detail-label">
              <i class="fa-solid fa-stethoscope"></i>
              <span>Tipo de Cita</span>
            </div>
            <div class="detail-value">
              <q-badge :color="getTipoCitaColor(quote.tipo_cita)">
                {{ getTipoCitaLabel(quote.tipo_cita) }}
              </q-badge>
            </div>
          </div>

          <q-separator spaced />

          <!-- Paciente -->
          <div class="detail-row">
            <div class="detail-label">
              <i class="fa-solid fa-user-injured"></i>
              <span>Paciente</span>
            </div>
            <div class="detail-value">
              <div class="person-info">
                <div class="person-avatar">
                  {{ getPatientInitials(quote.paciente_id) }}
                </div>
                <span>{{ getPacienteName(quote.paciente_id) }}</span>
              </div>
            </div>
          </div>

          <!-- Dentista -->
          <div class="detail-row">
            <div class="detail-label">
              <i class="fa-solid fa-user-md"></i>
              <span>Dentista</span>
            </div>
            <div class="detail-value">
              <div class="person-info">
                <div class="person-avatar dentist">
                  {{ getDentistInitials(quote.dentista_id) }}
                </div>
                <span>{{ getDentistaName(quote.dentista_id) }}</span>
              </div>
            </div>
          </div>

          <!-- Sucursal (si existe) -->
          <div v-if="quote.sucursal_id" class="detail-row">
            <div class="detail-label">
              <i class="fa-solid fa-building"></i>
              <span>Sucursal</span>
            </div>
            <div class="detail-value">{{ getSucursalName(quote.sucursal_id) }}</div>
          </div>

          <q-separator spaced />

          <!-- Fecha -->
          <div class="detail-row">
            <div class="detail-label">
              <i class="fa-solid fa-calendar"></i>
              <span>Fecha</span>
            </div>
            <div class="detail-value">{{ formatearFecha(quote.fecha) }}</div>
          </div>

          <!-- Hora -->
          <div class="detail-row">
            <div class="detail-label">
              <i class="fa-solid fa-clock"></i>
              <span>Hora</span>
            </div>
            <div class="detail-value">{{ formatearHora(quote.hora) }}</div>
          </div>

          <q-separator spaced />

          <!-- Notas -->
          <div v-if="quote.notas" class="detail-row full-width">
            <div class="detail-label">
              <i class="fa-solid fa-sticky-note"></i>
              <span>Notas</span>
            </div>
            <div class="detail-value notes">{{ quote.notas }}</div>
          </div>

          <!-- Fechas del sistema -->
          <div class="system-info">
            <div class="detail-row small">
              <div class="detail-label">
                <i class="fa-solid fa-calendar-plus"></i>
                <span>Creada</span>
              </div>
              <div class="detail-value">{{ formatearFechaHora(quote.created_at) }}</div>
            </div>

            <div v-if="quote.updated_at !== quote.created_at" class="detail-row small">
              <div class="detail-label">
                <i class="fa-solid fa-calendar-check"></i>
                <span>Actualizada</span>
              </div>
              <div class="detail-value">{{ formatearFechaHora(quote.updated_at) }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="dialog-actions">
        <q-btn
          flat
          label="Cerrar"
          v-close-popup
          class="secondary-btn"
          no-caps
        />
        <q-btn
          flat
          label="Editar Cita"
          icon="fa-solid fa-edit"
          @click="editQuote"
          class="primary-btn"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { computed } from 'vue'
import { usePacienteStore } from 'stores/pacienteStore'
import { useDentistaStore } from 'stores/dentistaStore'
import { useSucursalStore } from 'stores/sucursalStore'

export default {
  name: 'DetailQuoteDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    quote: {
      type: Object,
      default: () => null
    }
  },
  emits: ['update:modelValue', 'edit-quote'],
  setup(props, { emit }) {
    const pacienteStore = usePacienteStore()
    const dentistaStore = useDentistaStore()
    const sucursalStore = useSucursalStore()

    const showDialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // Obtener nombre del paciente
    const getPacienteName = (id) => {
      const paciente = pacienteStore.pacientes.find(p => p.id === id)
      if (!paciente) return 'Paciente no encontrado'
      return pacienteStore.getNombreCompleto(paciente)
    }

    // Obtener nombre del dentista
    const getDentistaName = (id) => {
      const dentista = dentistaStore.dentistas.find(d => d.id === id)
      if (!dentista) return 'Dentista no encontrado'
      return `${dentista.nombre} ${dentista.apellido_paterno || ''}`.trim()
    }

    const getSucursalName = (id) => {
      const sucursal = sucursalStore.sucursales.find(s => s.id === id)
      if (!sucursal) return 'Sucursal no encontrada'
      return `${sucursal.nombre}`
    }

    // Obtener iniciales del paciente
    const getPatientInitials = (id) => {
      const paciente = pacienteStore.pacientes.find(p => p.id === id)
      if (!paciente) return '?'
      const firstName = paciente.nombre?.charAt(0) || ''
      const lastName = paciente.apellido_paterno?.charAt(0) || ''
      return (firstName + lastName).toUpperCase() || 'P'
    }

    // Obtener iniciales del dentista
    const getDentistInitials = (id) => {
      const dentista = dentistaStore.dentistas.find(d => d.id === id)
      if (!dentista) return '?'
      const firstName = dentista.nombre?.charAt(0) || ''
      const lastName = dentista.apellido_paterno?.charAt(0) || ''
      return (firstName + lastName).toUpperCase() || 'D'
    }

    // Formatear fecha
    const formatearFecha = (fecha) => {
      if (!fecha) return 'No disponible'
      try {
        return new Date(fecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch {
        return 'Fecha inválida'
      }
    }

    // Formatear hora
    const formatearHora = (hora) => {
      if (!hora) return 'No disponible'
      return hora.substring(0, 5) // HH:MM
    }

    // Formatear fecha y hora (para created_at y updated_at)
    const formatearFechaHora = (fechaHora) => {
      if (!fechaHora) return 'No disponible'
      try {
        return new Date(fechaHora).toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return 'Fecha inválida'
      }
    }

    // Tipo de cita helpers
    const getTipoCitaColor = (tipo) => {
      const colors = {
        'consulta': 'blue',
        'control': 'green',
        'seguimiento': 'orange',
        'urgencia': 'red',
        'cirugia': 'purple',
        'otro': 'grey'
      }
      return colors[tipo] || 'grey'
    }

    const getTipoCitaLabel = (tipo) => {
      const labels = {
        'consulta': 'Consulta',
        'control': 'Control',
        'seguimiento': 'Seguimiento',
        'urgencia': 'Urgencia',
        'cirugia': 'Cirugía',
        'otro': 'Otro'
      }
      return labels[tipo] || tipo
    }

    const editQuote = () => {
      emit('edit-quote', props.quote)
      showDialog.value = false
    }

    return {
      showDialog,
      getPacienteName,
      getDentistaName,
      getSucursalName,
      getPatientInitials,
      getDentistInitials,
      formatearFecha,
      formatearHora,
      formatearFechaHora,
      getTipoCitaColor,
      getTipoCitaLabel,
      editQuote
    }
  }
}
</script>

<style scoped>
.detail-dialog {
  min-width: 600px;
  max-width: 700px;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-title i {
  font-size: 1.5rem;
}

.close-btn {
  color: white;
}

.dialog-content {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

.quote-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.detail-row:hover {
  background: #e9ecef;
  transform: translateX(2px);
}

.detail-row.highlight {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 4px solid #667eea;
}

.detail-row.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.detail-row.small {
  padding: 8px 12px;
  font-size: 0.9rem;
  opacity: 0.8;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #495057;
  min-width: 140px;
}

.detail-label i {
  color: #667eea;
  width: 20px;
  text-align: center;
}

.detail-value {
  color: #212529;
  font-weight: 500;
  text-align: right;
}

.detail-value.notes {
  text-align: left;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
}

.person-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.person-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.person-avatar.dentist {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.system-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px dashed #dee2e6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-actions {
  padding: 16px 24px;
  justify-content: space-between;
}

.secondary-btn {
  color: #6c757d;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover {
  opacity: 0.9;
}

/* Scrollbar personalizado */
.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 10px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-dialog {
    min-width: 90vw;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-label {
    min-width: auto;
  }

  .detail-value {
    text-align: left;
    width: 100%;
  }
}
</style>