<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="detail-dialog">
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-title">
            <i class="fa-solid fa-calendar-day"></i>
            <span>Detalle Reserva</span>
          </div>
          <q-btn
            flat
            round
            dense
            icon="fa-solid fa-times"
            @click="closeDialog"
            class="close-btn"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-content-scrollable">
        <div class="content-wrapper">
          <div class="info-section">
            <div class="section-title">
              <i class="fa-solid fa-info-circle"></i>
              Información de la Reserva
            </div>

            <div class="reserva-row">
              <div class="reserva-box">
                <div class="box-label">Fecha</div>
                <div class="box-value">{{ formatDate(reserveData?.fecha_reserva) }}</div>
              </div>
              <div class="reserva-box">
                <div class="box-label">Hora</div>
                <div class="box-value">{{ formatTime(reserveData?.hora_reserva) }}</div>
              </div>
              <div class="reserva-box">
                <div class="box-label">Estado</div>
                <div class="box-value">{{ estadoLabel }}</div>
              </div>
            </div>

            <div class="reserva-details">
              <div class="detail-item">
                <span class="detail-label">Paciente:</span>
                <span class="detail-value">{{ reserveData?.titular_nombre }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ reserveData?.titular_email }}</span>
              </div>
              <div v-if="reserveData?.servicio_nombre" class="detail-item">
                <span class="detail-label">Servicio:</span>
                <span class="detail-value">{{ reserveData.servicio_nombre }}</span>
              </div>
              <div v-if="reserveData?.sucursal_nombre" class="detail-item">
                <span class="detail-label">Sucursal:</span>
                <span class="detail-value">{{ reserveData.sucursal_nombre }}</span>
              </div>
              <div v-if="reserveData?.sucursal_direccion" class="detail-item">
                <span class="detail-label">Dirección:</span>
                <span class="detail-value">{{ reserveData.sucursal_direccion }}</span>
              </div>
            </div>
          </div>

          <div class="tipo-reserva-section" :class="{ 'for-other': hasDependiente }">
            <q-icon :name="hasDependiente ? 'fa-solid fa-users' : 'fa-solid fa-user'" />
            <span>{{ hasDependiente ? 'Reserva para Dependiente' : 'Reserva para Titular' }}</span>
          </div>

          <div v-if="hasDependiente" class="dependiente-section">
            <div class="section-title">
              <i class="fa-solid fa-user-friends"></i>
              Información del Dependiente
            </div>
            <div class="dependiente-info">
              <div class="info-row">
                <span class="label">Nombre:</span>
                <span class="value">{{ reserveData?.dependiente_nombre }}</span>
              </div>
              <div v-if="reserveData?.parentesco" class="info-row">
                <span class="label">Parentesco:</span>
                <span class="value">{{ reserveData.parentesco }}</span>
              </div>
              <div v-if="reserveData?.dependiente_telefono" class="info-row">
                <span class="label">Teléfono:</span>
                <span class="value">{{ reserveData.dependiente_telefono }}</span>
              </div>
            </div>
          </div>

          <div v-else class="no-dependiente-section">
            <q-icon name="fa-solid fa-user-check" size="32px" />
            <p>Esta reserva es para el titular principal</p>
          </div>

          <!-- Reprogramar Fecha y Hora (solo CLIENT) -->
          <div v-if="!isAdmin && puedeReprogramar" class="reprogramar-section">
            <div class="section-title">
              <i class="fa-solid fa-calendar-clock"></i>
              Reprogramar Fecha y Hora
            </div>
            
            <!-- Selector de fecha -->
            <div class="fecha-selector">
              <label class="selector-label">Nueva Fecha</label>
              <q-date
                v-model="nuevaFecha"
                :options="dateOptions"
                mask="YYYY-MM-DD"
                minimal
                @update:model-value="onDateChange"
                class="full-width"
              />
            </div>

            <!-- Selector de hora -->
            <div class="hora-selector">
              <label class="selector-label">Nueva Hora</label>

              <div v-if="loadingHorarios" class="loading-horarios">
                <q-spinner color="primary" size="32px" />
                <span class="text-grey-7">Verificando disponibilidad...</span>
              </div>

              <div v-else-if="!nuevaFecha" class="info-banner-small">
                <q-icon name="info" color="blue" size="20px" />
                <span>Primero selecciona una fecha</span>
              </div>

              <div v-else-if="esDomingo" class="warning-banner-small">
                <q-icon name="event_busy" color="orange" size="20px" />
                <span>Los domingos no se atiende</span>
              </div>

              <div v-else class="horarios-grid-small">
                <q-btn
                  v-for="horario in todosHorarios"
                  :key="horario.hora"
                  :label="horario.hora"
                  :outline="nuevaHora !== horario.hora"
                  :unelevated="nuevaHora === horario.hora"
                  :disable="!horario.disponible"
                  :color="horario.disponible ? (nuevaHora === horario.hora ? 'primary' : 'grey-7') : 'grey-4'"
                  @click="horario.disponible && (nuevaHora = horario.hora)"
                  :class="{'hora-bloqueada': !horario.disponible}"
                  size="sm"
                  class="horario-btn-small"
                >
                  <q-tooltip v-if="!horario.disponible">
                    Horario no disponible
                  </q-tooltip>
                </q-btn>
              </div>

              <div v-if="horariosDisponiblesCount === 0 && nuevaFecha && !esDomingo" class="warning-banner-small">
                <q-icon name="warning" color="orange" size="20px" />
                <span>No hay horarios disponibles para esta fecha</span>
              </div>
            </div>

            <q-btn
              v-if="(nuevaFecha && nuevaFecha !== reserveData?.fecha_reserva) || (nuevaHora && nuevaHora !== formatTime(reserveData?.hora_reserva))"
              unelevated
              label="Guardar cambios"
              color="primary"
              @click="actualizarReserva"
              :loading="guardando"
              class="full-width q-mt-md"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions class="dialog-actions">
        <q-btn
          flat
          label="Cerrar"
          @click="closeDialog"
          class="secondary-btn"
        />
        <q-btn
          v-if="isAdmin && reserveData?.estado === 'pendiente'"
          unelevated
          label="Confirmar"
          color="positive"
          @click="confirmar"
          :loading="confirmando"
        />
        <q-btn
          v-if="isAdmin && reserveData?.estado === 'pendiente'"
          unelevated
          label="Rechazar"
          color="negative"
          @click="rechazar"
          :loading="rechazando"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useReserveStore } from 'src/stores/reservaStore'
