<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="new-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-title">
            <i class="fa-solid fa-calendar-plus"></i>
            <span>Nueva Cita</span>
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

      <!-- Form -->
      <q-form @submit.prevent="createQuote" class="form-container">
        <q-card-section class="dialog-content">
          <div class="form-fields">
            
            <!-- Asunto y Tipo de Cita -->
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">
                  <i class="fa-solid fa-comment-medical"></i>
                  <span>Asunto</span>
                  <span class="required">*</span>
                </label>
                <q-input
                  v-model="form.asunto"
                  filled
                  dense
                  :rules="[val => !!val || 'El asunto es requerido']"
                  placeholder="Motivo de la cita"
                />
              </div>

              <div class="field-group">
                <label class="field-label">
                  <i class="fa-solid fa-stethoscope"></i>
                  <span>Tipo de Cita</span>
                  <span class="required">*</span>
                </label>
                <q-select
                  v-model="form.tipo_cita"
                  filled
                  dense
                  :options="tipoCitaOptions"
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Seleccione el tipo de cita']"
                />
              </div>
            </div>

            <q-separator spaced />

            <!-- Paciente con autocomplete y búsqueda por CI -->
            <div class="field-group highlighted">
              <label class="field-label">
                <i class="fa-solid fa-user-injured"></i>
                <span>Paciente</span>
                <span class="required">*</span>
              </label>
              
              <!-- Búsqueda rápida por CI -->
              <div class="search-row">
                <q-input
                  v-model="searchCI"
                  filled
                  dense
                  placeholder="Buscar por CI"
                  @keyup.enter="buscarPorCI"
                  class="ci-input"
                >
                  <template v-slot:prepend>
                    <i class="fa-solid fa-id-card"></i>
                  </template>
                </q-input>
                <q-btn
                  flat
                  dense
                  icon="fa-solid fa-search"
                  @click="buscarPorCI"
                  color="primary"
                  class="search-btn"
                >
                  <q-tooltip>Buscar por CI</q-tooltip>
                </q-btn>
              </div>

              <!-- Select con autocomplete -->
              <q-select
                v-model="form.paciente_id"
                filled
                dense
                use-input
                input-debounce="300"
                :options="pacientesFiltrados"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                @filter="filtrarPacientes"
                placeholder="O seleccione de la lista..."
                :rules="[val => !!val || 'Seleccione un paciente']"
              >
                <template v-slot:prepend>
                  <i class="fa-solid fa-search"></i>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <div class="avatar-small">
                        {{ scope.opt.initials }}
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                      <q-item-label caption>CI: {{ scope.opt.ci }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Paciente seleccionado -->
              <div v-if="pacienteSeleccionado" class="selected-info">
                <i class="fa-solid fa-check-circle"></i>
                <span>{{ pacienteSeleccionado.nombre }}</span>
                <q-chip dense color="primary" text-color="white" size="sm">
                  CI: {{ pacienteSeleccionado.ci }}
                </q-chip>
              </div>
            </div>

            <!-- Dentista con autocomplete -->
            <div class="field-group">
              <label class="field-label">
                <i class="fa-solid fa-user-md"></i>
                <span>Dentista</span>
                <span class="required">*</span>
              </label>
              <q-select
                v-model="form.dentista_id"
                filled
                dense
                use-input
                input-debounce="300"
                :options="dentistasFiltrados"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                @filter="filtrarDentistas"
                placeholder="Buscar dentista..."
                :rules="[val => !!val || 'Seleccione un dentista']"
              >
                <template v-slot:prepend>
                  <i class="fa-solid fa-search"></i>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <div class="avatar-small dentist">
                        {{ scope.opt.initials }}
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Sucursal (opcional) -->
            <div class="field-group">
              <label class="field-label">
                <i class="fa-solid fa-building"></i>
                <span>Sucursal</span>
              </label>
              <q-select
                v-model="form.sucursal_id"
                filled
                dense
                use-input
                input-debounce="300"
                :options="sucursalesFiltradas"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                @filter="filtrarSucursales"
                clearable
                placeholder="Seleccione sucursal (opcional)"
              >
                <template v-slot:prepend>
                  <i class="fa-solid fa-search"></i>
                </template>
              </q-select>
            </div>

            <q-separator spaced />

            <q-separator spaced />

            <!-- Fecha y Hora -->
            <div class="field-row full-width-row">
              <div class="field-group full-width">
                <label class="field-label">
                  <i class="fa-solid fa-calendar"></i>
                  <span>Fecha</span>
                  <span class="required">*</span>
                </label>
                <q-date
                  v-model="form.fecha"
                  :options="dateOptions"
                  mask="YYYY-MM-DD"
                  minimal
                  @update:model-value="onDateChange"
                  class="full-width"
                />
              </div>
            </div>

            <!-- Horarios disponibles -->
            <div class="field-group full-width">
              <label class="field-label">
                <i class="fa-solid fa-clock"></i>
                <span>Hora</span>
                <span class="required">*</span>
              </label>

              <div v-if="cargandoHorarios" class="loading-horarios">
                <q-spinner color="primary" size="32px" />
                <span class="text-grey-7">Verificando disponibilidad...</span>
              </div>

              <div v-else-if="!form.fecha" class="info-banner">
                <q-icon name="info" color="blue" size="24px" />
                <span>Primero selecciona una fecha</span>
              </div>

              <div v-else-if="!form.sucursal_id" class="info-banner">
                <q-icon name="info" color="blue" size="24px" />
                <span>Selecciona una sucursal para ver horarios disponibles</span>
              </div>

              <div v-else-if="esDomingo" class="warning-banner">
                <q-icon name="event_busy" color="orange" size="24px" />
                <span>Los domingos no se atiende</span>
              </div>

              <div v-else class="horarios-grid">
                <q-btn
                  v-for="horario in todosHorarios"
                  :key="horario.hora"
                  :label="horario.hora"
                  :outline="form.hora !== horario.hora"
                  :unelevated="form.hora === horario.hora"
                  :disable="!horario.disponible"
                  :color="horario.disponible ? (form.hora === horario.hora ? 'primary' : 'grey-7') : 'grey-4'"
                  @click="horario.disponible && (form.hora = horario.hora)"
                  :class="{'hora-bloqueada': !horario.disponible}"
                  class="horario-btn"
                >
                  <q-tooltip v-if="!horario.disponible">
                    Horario no disponible
                  </q-tooltip>
                </q-btn>
              </div>

              <div v-if="horariosDisponiblesCount === 0 && form.fecha && form.sucursal_id && !esDomingo" class="warning-banner">
                <q-icon name="warning" color="orange" size="24px" />
                <span>No hay horarios disponibles para esta fecha</span>
              </div>
            </div>

            <!-- Notas -->
            <div class="field-group">
              <label class="field-label">
                <i class="fa-solid fa-sticky-note"></i>
                <span>Notas</span>
              </label>
              <q-input
                v-model="form.notas"
                filled
                dense
                type="textarea"
                rows="3"
                placeholder="Notas adicionales (opcional)"
              />
            </div>

          </div>
        </q-card-section>

        <q-separator />

        <!-- Actions -->
        <q-card-actions class="dialog-actions">
          <q-btn
            flat
            label="Cancelar"
            @click="closeDialog"
            class="secondary-btn"
            no-caps
          />
          <q-btn
            type="submit"
            label="Crear Cita"
            icon="fa-solid fa-calendar-plus"
            :loading="loading"
            class="primary-btn"
            no-caps
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePacienteStore } from 'stores/pacienteStore'
import { useDentistaStore } from 'stores/dentistaStore'
import { useSucursalStore } from 'stores/sucursalStore'
import { useCitaStore } from 'stores/citaStore'

