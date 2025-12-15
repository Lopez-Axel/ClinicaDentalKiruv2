<template>
  <q-dialog v-model="dialogOpen" maximized>
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Agenda tu cita fácilmente</q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-stepper
        v-model="reservaStore.currentStep"
        vertical
        color="primary"
        animated
        header-nav
      >
        <!-- Paso 0: Motivo -->
        <q-step
          :name="0"
          title="Motivo"
          icon="event"
          :done="reservaStore.currentStep > 0"
        >
          <div class="text-h6 q-mb-md">¿Para quién es la cita?</div>
          
          <q-option-group
            v-model="reservaStore.nuevaReserva.patientType"
            :options="[
              { label: 'Para mí', value: 'me' },
              { label: 'Para otra persona (dependiente)', value: 'other' }
            ]"
            color="primary"
            class="q-mb-md"
          />

          <q-slide-transition>
            <q-card v-if="reservaStore.nuevaReserva.patientType === 'other'" flat bordered class="q-pa-md bg-grey-2">
              <div class="text-subtitle2 text-weight-bold q-mb-md">Datos del dependiente</div>
              
              <q-input
                v-model="reservaStore.pacienteOtro.nombreCompleto"
                label="Nombre Completo *"
                outlined
                dense
                class="q-mb-md"
              />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-select
                    v-model="reservaStore.pacienteOtro.genero"
                    :options="['Masculino', 'Femenino', 'Otro']"
                    label="Género *"
                    outlined
                    dense
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="reservaStore.pacienteOtro.parentesco"
                    :options="['Hijo', 'Hija', 'Padre', 'Madre', 'Esposo', 'Esposa', 'Hermano', 'Hermana', 'Otro']"
                    label="Parentesco *"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="reservaStore.pacienteOtro.telefono"
                    label="Teléfono *"
                    outlined
                    dense
                    mask="########"
                  />
                </div>
              </div>
            </q-card>
          </q-slide-transition>

          <q-separator class="q-my-md" />

          <div class="text-h6 q-mb-md">Selecciona el servicio</div>
          
          <div v-if="reservaStore.servicios.length === 0" class="text-center q-pa-md">
            <q-spinner color="primary" size="40px" />
            <div class="q-mt-sm text-grey-7">Cargando servicios...</div>
          </div>

          <div v-else class="row q-col-gutter-md">
            <div
              v-for="servicio in reservaStore.servicios"
              :key="servicio.id"
              class="col-6 col-md-4"
            >
              <q-card
                flat
                bordered
                :class="reservaStore.nuevaReserva.service === servicio.id ? 'bg-primary text-white' : 'cursor-pointer'"
                @click="reservaStore.seleccionarServicio(servicio.id)"
              >
                <q-card-section class="text-center">
                  <div class="text-subtitle2 q-mt-sm">{{ servicio.titulo }}</div>
                  <div v-if="servicio.descripcion" class="text-caption">{{ servicio.descripcion }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-banner v-if="!reservaStore.nuevaReserva.service" dense class="bg-negative text-white q-mt-md">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            Selecciona un servicio para continuar
          </q-banner>

          <q-stepper-navigation class="q-mt-md">
            <q-btn @click="nextStep" color="primary" label="Siguiente" icon-right="arrow_forward" />
          </q-stepper-navigation>
        </q-step>

        <!-- Paso 1: Clínica -->
        <q-step
          :name="1"
          title="Clínica"
          icon="location_on"
          :done="reservaStore.currentStep > 1"
        >
          <div class="text-h6 q-mb-md">Selecciona la sucursal</div>

          <div v-if="reservaStore.sucursales.length === 0" class="text-center q-pa-md">
            <q-spinner color="primary" size="40px" />
            <div class="q-mt-sm text-grey-7">Cargando sucursales...</div>
          </div>

          <div v-else class="column q-gutter-md">
            <q-card
              v-for="sucursal in reservaStore.sucursales"
              :key="sucursal.id"
              flat
              bordered
              :class="reservaStore.nuevaReserva.clinic === sucursal.id ? 'bg-primary text-white' : 'cursor-pointer'"
              @click="reservaStore.seleccionarClinica(sucursal.id)"
            >
              <q-card-section>
                <div class="text-h6">{{ sucursal.nombre }}</div>
                <div class="text-caption q-mt-sm">
                  <q-icon name="place" size="16px" />
                  {{ sucursal.direccion }}
                </div>
                <div v-if="sucursal.ubicacion" class="text-caption">
                  {{ sucursal.ubicacion }}
                </div>
                <div v-if="sucursal.descripcion" class="text-caption q-mt-sm">
                  {{ sucursal.descripcion }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <q-banner v-if="!reservaStore.nuevaReserva.clinic" dense class="bg-negative text-white q-mt-md">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            Selecciona una sucursal para continuar
          </q-banner>

          <q-stepper-navigation class="q-mt-md">
            <q-btn flat @click="reservaStore.pasoAnterior" label="Atrás" icon="arrow_back" />
            <q-btn @click="nextStep" color="primary" label="Siguiente" icon-right="arrow_forward" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

        <!-- Paso 2: Fecha y Hora -->
        <q-step
          :name="2"
          title="Fecha y Hora"
          icon="schedule"
          :done="reservaStore.currentStep > 2"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-md">Selecciona la fecha</div>
              <q-date
                v-model="reservaStore.nuevaReserva.date"
                :options="dateOptions"
                mask="YYYY-MM-DD"
                minimal
                @update:model-value="onDateChange"
                class="full-width"
              />
            </div>

            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-md">Selecciona la hora</div>

              <div v-if="cargandoHorarios" class="text-center q-pa-md">
                <q-spinner color="primary" size="40px" />
                <div class="q-mt-sm text-grey-7">Verificando disponibilidad...</div>
              </div>

              <q-banner v-else-if="!reservaStore.nuevaReserva.date" dense class="bg-info text-white">
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                Primero selecciona una fecha
              </q-banner>

              <q-banner v-else-if="isSunday" dense class="bg-negative text-white">
                <template v-slot:avatar>
                  <q-icon name="event_busy" />
                </template>
                Los domingos no se atiende
              </q-banner>

              <div v-else-if="todosHorarios.length > 0" class="horarios-grid">
                <q-btn
                  v-for="horario in todosHorarios"
                  :key="horario.hora"
                  :label="horario.hora"
                  :outline="reservaStore.nuevaReserva.time !== horario.hora"
                  :unelevated="reservaStore.nuevaReserva.time === horario.hora"
                  :disable="!horario.disponible"
                  :color="horario.disponible ? (reservaStore.nuevaReserva.time === horario.hora ? 'primary' : 'grey-7') : 'grey-4'"
                  @click="horario.disponible && (reservaStore.nuevaReserva.time = horario.hora)"
                  :class="{'hora-bloqueada': !horario.disponible}"
                  class="horario-btn"
                >
                  <q-tooltip v-if="!horario.disponible">
                    Horario no disponible
                  </q-tooltip>
                </q-btn>
              </div>

              <q-banner v-else-if="horariosDisponiblesCount === 0 && reservaStore.nuevaReserva.date" dense class="bg-warning text-white">
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                No hay horarios disponibles para esta fecha
              </q-banner>
            </div>
          </div>

          <q-stepper-navigation class="q-mt-md">
            <q-btn flat @click="reservaStore.pasoAnterior" label="Atrás" icon="arrow_back" />
            <q-btn @click="nextStep" color="primary" label="Siguiente" icon-right="arrow_forward" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

        <!-- Paso 3: Validación -->
        <q-step
          :name="3"
          title="Confirmación"
          icon="check_circle"
        >
          <div class="text-h6 q-mb-md">Confirma tu cita</div>

          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label overline>Paciente</q-item-label>
                <q-item-label>
                  {{ reservaStore.nuevaReserva.patientType === 'me' ? 'Yo mismo' : reservaStore.pacienteOtro.nombreCompleto }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>Servicio</q-item-label>
                <q-item-label>{{ getServiceName(reservaStore.nuevaReserva.service) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>Sucursal</q-item-label>
                <q-item-label>{{ getClinicName(reservaStore.nuevaReserva.clinic) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>Fecha</q-item-label>
                <q-item-label>{{ formatDateForDisplay(reservaStore.nuevaReserva.date) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>Hora</q-item-label>
                <q-item-label>{{ reservaStore.nuevaReserva.time }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="reservaStore.nuevaReserva.patientType === 'other'">
              <q-item-section>
                <q-item-label overline>Información del dependiente</q-item-label>
                <q-item-label caption>
                  <div><strong>Parentesco:</strong> {{ reservaStore.pacienteOtro.parentesco }}</div>
                  <div><strong>Género:</strong> {{ reservaStore.pacienteOtro.genero }}</div>
                  <div><strong>Teléfono:</strong> {{ reservaStore.pacienteOtro.telefono }}</div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-stepper-navigation class="q-mt-md">
            <q-btn flat @click="reservaStore.pasoAnterior" label="Atrás" icon="arrow_back" />
            <q-btn
              @click="confirmReservation"
              color="primary"
              label="Confirmar Cita"
              icon="check"
              :loading="reservaStore.cargandoNuevaReserva"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useReserveStore } from 'src/stores/reservaStore'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'abrir-pago'])

const $q = useQuasar()
const reservaStore = useReserveStore()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const cargandoHorarios = ref(false)
const todosHorarios = ref([])

const generarHorariosBase = () => {
  const horarios = []
  for (let h = 8; h <= 18; h++) {
    if (h === 12 || h === 13) continue
    horarios.push(`${String(h).padStart(2, '0')}:00`)
  }
  return horarios
}

const horariosDisponiblesCount = computed(() => {
  return todosHorarios.value.filter(h => h.disponible).length
})

const onDateChange = async (newDate) => {
  if (!newDate || !reservaStore.nuevaReserva.clinic) {
    todosHorarios.value = generarHorariosBase().map(hora => ({ hora, disponible: false }))
    return
  }

  reservaStore.nuevaReserva.time = ''
  cargandoHorarios.value = true
  
  try {
    const horariosBase = generarHorariosBase()
    
    const respuesta = await reservaStore.obtenerHorariosDisponibles(
      reservaStore.nuevaReserva.clinic,
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
    cargandoHorarios.value = false
  }
}

const isSunday = computed(() => {
  const dateStr = reservaStore.nuevaReserva.date
  if (!dateStr) return false

  try {
    const [year, month, day] = dateStr.split('-')
    const dateObj = new Date(year, month - 1, day)
    return dateObj.getDay() === 0
  } catch {
    return false
  }
})

const dateOptions = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  return selectedDate >= today
}

const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'No seleccionada'
  
  try {
    const [year, month, day] = dateString.split('-')
    const date = new Date(year, month - 1, day)
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const getServiceName = (serviceId) => {
  const service = reservaStore.servicios.find(s => s.id === serviceId)
  return service?.titulo || 'No seleccionado'
}

const getClinicName = (clinicId) => {
  const clinic = reservaStore.sucursales.find(s => s.id === clinicId)
  return clinic?.nombre || 'No seleccionado'
}

const nextStep = () => {
  if (reservaStore.currentStep === 0) {
    if (reservaStore.nuevaReserva.patientType === 'other') {
      const p = reservaStore.pacienteOtro
      if (!p.nombreCompleto || !p.genero || !p.parentesco || !/^\d+$/.test(p.telefono)) {
        $q.notify({ 
          type: 'negative', 
          message: 'Completa todos los campos del dependiente'
        })
        return
      }
    }
    if (!reservaStore.nuevaReserva.service) {
      $q.notify({ 
        type: 'negative', 
        message: 'Selecciona un servicio'
      })
      return
    }
  } else if (reservaStore.currentStep === 1) {
    if (!reservaStore.nuevaReserva.clinic) {
      $q.notify({ 
        type: 'negative', 
        message: 'Selecciona una sucursal'
      })
      return
    }
  } else if (reservaStore.currentStep === 2) {
    if (!reservaStore.nuevaReserva.date || !reservaStore.nuevaReserva.time) {
      $q.notify({ 
        type: 'negative', 
        message: 'Selecciona fecha y hora'
      })
      return
    }
  }
  
  reservaStore.siguientePaso()
}

const confirmReservation = async () => {
  // Preparar datos de la reserva para el pago
  console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  let dependienteId = null

  // Si es para otro paciente, crear dependiente primero
  if (reservaStore.nuevaReserva.patientType === 'other') {
    const datosDependiente = {
      nombre_completo: reservaStore.pacienteOtro.nombreCompleto,
      genero: reservaStore.pacienteOtro.genero,
      parentesco: reservaStore.pacienteOtro.parentesco,
      telefono: reservaStore.pacienteOtro.telefono
    }
    
    const resultadoDependiente = await reservaStore.crearDependiente(datosDependiente)
    
    if (!resultadoDependiente.success) {
      $q.notify({
        type: 'negative',
        message: resultadoDependiente.message || 'Error al crear dependiente'
      })
      return
    }
    
    dependienteId = resultadoDependiente.data.id
  }

  // Preparar datos completos para el pago
  const datosReserva = {
    dependiente_id: dependienteId,
    servicio_id: reservaStore.nuevaReserva.service,
    sucursal_id: reservaStore.nuevaReserva.clinic,
    fecha_reserva: reservaStore.nuevaReserva.date,
    hora_reserva: reservaStore.nuevaReserva.time,
    notas: null
  }

  // Emitir evento para abrir modal de pago
  emit('abrir-pago', datosReserva)
}

watch(() => reservaStore.nuevaReserva.clinic, () => {
  if (reservaStore.nuevaReserva.date) {
    onDateChange(reservaStore.nuevaReserva.date)
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.horario-btn {
  min-height: 40px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.hora-bloqueada {
  opacity: 0.5;
  text-decoration: line-through;
}

@media (max-width: 600px) {
  .horarios-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>