import { useAuthStore } from 'src/stores/authStore'

export default {
  name: 'DetailReserveDialog',
  props: {
    modelValue: Boolean,
    reserveData: Object
  },
  emits: ['update:modelValue', 'refresh'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const reservaStore = useReserveStore()
    const authStore = useAuthStore()

    const showDialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const isAdmin = computed(() => authStore.userRole === 'ADMIN')
    const nuevaFecha = ref(null)
    const nuevaHora = ref(null)
    const todosHorarios = ref([])
    const loadingHorarios = ref(false)
    const guardando = ref(false)
    const confirmando = ref(false)
    const rechazando = ref(false)

    const hasDependiente = computed(() => {
      return !!props.reserveData?.dependiente_nombre
    })

    const estadoLabel = computed(() => {
      const estados = {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'cancelada': 'Cancelada',
        'completada': 'Completada'
      }
      return estados[props.reserveData?.estado] || props.reserveData?.estado
    })

    const puedeReprogramar = computed(() => {
      if (!props.reserveData) return false
      const estado = props.reserveData.estado
      return estado === 'pendiente' || estado === 'confirmada'
    })

    const generarHorariosBase = () => {
      const horarios = []
      for (let h = 8; h <= 18; h++) {
        if (h === 12 || h === 13) continue
        horarios.push(`${String(h).padStart(2, '0')}:00`)
      }
      return horarios
    }

    const esDomingo = computed(() => {
      if (!nuevaFecha.value) return false
      try {
        const date = new Date(nuevaFecha.value + 'T00:00:00')
        return date.getDay() === 0
      } catch {
        return false
      }
    })

    const horariosDisponiblesCount = computed(() => {
      return todosHorarios.value.filter(h => h.disponible).length
    })

    const dateOptions = (date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(date)
      return selectedDate >= today
    }

    const onDateChange = async (newDate) => {
      if (!newDate || !props.reserveData?.sucursal_id) {
        todosHorarios.value = generarHorariosBase().map(hora => ({ hora, disponible: false }))
        return
      }

      nuevaHora.value = null
      loadingHorarios.value = true

      try {
        const horariosBase = generarHorariosBase()

        const respuesta = await reservaStore.obtenerHorariosDisponibles(
          props.reserveData.sucursal_id,
          newDate
        )

        let disponibles = []
        if (respuesta?.horarios_disponibles) {
          disponibles = respuesta.horarios_disponibles.map(hora =>
            typeof hora === 'string' ? hora.substring(0, 5) : hora
          )
        }

        todosHorarios.value = horariosBase.map(hora => ({
          hora,
          disponible: disponibles.includes(hora)
        }))

      } catch (error) {
        console.error('Error cargando horarios:', error)
        todosHorarios.value = generarHorariosBase().map(hora => ({ hora, disponible: false }))
      } finally {
        loadingHorarios.value = false
      }
    }

    const actualizarReserva = async () => {
      if (!nuevaFecha.value && !nuevaHora.value) return

      guardando.value = true
      try {
        const datosActualizacion = {}
        
        if (nuevaFecha.value && nuevaFecha.value !== props.reserveData.fecha_reserva) {
          datosActualizacion.fecha_reserva = nuevaFecha.value
        }
        
        if (nuevaHora.value && nuevaHora.value !== formatTime(props.reserveData.hora_reserva)) {
          datosActualizacion.hora_reserva = nuevaHora.value
        }

        const resultado = await reservaStore.actualizarReserva(props.reserveData.id, datosActualizacion)

        if (resultado.success) {
          $q.notify({
            type: 'positive',
            message: 'Reserva actualizada exitosamente',
            position: 'top'
          })
          emit('refresh')
          closeDialog()
        } else {
          $q.notify({
            type: 'negative',
            message: resultado.message || 'Error al actualizar la reserva',
            position: 'top'
          })
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al actualizar la reserva' + error.message,
          position: 'top'
        })
      } finally {
        guardando.value = false
      }
    }

    const confirmar = async () => {
      confirmando.value = true
      try {
        const resultado = await reservaStore.confirmarReserva(props.reserveData.id)

        if (resultado.success) {
          $q.notify({
            type: 'positive',
            message: 'Reserva confirmada exitosamente',
            position: 'top'
          })
          emit('refresh')
          closeDialog()
        } else {
          $q.notify({
            type: 'negative',
            message: resultado.message || 'Error al confirmar la reserva',
            position: 'top'
          })
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al confirmar la reserva' + error.message,
          position: 'top'
        })
      } finally {
        confirmando.value = false
      }
    }

    const rechazar = async () => {
      $q.dialog({
        title: 'Rechazar Reserva',
        message: 'Ingrese el motivo del rechazo',
        prompt: {
          model: '',
          type: 'textarea'
        },
        cancel: true,
        persistent: true
      }).onOk(async (motivo) => {
        rechazando.value = true
        try {
          const resultado = await reservaStore.rechazarReserva(props.reserveData.id, motivo)

          if (resultado.success) {
            $q.notify({
              type: 'positive',
              message: 'Reserva rechazada exitosamente',
              position: 'top'
            })
            emit('refresh')
            closeDialog()
          } else {
            $q.notify({
              type: 'negative',
              message: resultado.message || 'Error al rechazar la reserva',
              position: 'top'
            })
          }
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Error al rechazar la reserva' + error.message,
            position: 'top'
          })
        } finally {
          rechazando.value = false
        }
      })
    }

    const closeDialog = () => {
      showDialog.value = false
      nuevaFecha.value = null
      nuevaHora.value = null
      todosHorarios.value = []
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

    watch(() => props.modelValue, async (newVal) => {
      if (newVal && !isAdmin.value && puedeReprogramar.value && props.reserveData) {
        nuevaFecha.value = props.reserveData.fecha_reserva
        nuevaHora.value = formatTime(props.reserveData.hora_reserva)
        
        // Cargar horarios para la fecha actual
        if (nuevaFecha.value) {
          await onDateChange(nuevaFecha.value)
        }
      }
    })

    return {
      showDialog,
      isAdmin,
      hasDependiente,
      estadoLabel,
      puedeReprogramar,
      nuevaFecha,
      nuevaHora,
      todosHorarios,
      esDomingo,
      horariosDisponiblesCount,
      loadingHorarios,
      guardando,
      confirmando,
      rechazando,
      dateOptions,
      onDateChange,
      actualizarReserva,
      confirmar,
      rechazar,
      closeDialog,
      formatDate,
      formatTime
    }
  }
}
</script>