export default {
  name: 'NewQuoteDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'quote-created'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const pacienteStore = usePacienteStore()
    const dentistaStore = useDentistaStore()
    const sucursalStore = useSucursalStore()
    const citaStore = useCitaStore()

    const loading = ref(false)
    const cargandoHorarios = ref(false)
    const searchCI = ref('')
    const pacientesFiltrados = ref([])
    const dentistasFiltrados = ref([])
    const sucursalesFiltradas = ref([])

    const form = ref({
      asunto: '',
      tipo_cita: 'consulta',
      paciente_id: null,
      dentista_id: null,
      sucursal_id: null,
      fecha: '',
      hora: '',
      notas: ''
    })

    const todosHorarios = ref([])

    const showDialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // Opciones de tipo de cita
    const tipoCitaOptions = [
      { label: 'Consulta', value: 'consulta' },
      { label: 'Control', value: 'control' },
      { label: 'Seguimiento', value: 'seguimiento' },
      { label: 'Urgencia', value: 'urgencia' },
      { label: 'Cirugía', value: 'cirugia' },
      { label: 'Otro', value: 'otro' }
    ]

    const generarHorariosBase = () => {
      const horarios = []
      for (let h = 8; h < 18; h++) {
        if (h === 12 || h === 13) continue
        horarios.push(`${String(h).padStart(2, '0')}:00`)
      }
      return horarios
    }

    const esDomingo = computed(() => {
      if (!form.value.fecha) return false
      try {
        const date = new Date(form.value.fecha + 'T00:00:00')
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
      if (!newDate || !form.value.sucursal_id) {
        todosHorarios.value = generarHorariosBase().map(hora => ({ hora, disponible: false }))
        return
      }

      form.value.hora = ''
      cargandoHorarios.value = true

      try {
        const horariosBase = generarHorariosBase()

        const respuesta = await citaStore.obtenerHorariosDisponibles(
          form.value.sucursal_id, 
          newDate, 
          form.value.dentista_id
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

    // Preparar opciones de sucursales dinámicamente
    const prepararOpcionesSucursales = () => {
      return sucursalStore.sucursales.map(s => ({
        label: s.nombre || `Sucursal ${s.id}`,
        value: s.id
      }))
    }

    // Paciente seleccionado (computed)
    const pacienteSeleccionado = computed(() => {
      if (!form.value.paciente_id) return null
      const paciente = pacienteStore.pacientes.find(p => p.id === form.value.paciente_id)
      if (!paciente) return null
      return {
        nombre: pacienteStore.getNombreCompleto(paciente),
        ci: paciente.ci
      }
    })

    // Preparar opciones de pacientes
    const prepararOpcionesPacientes = () => {
      return pacienteStore.pacientes
        .filter(p => p.state === 1)
        .map(p => {
          const nombre = pacienteStore.getNombreCompleto(p)
          const initials = `${p.nombre?.charAt(0) || ''}${p.apellido_paterno?.charAt(0) || ''}`.toUpperCase()
          return {
            id: p.id,
            label: `${nombre} - CI: ${p.ci}`,
            nombre,
            ci: p.ci,
            initials
          }
        })
    }

    // Preparar opciones de dentistas
    const prepararOpcionesDentistas = () => {
      return dentistaStore.dentistas.map(d => {
        const nombre = `${d.nombre} ${d.apellido_paterno || ''}`.trim()
        const initials = `${d.nombre?.charAt(0) || ''}${d.apellido_paterno?.charAt(0) || ''}`.toUpperCase()
        return {
          id: d.id,
          label: nombre,
          nombre,
          initials
        }
      })
    }

    // Buscar paciente por CI
    const buscarPorCI = () => {
      if (!searchCI.value.trim()) {
        $q.notify({
          type: 'warning',
          message: 'Ingrese un número de CI',
          position: 'top',
          icon: 'fa-solid fa-exclamation-triangle'
        })
        return
      }

      const paciente = pacienteStore.pacientes.find(p => 
        p.ci === searchCI.value.trim() && p.state === 1
      )

      if (paciente) {
        form.value.paciente_id = paciente.id
        $q.notify({
          type: 'positive',
          message: `Paciente encontrado: ${pacienteStore.getNombreCompleto(paciente)}`,
          position: 'top',
          icon: 'fa-solid fa-check-circle'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: 'No se encontró ningún paciente con ese CI',
          position: 'top',
          icon: 'fa-solid fa-times-circle'
        })
      }
    }

    // Filtrar pacientes
    const filtrarPacientes = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        const opciones = prepararOpcionesPacientes()
        pacientesFiltrados.value = needle === ''
          ? opciones
          : opciones.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    }

    // Filtrar dentistas
    const filtrarDentistas = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        const opciones = prepararOpcionesDentistas()
        dentistasFiltrados.value = needle === ''
          ? opciones
          : opciones.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    }

    // Filtrar sucursales
    const filtrarSucursales = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        const opciones = prepararOpcionesSucursales()
        sucursalesFiltradas.value = needle === ''
          ? opciones
          : opciones.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    }

    // Crear cita
    const createQuote = async () => {
      loading.value = true
        const nuevaCita = {
          paciente_id: form.value.paciente_id,
          dentista_id: form.value.dentista_id,
          sucursal_id: form.value.sucursal_id,
          asunto: form.value.asunto,
          fecha: form.value.fecha,
          hora: form.value.hora,
          tipo_cita: form.value.tipo_cita,
          notas: form.value.notas,
          estado: 'programada'
        }

        emit('quote-created', nuevaCita)
        loading.value = false
        closeDialog()
      
    }

    // Cerrar dialog y resetear
    const closeDialog = () => {
      form.value = {
        asunto: '',
        tipo_cita: 'consulta',
        paciente_id: null,
        dentista_id: null,
        sucursal_id: null,
        fecha: '',
        hora: '',
        notas: ''
      }
      searchCI.value = ''
      todosHorarios.value = []
      showDialog.value = false
    }

    // Cargar datos iniciales
    watch(showDialog, async (newVal) => {
      if (newVal) {
        await Promise.all([
          pacienteStore.cargarPacientes(),
          dentistaStore.cargarDentistas(),
          sucursalStore.cargarSucursales()
        ])
        pacientesFiltrados.value = prepararOpcionesPacientes()
        dentistasFiltrados.value = prepararOpcionesDentistas()
        sucursalesFiltradas.value = prepararOpcionesSucursales()
      }
    })

    // Watch para recargar horarios cuando cambie sucursal o dentista
    watch(() => [form.value.sucursal_id, form.value.dentista_id], () => {
      if (form.value.fecha) {
        onDateChange(form.value.fecha)
      }
    })

    return {
      showDialog,
      form,
      loading,
      cargandoHorarios,
      searchCI,
      pacientesFiltrados,
      dentistasFiltrados,
      sucursalesFiltradas,
      pacienteSeleccionado,
      todosHorarios,
      esDomingo,
      horariosDisponiblesCount,
      tipoCitaOptions,
      dateOptions,
      onDateChange,
      buscarPorCI,
      filtrarPacientes,
      filtrarDentistas,
      filtrarSucursales,
      createQuote,
      closeDialog
    }
  }
}
</script>

<style scoped>
.new-dialog {
  max-width: 700px;
  width: 100%;
  border-radius: 12px;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  color: white;
}

.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width-row {
  display: block;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #f44336;
}

.loading-horarios {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  text-align: center;
}

.info-banner,
.warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #e3f2fd;
  color: #1976d2;
}

.warning-banner {
  background: #fff3e0;
  color: #f57c00;
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

.dialog-actions {
  padding: 16px 24px;
  gap: 12px;
  border-top: 1px solid #e0e0e0;
}

.secondary-btn {
  min-width: 100px;
}

.primary-btn {
  min-width: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.avatar-small.dentist {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-radius: 6px;
  color: #2e7d32;
}

.ci-input {
  flex: 1;
}

.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .field-row {
    grid-template-columns: 1fr;
  }
  
  .horarios-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>