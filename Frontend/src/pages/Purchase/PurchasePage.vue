<template>
  <div class="purchase-page-container">
    <!-- Header Section -->
    <div class="purchase-header-background">
      <div class="purchase-header-shape purchase-header-shape-1"></div>
      <div class="purchase-header-shape purchase-header-shape-2"></div>
    </div>
    
    <div class="purchase-page-header">
      <div class="purchase-header-content">
        <div class="purchase-title-section">
          <div class="purchase-icon-wrapper">
            <i class="fa-solid fa-credit-card purchase-header-icon"></i>
          </div>
          <div>
            <h1 class="purchase-page-title">Gestión de Pagos</h1>
            <p class="purchase-page-subtitle">Control de pagos por tratamientos dentales</p>
          </div>
        </div>
        
        <div class="purchase-header-actions">
          <q-btn
            class="purchase-secondary-btn"
            icon="fa-solid fa-file-pdf"
            label="Reporte Global PDF"
            @click="generarReporteGlobal"
            outline
            no-caps
            size="md"
          />
        </div>
      </div>
    </div>

    <!-- Búsqueda de Paciente -->
    <div class="purchase-search-section">
      <div class="purchase-search-container">
        <div style="flex: 1;">
          <q-select
            v-model="pacienteSeleccionado"
            :options="opcionesPacientes"
            label="Seleccionar Paciente"
            outlined
            use-input
            input-debounce="300"
            @filter="filtrarPacientes"
            @update:model-value="seleccionarPaciente"
            clearable
            option-value="ci"
            option-label="label"
            emit-value
            map-options
            class="purchase-search-input"
            :loading="pacienteStore.loading"
          >
            <template v-slot:prepend>
              <i class="fa-solid fa-user-injured"></i>
            </template>

            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No se encontraron pacientes
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="md">
                    <i class="fa-solid fa-user"></i>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                  <q-item-label caption>CI: {{ scope.opt.ci }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:selected-item="scope">
              <div class="selected-patient-chip">
                <q-avatar color="primary" text-color="white" size="sm">
                  <i class="fa-solid fa-user"></i>
                </q-avatar>
                <span class="q-ml-sm">{{ scope.opt.nombre }} (CI: {{ scope.opt.ci }})</span>
              </div>
            </template>
          </q-select>
        </div>
      </div>
    </div>

    <!-- Información del Paciente Seleccionado -->
    <div v-if="pacienteActual" class="purchase-patient-info">
      <div class="patient-info-card">
        <div class="patient-avatar">
          <i class="fa-solid fa-user-circle"></i>
        </div>
        <div class="patient-details">
          <h3 class="patient-name">{{ nombreCompletoPaciente }}</h3>
          <p class="patient-ci">CI: {{ pacienteActual.ci }}</p>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="limpiarPaciente"
          color="grey-7"
        >
          <q-tooltip>Limpiar selección</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Stats Section -->
    <div v-if="pacienteActual" class="purchase-stats-section">
      <div class="purchase-stat-card">
        <div class="purchase-stat-icon-container total">
          <i class="fa-solid fa-tooth"></i>
        </div>
        <div class="purchase-stat-content">
          <div class="purchase-stat-value">{{ odontogramStore.piezas.length }}</div>
          <div class="purchase-stat-label">Piezas en Tratamiento</div>
        </div>
        <div class="purchase-stat-glow total"></div>
      </div>

      <div class="purchase-stat-card">
        <div class="purchase-stat-icon-container pending">
          <i class="fa-solid fa-dollar-sign"></i>
        </div>
        <div class="purchase-stat-content">
          <div class="purchase-stat-value">Bs. {{ formatearMonto(odontogramStore.precioTotal) }}</div>
          <div class="purchase-stat-label">Costo Total Tratamiento</div>
        </div>
        <div class="purchase-stat-glow pending"></div>
      </div>

      <div class="purchase-stat-card">
        <div class="purchase-stat-icon-container month">
          <i class="fa-solid fa-check-circle"></i>
        </div>
        <div class="purchase-stat-content">
          <div class="purchase-stat-value">Bs. {{ formatearMonto(pagoStore.totalPagado) }}</div>
          <div class="purchase-stat-label">Total Pagado</div>
        </div>
        <div class="purchase-stat-glow month"></div>
      </div>

      <div class="purchase-stat-card">
        <div class="purchase-stat-icon-container average">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div class="purchase-stat-content">
          <div class="purchase-stat-value">Bs. {{ formatearMonto(pagoStore.totalPendiente) }}</div>
          <div class="purchase-stat-label">Saldo Pendiente</div>
        </div>
        <div class="purchase-stat-glow average"></div>
      </div>
    </div>

    <!-- Tabla de Piezas con Pagos -->
    <div v-if="pacienteActual" class="purchase-table-container">
      <div class="purchase-table-header">
        <div class="purchase-table-title-section">
          <h3 class="purchase-table-title">Piezas Dentales y Pagos</h3>
          <div class="purchase-table-underline"></div>
        </div>
        <div class="purchase-table-actions">
          <div class="purchase-results-count">
            <span class="purchase-count-badge">
              <i class="fa-solid fa-tooth"></i>
              {{ odontogramStore.piezas.length }} pieza{{ odontogramStore.piezas.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <q-table
        class="purchase-data-table"
        flat
        :rows="odontogramStore.piezas"
        :columns="columnasPiezas"
        row-key="id"
        :rows-per-page-options="[10, 20, 50]"
        :pagination="{ rowsPerPage: 10 }"
        separator="cell"
        :loading="odontogramStore.loading"
      >
        <template v-slot:no-data>
          <div class="purchase-no-data-container">
            <div class="purchase-no-data-illustration">
              <i class="fa-solid fa-tooth purchase-no-data-icon"></i>
            </div>
            <p class="purchase-no-data-text">No hay piezas en tratamiento</p>
            <p class="purchase-no-data-subtext">Este paciente no tiene piezas dentales registradas</p>
          </div>
        </template>

        <template v-slot:body-cell-numero="props">
          <q-td :props="props">
            <div class="tooth-number-badge">
              <i class="fa-solid fa-tooth"></i>
              {{ props.value }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-precio="props">
          <q-td :props="props">
            <span class="purchase-amount-cell">Bs. {{ formatearMonto(props.value) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-total_pagado="props">
          <q-td :props="props">
            <span class="purchase-amount-cell text-positive">
              Bs. {{ formatearMonto(calcularTotalesPieza(props.row).total_pagado) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-total_pendiente="props">
          <q-td :props="props">
            <span class="purchase-amount-cell text-warning">
              Bs. {{ formatearMonto(calcularTotalesPieza(props.row).total_pendiente) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-progreso="props">
          <q-td :props="props">
            <div class="progress-container">
              <q-linear-progress
                :value="calcularTotalesPieza(props.row).porcentaje_pagado / 100"
                :color="getColorProgreso(calcularTotalesPieza(props.row).porcentaje_pagado)"
                size="8px"
                rounded
              />
              <span class="progress-label">{{ calcularTotalesPieza(props.row).porcentaje_pagado }}%</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <div class="purchase-action-buttons">
              <q-btn
                class="purchase-action-btn purchase-view-btn"
                flat
                dense
                round
                icon="fa-solid fa-history"
                size="sm"
                @click="verHistorialPagos(props.row)"
                color="grey-8"
              >
                <q-tooltip>Ver historial</q-tooltip>
              </q-btn>
              
              <q-btn
                class="purchase-action-btn purchase-edit-btn"
                flat
                dense
                round
                icon="fa-solid fa-plus-circle"
                size="sm"
                @click="abrirDialogoPago(props.row)"
                color="primary"
                :disable="calcularTotalesPieza(props.row).total_pendiente <= 0"
              >
                <q-tooltip>Registrar pago</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Estado Sin Paciente -->
    <div v-else class="purchase-no-patient">
      <div class="purchase-empty-state">
        <div class="purchase-empty-illustration">
          <i class="fa-solid fa-user-injured purchase-empty-icon"></i>
          <div class="purchase-empty-circle purchase-empty-circle-1"></div>
          <div class="purchase-empty-circle purchase-empty-circle-2"></div>
        </div>
        <h3 class="purchase-empty-title">Selecciona un paciente</h3>
        <p class="purchase-empty-description">
          Selecciona un paciente del listado para ver sus tratamientos y pagos
        </p>
      </div>
    </div>

    <!-- Diálogo: Registrar Pago -->
    <q-dialog v-model="dialogoPago" persistent>
      <q-card class="purchase-dialog-card" style="min-width: 500px;">
        <q-card-section class="purchase-dialog-header">
          <div class="purchase-dialog-title-wrapper">
            <i class="fa-solid fa-money-bill-wave purchase-dialog-icon"></i>
            <h6 class="purchase-dialog-title">Registrar Pago</h6>
          </div>
          <q-btn flat round dense icon="close" @click="cerrarDialogoPago" />
        </q-card-section>

        <q-separator />

        <q-card-section class="purchase-dialog-content">
          <!-- Info Pieza -->
          <div v-if="piezaSeleccionada" class="payment-piece-info">
            <div class="piece-info-row">
              <span class="piece-info-label">Pieza Dental:</span>
              <span class="piece-info-value">
                <i class="fa-solid fa-tooth"></i> {{ piezaSeleccionada.numero }}
              </span>
            </div>
            <div class="piece-info-row">
              <span class="piece-info-label">Diagnóstico:</span>
              <span class="piece-info-value">{{ piezaSeleccionada.diagnostico || 'Sin diagnóstico' }}</span>
            </div>
            <div class="piece-info-row">
              <span class="piece-info-label">Precio Total:</span>
              <span class="piece-info-value text-bold">Bs. {{ formatearMonto(piezaSeleccionada.precio) }}</span>
            </div>
            <div class="piece-info-row">
              <span class="piece-info-label">Ya Pagado:</span>
              <span class="piece-info-value text-positive">Bs. {{ formatearMonto(totalesPiezaActual.total_pagado) }}</span>
            </div>
            <div class="piece-info-row highlight">
              <span class="piece-info-label">Saldo Pendiente:</span>
              <span class="piece-info-value text-warning text-bold">Bs. {{ formatearMonto(totalesPiezaActual.total_pendiente) }}</span>
            </div>
          </div>

          <q-separator spaced />

          <!-- Formulario -->
          <q-form @submit="guardarPago" class="purchase-form">
            <q-input
              v-model.number="formPago.monto"
              label="Monto a Pagar *"
              type="number"
              step="0.01"
              min="0.01"
              :max="totalesPiezaActual.total_pendiente"
              outlined
              :rules="[
                val => val > 0 || 'El monto debe ser mayor a 0',
                val => val <= totalesPiezaActual.total_pendiente || 'El monto excede el saldo pendiente'
              ]"
              prefix="Bs."
            />

            <q-select
              v-model="formPago.tipo_pago"
              :options="opcionesMetodoPago"
              label="Método de Pago *"
              outlined
              emit-value
              map-options
            />

            <q-input
              v-model="formPago.notas"
              label="Notas (opcional)"
              type="textarea"
              outlined
              rows="3"
            />
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions class="purchase-dialog-actions">
          <q-btn
            flat
            label="Cancelar"
            @click="cerrarDialogoPago"
            no-caps
            class="purchase-cancel-btn"
          />
          <q-btn
            unelevated
            label="Registrar Pago"
            @click="guardarPago"
            :loading="guardando"
            no-caps
            class="purchase-primary-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo: Historial de Pagos -->
    <q-dialog v-model="dialogoHistorial">
      <q-card class="purchase-dialog-card" style="min-width: 700px;">
        <q-card-section class="purchase-dialog-header">
          <div class="purchase-dialog-title-wrapper">
            <i class="fa-solid fa-history purchase-dialog-icon"></i>
            <h6 class="purchase-dialog-title">Historial de Pagos - Pieza {{ piezaSeleccionada?.numero }}</h6>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="purchase-dialog-content">
          <q-table
            :rows="pagosHistorial"
            :columns="columnasHistorial"
            row-key="id"
            flat
            dense
            :rows-per-page-options="[5, 10]"
            :pagination="{ rowsPerPage: 5 }"
          >
            <template v-slot:body-cell-monto="props">
              <q-td :props="props">
                <span class="purchase-amount-cell">Bs. {{ formatearMonto(props.value) }}</span>
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <div class="purchase-status-badge" :class="getEstadoClass(props.value)">
                  <i :class="getEstadoIcon(props.value)"></i>
                  {{ formatearEstado(props.value) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-tipo_pago="props">
              <q-td :props="props">
                <div class="purchase-method-badge">
                  <i :class="getMetodoIcon(props.value)"></i>
                  {{ formatearMetodoPago(props.value) }}
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useOdontogramStore } from 'src/stores/odontogramStore'
import { usePagoStore } from 'src/stores/pagoStore'
import { usePacienteStore } from 'src/stores/pacienteStore'
import { generarReportePagosGlobal } from '../../utils/reportePagoPDF'

export default {
  name: 'PurchasePage',
  setup() {
    const $q = useQuasar()
    const odontogramStore = useOdontogramStore()
    const pagoStore = usePagoStore()
    const pacienteStore = usePacienteStore()

    // ============================================
    // STATE
    // ============================================
    const pacienteSeleccionado = ref(null)
    const pacienteActual = ref(null)
    const opcionesPacientesFiltradas = ref([])
    const dialogoPago = ref(false)
    const dialogoHistorial = ref(false)
    const guardando = ref(false)
    const piezaSeleccionada = ref(null)
    const pagosHistorial = ref([])

    const formPagoInicial = {
      monto: 0,
      tipo_pago: 'efectivo',
      notas: ''
    }
    const formPago = ref({ ...formPagoInicial })

    // ============================================
    // OPCIONES
    // ============================================
    const opcionesMetodoPago = [
      { label: 'Efectivo', value: 'efectivo' },
      { label: 'Transferencia', value: 'transferencia' },
      { label: 'QR', value: 'qr' }
    ]

    // Opciones de pacientes para el select
    const opcionesPacientes = computed(() => {
      return pacienteStore.pacientesFiltrados.map(paciente => ({
        label: `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`,
        nombre: `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`,
        ci: paciente.ci,
        value: paciente.ci,
        ...paciente
      }))
    })

    // ============================================
    // COLUMNAS TABLAS
    // ============================================
    const columnasPiezas = [
      {
        name: 'numero',
        required: true,
        label: 'Pieza',
        align: 'center',
        field: 'numero',
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
        name: 'precio',
        label: 'Precio Total',
        field: 'precio',
        align: 'right',
        sortable: true
      },
      {
        name: 'total_pagado',
        label: 'Pagado',
        align: 'right',
        sortable: true
      },
      {
        name: 'total_pendiente',
        label: 'Pendiente',
        align: 'right',
        sortable: true
      },
      {
        name: 'progreso',
        label: 'Progreso',
        align: 'center'
      },
      {
        name: 'acciones',
        label: 'Acciones',
        align: 'center'
      }
    ]

    const columnasHistorial = [
      {
        name: 'created_at',
        label: 'Fecha',
        field: 'created_at',
        format: val => formatearFecha(val),
        sortable: true,
        align: 'left'
      },
      {
        name: 'monto',
        label: 'Monto',
        field: 'monto',
        align: 'right'
      },
      {
        name: 'tipo_pago',
        label: 'Método',
        field: 'tipo_pago',
        align: 'center'
      },
      {
        name: 'estado',
        label: 'Estado',
        field: 'estado',
        align: 'center'
      },
      {
        name: 'notas',
        label: 'Notas',
        field: 'notas',
        align: 'left'
      }
    ]

    // ============================================
    // COMPUTED
    // ============================================
    const nombreCompletoPaciente = computed(() => {
      if (!pacienteActual.value) return ''
      return pacienteStore.getNombreCompleto(pacienteActual.value)
    })

    const totalesPiezaActual = computed(() => {
      if (!piezaSeleccionada.value) {
        return { precio_total: 0, total_pagado: 0, total_pendiente: 0, porcentaje_pagado: 0 }
      }
      return pagoStore.getTotalesPieza(piezaSeleccionada.value.id, piezaSeleccionada.value.precio)
    })

    // ============================================
    // MÉTODOS - BÚSQUEDA Y SELECCIÓN
    // ============================================
    const filtrarPacientes = (val, update) => {
      update(() => {
        if (val === '') {
          opcionesPacientesFiltradas.value = opcionesPacientes.value
        } else {
          const needle = val.toLowerCase()
          opcionesPacientesFiltradas.value = opcionesPacientes.value.filter(
            v => v.label.toLowerCase().indexOf(needle) > -1 || 
                 v.ci.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }

    const seleccionarPaciente = async (ci) => {
      if (!ci) {
        limpiarPaciente()
        return
      }

      try {
        $q.loading.show({ message: 'Cargando datos del paciente...' })

        // Buscar el paciente completo
        const paciente = pacienteStore.pacientes.find(p => p.ci === ci)
        
        if (!paciente) {
          $q.notify({
            type: 'negative',
            message: 'Paciente no encontrado',
            position: 'top-right'
          })
          return
        }

        pacienteActual.value = paciente

        // Cargar odontograma y pagos
        await odontogramStore.cargarOdontogramaPorPaciente(paciente.ci)
        await pagoStore.cargarPagosPorPaciente(paciente.ci)

        $q.notify({
          type: 'positive',
          message: `Datos cargados: ${pacienteStore.getNombreCompleto(paciente)}`,
          position: 'top-right',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error seleccionando paciente:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar los datos del paciente',
          position: 'top-right'
        })
      } finally {
        $q.loading.hide()
      }
    }

    const limpiarPaciente = () => {
      pacienteActual.value = null
      pacienteSeleccionado.value = null
      odontogramStore.limpiarOdontograma()
      pagoStore.limpiarPagos()
    }

    // ============================================
    // MÉTODOS - CÁLCULOS
    // ============================================
    const calcularTotalesPieza = (pieza) => {
      return pagoStore.getTotalesPieza(pieza.id, pieza.precio)
    }

    const getColorProgreso = (porcentaje) => {
      if (porcentaje >= 100) return 'positive'
      if (porcentaje >= 50) return 'warning'
      return 'negative'
    }

    // ============================================
    // MÉTODOS - DIÁLOGOS
    // ============================================
    const abrirDialogoPago = (pieza) => {
      piezaSeleccionada.value = pieza
      formPago.value = { ...formPagoInicial }
      dialogoPago.value = true
    }

    const cerrarDialogoPago = () => {
      dialogoPago.value = false
      piezaSeleccionada.value = null
      formPago.value = { ...formPagoInicial }
    }

    const verHistorialPagos = async (pieza) => {
      piezaSeleccionada.value = pieza
      
      try {
        pagosHistorial.value = await pagoStore.cargarPagosPorPieza(pieza.id)
        dialogoHistorial.value = true
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al cargar el historial' + error.message,
          position: 'top-right'
        })
      }
    }

    const guardarPago = async () => {
      if (!piezaSeleccionada.value || !formPago.value.monto || formPago.value.monto <= 0) {
        $q.notify({
          type: 'warning',
          message: 'Completa todos los campos requeridos',
          position: 'top-right'
        })
        return
      }

      guardando.value = true
      try {
        await pagoStore.crearPago(
          {
            id_pieza: piezaSeleccionada.value.id,
            ...formPago.value
          },
          piezaSeleccionada.value.precio
        )

        $q.notify({
          type: 'positive',
          message: 'Pago registrado exitosamente',
          position: 'top-right',
          icon: 'check_circle'
        })

        cerrarDialogoPago()
      } catch (error) {
        console.error('Error guardando pago:', error)
        $q.notify({
          type: 'negative',
          message: error.message || 'Error al registrar el pago',
          position: 'top-right'
        })
      } finally {
        guardando.value = false
      }
    }

    // ============================================
    // MÉTODOS - REPORTE PDF
    // ============================================
    const generarReporteGlobal = async () => {
      try {
        $q.loading.show({
          message: 'Generando reporte global de ingresos...'
        })

        await generarReportePagosGlobal()

        $q.notify({
          type: 'positive',
          message: 'Reporte PDF generado exitosamente',
          position: 'top-right',
          icon: 'picture_as_pdf'
        })
      } catch (error) {
        console.error('Error generando reporte:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al generar el reporte PDF',
          position: 'top-right'
        })
      } finally {
        $q.loading.hide()
      }
    }

    // ============================================
    // MÉTODOS - FORMATEO
    // ============================================
    const formatearMonto = (monto) => {
      return new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(monto || 0)
    }

    const formatearFecha = (fecha) => {
      if (!fecha) return '--'
      try {
        return new Date(fecha).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch {
        return '--'
      }
    }

    const formatearEstado = (estado) => {
      const estados = {
        'completado': 'Completado',
        'pendiente': 'Pendiente',
        'cancelado': 'Cancelado'
      }
      return estados[estado] || estado
    }

    const formatearMetodoPago = (metodo) => {
      const metodos = {
        'efectivo': 'Efectivo',
        'stripe': 'Stripe',
        'transferencia': 'Transferencia',
        'qr': 'QR'
      }
      return metodos[metodo] || metodo
    }

    const getEstadoClass = (estado) => {
      return `purchase-status-${estado}`
    }

    const getEstadoIcon = (estado) => {
      const iconos = {
        'completado': 'fa-solid fa-check-circle',
        'pendiente': 'fa-solid fa-clock',
        'cancelado': 'fa-solid fa-times-circle'
      }
      return iconos[estado] || 'fa-solid fa-question-circle'
    }

    const getMetodoIcon = (metodo) => {
      const iconos = {
        'efectivo': 'fa-solid fa-money-bill',
        'stripe': 'fa-solid fa-credit-card',
        'transferencia': 'fa-solid fa-exchange-alt',
        'qr': 'fa-solid fa-qrcode'
      }
      return iconos[metodo] || 'fa-solid fa-money-bill'
    }

    // ============================================
    // LIFECYCLE
    // ============================================
    onMounted(async () => {
      // Cargar todos los pacientes
      await pacienteStore.cargarPacientes()
    })

    return {
      // State
      pacienteSeleccionado,
      pacienteActual,
      opcionesPacientesFiltradas,
      dialogoPago,
      dialogoHistorial,
      guardando,
      piezaSeleccionada,
      pagosHistorial,
      formPago,

      // Stores
      odontogramStore,
      pagoStore,
      pacienteStore,

      // Opciones
      opcionesMetodoPago,
      opcionesPacientes,

      // Tablas
      columnasPiezas,
      columnasHistorial,

      // Computed
      nombreCompletoPaciente,
      totalesPiezaActual,

      // Métodos
      filtrarPacientes,
      seleccionarPaciente,
      limpiarPaciente,
      calcularTotalesPieza,
      getColorProgreso,
      abrirDialogoPago,
      cerrarDialogoPago,
      verHistorialPagos,
      guardarPago,
      generarReporteGlobal,
      formatearMonto,
      formatearFecha,
      formatearEstado,
      formatearMetodoPago,
      getEstadoClass,
      getEstadoIcon,
      getMetodoIcon
    }
  }
}
</script>

<style scoped>
/* Agrega estos estilos adicionales a tus estilos existentes */

.selected-patient-chip {
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.purchase-search-input {
  font-size: 16px;
}

.purchase-search-input .q-field__prepend {
  color: #667eea;
}

/* Mantén todos tus demás estilos existentes */
</style>

<style scoped>
/* Mantén todos tus estilos existentes aquí */
/* Solo agrego algunos estilos adicionales necesarios */

.purchase-patient-info {
  max-width: 1400px;
  margin: 0 auto 24px;
  padding: 0 24px;
}

.patient-info-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.patient-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}

.patient-details {
  flex: 1;
}

.patient-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.patient-ci {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.tooth-number-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 600;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.progress-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 600;
}

.payment-piece-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.piece-info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.piece-info-row:last-child {
  border-bottom: none;
}

.piece-info-row.highlight {
  background: #fff3cd;
  padding: 12px;
  margin: 8px -8px -8px;
  border-radius: 0 0 12px 12px;
}

.piece-info-label {
  color: #6c757d;
  font-weight: 500;
}

.piece-info-value {
  color: #212529;
  font-weight: 600;
}

.purchase-no-patient {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.purchase-empty-state {
  text-align: center;
  max-width: 400px;
}

.purchase-empty-illustration {
  position: relative;
  margin: 0 auto 32px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.purchase-empty-icon {
  font-size: 64px;
  color: #667eea;
  z-index: 2;
  position: relative;
}

.purchase-empty-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.purchase-empty-circle-1 {
  width: 100%;
  height: 100%;
  animation: pulse 2s ease-in-out infinite;
}

.purchase-empty-circle-2 {
  width: 80%;
  height: 80%;
  animation: pulse 2s ease-in-out infinite 1s;
}

.purchase-empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.purchase-empty-description {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}
</style>