<style scoped>
.detail-dialog {
  max-width: 500px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: #fafafa;
}

.dialog-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  color: #555;
}

.dialog-content-scrollable {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.reserva-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.reserva-box {
  flex: 1;
  background: #f8f8f8;
  padding: 12px;
  border-radius: 8px;
}

.box-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.box-value {
  font-weight: 600;
}

.reserva-details .detail-item {
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 500;
  margin-right: 6px;
}

.tipo-reserva-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  font-weight: 500;
}

.dependiente-section {
  margin-top: 16px;
  padding: 12px;
  background: #f3f3f3;
  border-radius: 8px;
}

.info-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.info-row .label {
  font-weight: 500;
}

.no-dependiente-section {
  text-align: center;
  margin-top: 16px;
  padding: 16px;
}

.reprogramar-section {
  margin-top: 20px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
}

.fecha-selector,
.hora-selector {
  margin-bottom: 16px;
}

.selector-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.loading-horarios {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.info-banner-small,
.warning-banner-small {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.9rem;
}

.warning-banner-small {
  background: #fff3e0;
  color: #f57c00;
}

.horarios-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
  margin-top: 8px;
}

.horario-btn-small {
  min-height: 36px;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.hora-bloqueada {
  opacity: 0.5;
  text-decoration: line-through;
}

.reprogramar-section .q-btn {
  margin-top: 12px;
}

.dialog-actions {
  padding: 12px 24px;
  gap: 8px;
}

@media (max-width: 600px) {
  .horarios-grid-small {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>