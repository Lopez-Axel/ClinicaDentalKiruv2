<template>
  <q-dialog v-model="showDialog" persistent max-width="1000px">
    <q-card class="detail-dialog">
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-title">
            <i class="fa-solid fa-user-circle"></i>
            <span>Detalles del Paciente</span>
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

      <q-card-section class="dialog-tabs">
        <q-tabs v-model="tab" dense align="justify" class="tabs-bar">
          <q-tab name="info" icon="fa-solid fa-id-card" label="Información General" />
          <q-tab name="clinica" icon="fa-solid fa-stethoscope" label="Historia Clínica" />
          <q-tab name="odontograma" icon="fa-solid fa-tooth" label="Odontograma" />
          <q-tab name="citas" icon="fa-solid fa-calendar-check" label="Citas" />
          <q-tab name="recetas" icon="fa-solid fa-file-prescription" label="Recetas" />
        </q-tabs>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-content">
        <q-tab-panels v-model="tab" animated>
          <!-- ========================================
               INFORMACIÓN GENERAL
          ======================================== -->
          <q-tab-panel name="info" class="tab-panel">
            <div class="info-grid">
              <!-- Datos Personales -->
              <div class="info-card personal-data">
                <h4 class="card-title">
                  <i class="fa-solid fa-id-card"></i>
                  Datos Personales
                </h4>
                <div class="data-grid">
                  <div class="data-item">
                    <label>Nombre Completo:</label>
                    <span class="data-value">{{ fullName }}</span>
                  </div>
                  <div class="data-item">
                    <label>C.I.:</label>
                    <span class="data-value">{{ currentPatient?.ci || 'No especificado' }}</span>
                  </div>
                  <div class="data-item">
                    <label>Fecha de Nacimiento:</label>
                    <span class="data-value">{{ formatDate(currentPatient?.fecha_nacimiento) }}</span>
                  </div>
                  <div class="data-item">
                    <label>Edad:</label>
                    <span class="data-value">{{ calculateAge(currentPatient?.fecha_nacimiento) }} años</span>
                  </div>
                  <div class="data-item">
                    <label>Estado Civil:</label>
                    <span class="data-value">{{ currentPatient?.estado_civil || 'No especificado' }}</span>
                  </div>
                  <div class="data-item">
                    <label>Profesión:</label>
                    <span class="data-value">{{ currentPatient?.profesion || 'No especificado' }}</span>
                  </div>
                </div>
              </div>

              <!-- Información de Contacto -->
              <div class="info-card contact-data">
                <h4 class="card-title">
                  <i class="fa-solid fa-address-book"></i>
                  Información de Contacto
                </h4>
                <div class="data-grid">
                  <div class="data-item">
                    <label>Email:</label>
                    <span class="data-value">{{ currentPatient?.gmail || 'No especificado' }}</span>
                  </div>
                  <div class="data-item">
                    <label>Teléfono:</label>
                    <span class="data-value">{{ currentPatient?.telefono || 'No especificado' }}</span>
                  </div>
                  <div class="data-item">
                    <label>Ciudad:</label>
                    <span class="data-value city-badge">{{ currentPatient?.ciudad || 'No especificada' }}</span>
                  </div>
                  <div class="data-item full-width">
                    <label>Domicilio:</label>
                    <span class="data-value">{{ currentPatient?.domicilio || 'No especificado' }}</span>
                  </div>
                </div>
              </div>

              <!-- Información del Registro -->
              <div class="info-card registry-data">
                <h4 class="card-title">
                  <i class="fa-solid fa-calendar-check"></i>
                  Información del Registro
                </h4>
                <div class="data-grid">
                  <div class="data-item">
                    <label>Fecha de Registro:</label>
                    <span class="data-value highlight">{{ formatDate(currentPatient?.created_at) }}</span>
                  </div>
                  <div class="data-item">
                    <label>Estado:</label>
                    <span class="data-value status-badge" :class="currentPatient?.state === 1 ? 'active' : 'inactive'">
                      {{ currentPatient?.state === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- ========================================
               HISTORIA CLÍNICA
          ======================================== -->
          <q-tab-panel name="clinica" class="tab-panel">
            <div class="clinical-grid">
              <!-- Motivo de Consulta -->
              <div class="clinical-card consultation-reason">
                <h4 class="card-title">
                  <i class="fa-solid fa-stethoscope"></i>
                  Motivo de Consulta
                </h4>
                <div class="clinical-data">
                  <div class="clinical-item">
                    <label>Motivo Principal:</label>
                    <span class="clinical-value">{{ currentPatient?.motivo_consulta || 'No especificado' }}</span>
                  </div>
                  <div class="clinical-item">
                    <label>Descripción:</label>
                    <span class="clinical-value description">{{ currentPatient?.descripcion || 'No hay descripción disponible' }}</span>
                  </div>
                  <div class="clinical-item">
                    <label>Última Visita al Odontólogo:</label>
                    <span class="clinical-value">{{ formatDate(currentPatient?.ultima_visita_odontologo) }}</span>
                  </div>
                </div>
              </div>

              <!-- Antecedentes de Salud -->
              <div class="clinical-card health-background">
                <h4 class="card-title">
                  <i class="fa-solid fa-heart-pulse"></i>
                  Antecedentes de Salud
                </h4>
                <div class="clinical-data">
                  <div class="clinical-item full-width">
                    <span class="clinical-value">{{ currentPatient?.antecedentes_salud || 'Sin antecedentes relevantes' }}</span>
                  </div>
                </div>
              </div>

              <!-- Alertas Clínicas -->
              <div class="clinical-card clinical-alerts" v-if="hasClinicalAlerts">
                <h4 class="card-title alert">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  Alertas Clínicas Importantes
                </h4>
                <div class="alert-content">
                  <div class="alert-item">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>{{ currentPatient?.alertas_clinicas }}</span>
                  </div>
                </div>
              </div>

              <div class="clinical-card no-alerts" v-else>
                <h4 class="card-title">
                  <i class="fa-solid fa-circle-check"></i>
                  Alertas Clínicas
                </h4>
                <div class="no-alerts-content">
                  <span>No hay alertas clínicas registradas</span>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- ========================================
               ODONTOGRAMA
          ======================================== -->
          <q-tab-panel name="odontograma" class="tab-panel">
            <div v-if="loadingOdontograma" class="loading-section">
              <q-spinner color="primary" size="50px" />
              <p>Cargando odontograma...</p>
            </div>

            <div v-else-if="odontogramStore.odontogramaActual" class="odontogram-section">
              <!-- Resumen del Odontograma -->
              <div class="odontogram-summary">
                <div class="summary-card">
                  <div class="summary-icon">
                    <i class="fa-solid fa-tooth"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Piezas en Tratamiento</span>
                    <span class="summary-value">{{ odontogramStore.piezas.length }}</span>
                  </div>
                </div>

                <div class="summary-card">
                  <div class="summary-icon cost">
                    <i class="fa-solid fa-dollar-sign"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Costo Total</span>
                    <span class="summary-value">Bs. {{ formatMonto(odontogramStore.precioTotal) }}</span>
                  </div>
                </div>

                <div class="summary-card">
                  <div class="summary-icon dentition">
                    <i class="fa-solid fa-teeth"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Tipo Dentición</span>
                    <span class="summary-value">{{ odontogramStore.odontogramaActual.tipo_denticion }}</span>
                  </div>
                </div>
              </div>

              <!-- Tabla de Piezas -->
              <div class="odontogram-table">
                <h4 class="section-title">
                  <i class="fa-solid fa-list"></i>
                  Piezas Dentales
                </h4>
                
                <q-table
                  v-if="odontogramStore.piezas.length > 0"
                  :rows="odontogramStore.piezas"
                  :columns="columnasPiezas"
                  row-key="id"
                  flat
                  bordered
                  :rows-per-page-options="[10, 20]"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body-cell-numero="props">
                    <q-td :props="props">
                      <div class="tooth-badge">
                        <i class="fa-solid fa-tooth"></i>
                        {{ props.value }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-estado_general="props">
                    <q-td :props="props">
                      <q-badge
                        :color="getEstadoColor(props.value)"
                        :label="props.value"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-precio="props">
                    <q-td :props="props">
                      <span class="price-cell">Bs. {{ formatMonto(props.value) }}</span>
                    </q-td>
                  </template>
                </q-table>

                <div v-else class="no-data-message">
                  <i class="fa-solid fa-tooth"></i>
                  <p>No hay piezas dentales registradas en el odontograma</p>
                </div>
              </div>

              <!-- Diagnóstico y Plan -->
              <div class="odontogram-info">
                <div class="info-section" v-if="odontogramStore.odontogramaActual.diagnostico_general">
                  <h4><i class="fa-solid fa-stethoscope"></i> Diagnóstico General</h4>
                  <p>{{ odontogramStore.odontogramaActual.diagnostico_general }}</p>
                </div>

                <div class="info-section" v-if="odontogramStore.odontogramaActual.plan_tratamiento">
                  <h4><i class="fa-solid fa-clipboard-list"></i> Plan de Tratamiento</h4>
                  <p>{{ odontogramStore.odontogramaActual.plan_tratamiento }}</p>
                </div>

                <div class="info-section" v-if="odontogramStore.odontogramaActual.notas">
                  <h4><i class="fa-solid fa-note-sticky"></i> Notas</h4>
                  <p>{{ odontogramStore.odontogramaActual.notas }}</p>
                </div>
              </div>
            </div>

            <div v-else class="empty-section">
              <i class="fa-solid fa-tooth empty-icon"></i>
              <h4>Sin Odontograma</h4>
              <p>Este paciente aún no tiene un odontograma registrado</p>
            </div>
          </q-tab-panel>

          <!-- ========================================
               CITAS
          ======================================== -->
          <q-tab-panel name="citas" class="tab-panel">
            <div v-if="loadingCitas" class="loading-section">
              <q-spinner color="primary" size="50px" />
              <p>Cargando citas...</p>
            </div>

            <div v-else-if="citasPaciente.length > 0" class="citas-section">
              <div class="citas-stats">
                <div class="stat-item programada">
                  <i class="fa-solid fa-clock"></i>
                  <span>{{ citasPorEstado('programada') }} Programadas</span>
                </div>
                <div class="stat-item confirmada">
                  <i class="fa-solid fa-check-circle"></i>
                  <span>{{ citasPorEstado('confirmada') }} Confirmadas</span>
                </div>
                <div class="stat-item completada">
                  <i class="fa-solid fa-check-double"></i>
                  <span>{{ citasPorEstado('completada') }} Completadas</span>
                </div>
                <div class="stat-item cancelada">
                  <i class="fa-solid fa-times-circle"></i>
                  <span>{{ citasPorEstado('cancelada') }} Canceladas</span>
                </div>
              </div>

              <q-table
                :rows="citasPaciente"
                :columns="columnasCitas"
                row-key="id"
                flat
                bordered
                :rows-per-page-options="[10, 20]"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:body-cell-fecha="props">
                  <q-td :props="props">
                    <div class="date-cell">
                      <i class="fa-solid fa-calendar"></i>
                      {{ formatDate(props.value) }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-hora="props">
                  <q-td :props="props">
                    <div class="time-cell">
                      <i class="fa-solid fa-clock"></i>
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-estado="props">
                  <q-td :props="props">
                    <q-badge
                      :color="getEstadoCitaColor(props.value)"
                      :label="formatEstadoCita(props.value)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-tipo_cita="props">
                  <q-td :props="props">
                    <q-chip
                      :icon="getTipoCitaIcon(props.value)"
                      :color="getTipoCitaColor(props.value)"
                      text-color="white"
                      size="sm"
                    >
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>
              </q-table>
            </div>

            <div v-else class="empty-section">
              <i class="fa-solid fa-calendar-xmark empty-icon"></i>
              <h4>Sin Citas Registradas</h4>
              <p>Este paciente no tiene citas programadas o historial de citas</p>
            </div>
          </q-tab-panel>

          <!-- ========================================
               RECETAS
          ======================================== -->
          <q-tab-panel name="recetas" class="tab-panel">
            <div v-if="loadingRecetas" class="loading-section">
              <q-spinner color="primary" size="50px" />
              <p>Cargando recetas...</p>
            </div>

            <div v-else-if="recetasPaciente.length > 0" class="recetas-section">
              <div class="recetas-header">
                <h4 class="section-title">
                  <i class="fa-solid fa-file-prescription"></i>
                  Historial de Recetas ({{ recetasPaciente.length }})
                </h4>
              </div>

              <div class="recetas-list">
                <div
                  v-for="receta in recetasPaciente"
                  :key="receta.id"
                  class="receta-card"
                >
                  <div class="receta-header">
                    <div class="receta-info">
                      <div class="receta-title">
                        <i class="fa-solid fa-file-prescription"></i>
                        <span>Receta #{{ receta.id }}</span>
                      </div>
                      <div class="receta-date">
                        <i class="fa-solid fa-calendar"></i>
                        {{ formatDate(receta.fecha) }}
                      </div>
                    </div>
                    <div class="receta-validity">
                      <q-badge
                        :color="isRecetaValida(receta.valida_hasta) ? 'positive' : 'negative'"
                        :label="isRecetaValida(receta.valida_hasta) ? 'Válida' : 'Expirada'"
                      />
                    </div>
                  </div>

                  <div class="receta-body">
                    <div class="receta-section">
                      <label><i class="fa-solid fa-stethoscope"></i> Diagnóstico:</label>
                      <p>{{ receta.diagnostico }}</p>
                    </div>

                    <div class="receta-section">
                      <label><i class="fa-solid fa-pills"></i> Medicamentos:</label>
                      <div class="medicamentos-list">
                        <div
                          v-for="(med, idx) in receta.medicamentos"
                          :key="idx"
                          class="medicamento-item"
                        >
                          <div class="medicamento-header">
                            <span class="medicamento-number">{{ idx + 1 }}.</span>
                            <span class="medicamento-name">{{ med.nombre }}</span>
                          </div>
                          <div class="medicamento-details">
                            <span><strong>Dosis:</strong> {{ med.dosis }}</span>
                            <span><strong>Duración:</strong> {{ med.duracion }}</span>
                          </div>
                          <div v-if="med.indicaciones" class="medicamento-indicaciones">
                            <strong>Indicaciones:</strong> {{ med.indicaciones }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="receta.indicaciones_generales" class="receta-section">
                      <label><i class="fa-solid fa-list-check"></i> Indicaciones Generales:</label>
                      <p>{{ receta.indicaciones_generales }}</p>
                    </div>

                    <div v-if="receta.observaciones" class="receta-section">
                      <label><i class="fa-solid fa-note-sticky"></i> Observaciones:</label>
                      <p>{{ receta.observaciones }}</p>
                    </div>
                  </div>

                  <div class="receta-footer">
                    <div class="receta-dentist">
                      <i class="fa-solid fa-user-doctor"></i>
                      <span>Dr(a). {{ getNombreDentista(receta.dentista_id) }}</span>
                    </div>
                    <div class="receta-validity-date">
                      <i class="fa-solid fa-calendar-check"></i>
                      <span>Válida hasta: {{ formatDate(receta.valida_hasta) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-section">
              <i class="fa-solid fa-file-prescription empty-icon"></i>
              <h4>Sin Recetas Registradas</h4>
              <p>Este paciente no tiene recetas médicas en el sistema</p>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator />

      <q-card-actions class="dialog-actions">
        <q-space />
        <q-btn
          flat
          label="Cerrar"
          v-close-popup
          class="secondary-btn"
          no-caps
        />
        <q-btn
          color="primary"
          label="Editar Información"
          icon="fa-solid fa-edit"
          @click="editPatient"
          unelevated
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { computed, ref, watch} from 'vue'
import { usePacienteStore } from 'stores/pacienteStore'
import { useOdontogramStore } from 'stores/odontogramStore'
import { useCitaStore } from 'stores/citaStore'
import { useRecetaStore } from 'stores/recetaStore'
import { useDentistaStore } from 'stores/dentistaStore'

export default {
  name: 'DetailPatientDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    patientData: {
      type: Object,
      default: () => null
    }
  },
  emits: ['update:modelValue', 'edit-patient'],
  setup(props, { emit }) {
    const pacienteStore = usePacienteStore()
    const odontogramStore = useOdontogramStore()
    const citaStore = useCitaStore()
    const recetaStore = useRecetaStore()
    const dentistaStore = useDentistaStore()
    
    const tab = ref('info')
    const loadingOdontograma = ref(false)
    const loadingCitas = ref(false)
    const loadingRecetas = ref(false)
    const citasPaciente = ref([])
    const recetasPaciente = ref([])

    // Computed
    const showDialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const currentPatient = computed(() => {
      return pacienteStore.selectedPatient || props.patientData
    })

    const fullName = computed(() => {
      if (!currentPatient.value) return ''
      return pacienteStore.getNombreCompleto(currentPatient.value)
    })

    const hasClinicalAlerts = computed(() => {
      return currentPatient.value?.alertas_clinicas && 
             currentPatient.value.alertas_clinicas.trim() !== ''
    })

    // Columnas de tablas
    const columnasPiezas = [
      {
        name: 'numero',
        label: 'Pieza',
        field: 'numero',
        align: 'center',
        sortable: true
      },
      {
        name: 'diagnostico',
        label: 'Diagnóstico',
        field: 'diagnostico',
        align: 'left',
        sortable: true
      },
      {
        name: 'estado_general',
        label: 'Estado',
        field: 'estado_general',
        align: 'center',
        sortable: true
      },
      {
        name: 'precio',
        label: 'Precio',
        field: 'precio',
        align: 'right',
        sortable: true
      }
    ]

    const columnasCitas = [
      {
        name: 'fecha',
        label: 'Fecha',
        field: 'fecha',
        align: 'left',
        sortable: true
      },
      {
        name: 'hora',
        label: 'Hora',
        field: 'hora',
        align: 'center'
      },
      {
        name: 'tipo_cita',
        label: 'Tipo',
        field: 'tipo_cita',
        align: 'center'
      },
      {
        name: 'asunto',
        label: 'Asunto',
        field: 'asunto',
        align: 'left'
      },
      {
        name: 'estado',
        label: 'Estado',
        field: 'estado',
        align: 'center',
        sortable: true
      }
    ]

    // Methods
    const formatDate = (dateString) => {
      if (!dateString) return 'No registrada'
      return pacienteStore.formatearFecha(dateString)
    }

    const calculateAge = (fechaNacimiento) => {
      if (!fechaNacimiento) return '--'
      return pacienteStore.calcularEdad(fechaNacimiento)
    }

    const formatMonto = (monto) => {
      return Number(monto || 0).toFixed(2)
    }

    const getEstadoColor = (estado) => {
      const colores = {
        'sano': 'positive',
        'enfermo': 'warning',
        'ausente': 'negative',
        'tratado': 'info'
      }
      return colores[estado] || 'grey'
    }

    const getEstadoCitaColor = (estado) => {
      const colores = {
        'programada': 'info',
        'confirmada': 'positive',
        'completada': 'primary',
        'cancelada': 'negative'
      }
      return colores[estado] || 'grey'
    }

    const formatEstadoCita = (estado) => {
      const estados = {
        'programada': 'Programada',
        'confirmada': 'Confirmada',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
      }
      return estados[estado] || estado
    }

    const getTipoCitaIcon = (tipo) => {
      const iconos = {
        'Consulta': 'fa-solid fa-stethoscope',
        'Limpieza': 'fa-solid fa-tooth',
        'Extracción': 'fa-solid fa-hand-holding-medical',
        'Ortodoncia': 'fa-solid fa-teeth',
        'Endodoncia': 'fa-solid fa-tooth',
        'Control': 'fa-solid fa-clipboard-check'
      }
      return iconos[tipo] || 'fa-solid fa-calendar'
    }

    const getTipoCitaColor = (tipo) => {
      const colores = {
        'Consulta': 'primary',
        'Limpieza': 'info',
        'Extracción': 'warning',
        'Ortodoncia': 'secondary',
        'Endodoncia': 'deep-purple',
        'Control': 'teal'
      }
      return colores[tipo] || 'grey'
    }

    const citasPorEstado = (estado) => {
      return citasPaciente.value.filter(c => c.estado === estado).length
    }

    const isRecetaValida = (validaHasta) => {
      if (!validaHasta) return false
      const hoy = new Date()
      const fechaValida = new Date(validaHasta)
      return fechaValida >= hoy
    }

    const getNombreDentista = (dentistaId) => {
      const dentista = dentistaStore.dentistas.find(d => d.id === dentistaId)
      if (!dentista) return 'No especificado'
      
      return [
        dentista.nombre,
        dentista.segundo_nombre,
        dentista.apellido_paterno,
        dentista.apellido_materno
      ].filter(Boolean).join(' ')
    }

    const cargarDatosOdontograma = async () => {
      if (!currentPatient.value?.ci) return
      
      loadingOdontograma.value = true
      try {
        await odontogramStore.cargarOdontogramaPorPaciente(currentPatient.value.ci)
      } catch (error) {
        console.error('Error cargando odontograma:', error)
      } finally {
        loadingOdontograma.value = false
      }
    }

    const cargarDatosCitas = async () => {
      if (!currentPatient.value?.id) return
      
      loadingCitas.value = true
      try {
        citasPaciente.value = await citaStore.cargarCitasPorPaciente(currentPatient.value.id)
      } catch (error) {
        console.error('Error cargando citas:', error)
        citasPaciente.value = []
      } finally {
        loadingCitas.value = false
      }
    }

    const cargarDatosRecetas = async () => {
      if (!currentPatient.value?.id) return
      
      loadingRecetas.value = true
      try {
        recetasPaciente.value = await recetaStore.obtenerRecetasPorPaciente(currentPatient.value.id)
      } catch (error) {
        console.error('Error cargando recetas:', error)
        recetasPaciente.value = []
      } finally {
        loadingRecetas.value = false
      }
    }

    const editPatient = () => {
      emit('edit-patient', currentPatient.value)
      showDialog.value = false
    }

    // Watchers
    watch(showDialog, async (newValue) => {
      if (newValue) {
        tab.value = 'info'
        
        // Cargar dentistas si no están cargados
        if (dentistaStore.dentistas.length === 0) {
          await dentistaStore.obtenerDentistas()
        }
        
        // Cargar datos iniciales
        await cargarDatosOdontograma()
        await cargarDatosCitas()
        await cargarDatosRecetas()
      } else {
        // Limpiar datos al cerrar
        odontogramStore.limpiarOdontograma()
        citasPaciente.value = []
        recetasPaciente.value = []
      }
    })

    return {
      showDialog,
      tab,
      currentPatient,
      fullName,
      hasClinicalAlerts,
      
      // Odontograma
      odontogramStore,
      loadingOdontograma,
      columnasPiezas,
      
      // Citas
      citasPaciente,
      loadingCitas,
      columnasCitas,
      citasPorEstado,
      
      // Recetas
      recetasPaciente,
      loadingRecetas,
      
      // Methods
      formatDate,
      calculateAge,
      editPatient,
      formatMonto,
      getEstadoColor,
      getEstadoCitaColor,
      formatEstadoCita,
      getTipoCitaIcon,
      getTipoCitaColor,
      isRecetaValida,
      getNombreDentista
    }
  }
}
</script>
<style scoped>
/* Contenedor principal - ALTURA FIJA */
.detail-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Header - FIJO */
.dialog-header {
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
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
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  color: white !important;
}

/* Tabs - FIJO */
.dialog-tabs {
  flex-shrink: 0;
  background: #f8f9fa;
  padding: 0;
}

.tabs-bar {
  background: white;
}

/* CRÍTICO: Contenido SCROLLEABLE */
.dialog-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ESTO ES LO MÁS IMPORTANTE - Los tab panels deben hacer scroll */
:deep(.q-tab-panels) {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
}

:deep(.q-tab-panel) {
  padding: 20px;
  height: auto !important;
}

/* Footer - FIJO */
.dialog-actions {
  flex-shrink: 0;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* Scrollbar visible y bonito */
:deep(.q-tab-panels)::-webkit-scrollbar {
  width: 10px;
}

:deep(.q-tab-panels)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

:deep(.q-tab-panels)::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 5px;
}

:deep(.q-tab-panels)::-webkit-scrollbar-thumb:hover {
  background: #5568d3;
}

/* Resto de estilos (mantén todos los demás estilos que ya tienes) */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.data-grid {
  display: grid;
  gap: 12px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
}

.data-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.data-value.highlight {
  color: #667eea;
}

.city-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.clinical-grid {
  display: grid;
  gap: 20px;
}

.clinical-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.clinical-data {
  display: grid;
  gap: 12px;
}

.clinical-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.clinical-item label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
}

.clinical-value {
  font-size: 14px;
  color: #2c3e50;
}

.clinical-value.description {
  line-height: 1.6;
  white-space: pre-wrap;
}

.clinical-alerts {
  border-left: 4px solid #ffc107;
  background: #fff3cd;
}

.card-title.alert {
  color: #856404;
}

.alert-content {
  background: white;
  padding: 12px;
  border-radius: 8px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #856404;
}

.no-alerts {
  border-left: 4px solid #28a745;
}

.no-alerts-content {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #6c757d;
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #d3d3d3;
}

.empty-section h4 {
  font-size: 18px;
  color: #6c757d;
  margin: 0;
}

.empty-section p {
  color: #adb5bd;
  margin: 0;
}

.odontogram-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.odontogram-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.summary-icon.cost {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-icon.dentition {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 500;
}

.summary-value {
  font-size: 18px;
  color: #2c3e50;
  font-weight: 700;
}

.odontogram-table {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.tooth-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-weight: 600;
}

.price-cell {
  font-weight: 600;
  color: #28a745;
}

.no-data-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-data-message i {
  font-size: 48px;
  color: #d3d3d3;
  margin-bottom: 16px;
  display: block;
}

.odontogram-info {
  display: grid;
  gap: 16px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 12px 0;
}

.info-section p {
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
}

.citas-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.citas-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
}

.stat-item.programada {
  color: #17a2b8;
  border-left: 4px solid #17a2b8;
}

.stat-item.confirmada {
  color: #28a745;
  border-left: 4px solid #28a745;
}

.stat-item.completada {
  color: #007bff;
  border-left: 4px solid #007bff;
}

.stat-item.cancelada {
  color: #dc3545;
  border-left: 4px solid #dc3545;
}

.date-cell,
.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.recetas-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recetas-header {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recetas-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.receta-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.receta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.receta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.receta-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.receta-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.receta-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.receta-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receta-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.receta-section p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
}

.medicamentos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.medicamento-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.medicamento-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.medicamento-number {
  font-weight: 700;
  color: #667eea;
}

.medicamento-name {
  font-weight: 600;
  color: #2c3e50;
}

.medicamento-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 6px;
}

.medicamento-indicaciones {
  font-size: 13px;
  color: #6c757d;
  font-style: italic;
}

.receta-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 13px;
  color: #6c757d;
  gap: 12px;
}

.receta-dentist,
.receta-validity-date {
  display: flex;
  align-items: center;
  gap: 6px;
}

.secondary-btn {
  color: #6c757d !important;
}

@media (max-width: 768px) {
  .detail-dialog {
    max-height: 95vh;
  }

  .info-grid,
  .odontogram-summary,
  .citas-stats {
    grid-template-columns: 1fr;
  }
  
  .data-item.full-width {
    grid-column: 1;
  }

  .dialog-header {
    padding: 16px;
  }

  .header-title {
    font-size: 18px;
  }

  .receta-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>