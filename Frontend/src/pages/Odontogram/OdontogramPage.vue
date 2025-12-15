<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row q-mb-lg items-center">
      <div class="col">
        <h4 class="text-h4 q-my-none">Odontograma</h4>
        <p class="text-grey-7">Gestión dental del paciente</p>
      </div>
    </div>

    <!-- Búsqueda de Paciente -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <SearchPatient @paciente-seleccionado="onPacienteSeleccionado" />
      </q-card-section>
    </q-card>

    <!-- Información del Paciente Seleccionado -->
    <q-card v-if="pacienteStore.selectedPatient" flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">
              {{ pacienteStore.getNombreCompleto(pacienteStore.selectedPatient) }}
            </div>
            <div class="text-grey-7">
              CI: {{ pacienteStore.selectedPatient.ci }} | 
              Edad: {{ pacienteStore.calcularEdad(pacienteStore.selectedPatient.fecha_nacimiento) }} años
            </div>
          </div>
          <div class="col-auto">
            <q-chip color="primary" text-color="white" icon="event">
              {{ pacienteStore.formatearFecha(pacienteStore.selectedPatient.fecha_nacimiento) }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Información del Odontograma -->
    <q-card v-if="odontogramStore.odontogramaActual" flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Información del Odontograma</div>
        
        <div class="row q-col-gutter-md">
          <!-- Tipo de Dentición -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="formOdontograma.tipo_denticion"
              label="Tipo de Dentición"
              outlined
              dense
              readonly
            >
              <template v-slot:prepend>
                <q-icon name="dental_services" />
              </template>
            </q-input>
          </div>

          <!-- Precio Total -->
          <div class="col-12 col-md-4">
            <q-input
              :model-value="'Bs. ' + odontogramStore.precioTotal.toFixed(2)"
              label="Precio Total Tratamiento"
              outlined
              dense
              readonly
            >
              <template v-slot:prepend>
                <q-icon name="paid" color="green" />
              </template>
            </q-input>
          </div>

          <!-- Número de Piezas en Tratamiento -->
          <div class="col-12 col-md-4">
            <q-input
              :model-value="odontogramStore.piezas.length + ' piezas'"
              label="Piezas en Tratamiento"
              outlined
              dense
              readonly
            >
              <template v-slot:prepend>
                <q-icon name="format_list_numbered" color="blue" />
              </template>
            </q-input>
          </div>

          <!-- Diagnóstico General -->
          <div class="col-12">
            <q-input
              v-model="formOdontograma.diagnostico_general"
              label="Diagnóstico General"
              outlined
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>

          <!-- Plan de Tratamiento -->
          <div class="col-12">
            <q-input
              v-model="formOdontograma.plan_tratamiento"
              label="Plan de Tratamiento"
              outlined
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="assignment" />
              </template>
            </q-input>
          </div>

          <!-- Notas -->
          <div class="col-12">
            <q-input
              v-model="formOdontograma.notas"
              label="Notas Adicionales"
              outlined
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="note" />
              </template>
            </q-input>
          </div>

          <!-- Botón Guardar Cambios -->
          <div class="col-12 text-right">
            <q-btn
              color="primary"
              label="Guardar Cambios"
              icon="save"
              @click="guardarCambiosOdontograma"
              :loading="odontogramStore.loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Odontograma Visual -->
    <q-card v-if="odontogramStore.odontogramaActual" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md text-center">Esquema Dental</div>

        <!-- Dientes Superiores -->
        <div class="row justify-center q-mb-xl">
          <!-- Cuadrante Superior Derecho (18-11) -->
          <div class="row reverse">
            <ToothComponent
              v-for="numero in [18, 17, 16, 15, 14, 13, 12, 11]"
              :key="numero"
              :numero="numero"
              posicion="up"
              :pieza="odontogramStore.getPiezaPorNumero(numero)"
              :caras="odontogramStore.getCarasDePieza(odontogramStore.getPiezaPorNumero(numero)?.id)"
              @click="onToothClick(numero, 'up')"
            />
          </div>

          <div class="q-mx-lg"></div>

          <!-- Cuadrante Superior Izquierdo (21-28) -->
          <div class="row">
            <ToothComponent
              v-for="numero in [21, 22, 23, 24, 25, 26, 27, 28]"
              :key="numero"
              :numero="numero"
              posicion="up"
              :pieza="odontogramStore.getPiezaPorNumero(numero)"
              :caras="odontogramStore.getCarasDePieza(odontogramStore.getPiezaPorNumero(numero)?.id)"
              @click="onToothClick(numero, 'up')"
            />
          </div>
        </div>

        <!-- Dientes Inferiores -->
        <div class="row justify-center">
          <!-- Cuadrante Inferior Derecho (48-41) -->
          <div class="row reverse">
            <ToothComponent
              v-for="numero in [48, 47, 46, 45, 44, 43, 42, 41]"
              :key="numero"
              :numero="numero"
              posicion="down"
              :pieza="odontogramStore.getPiezaPorNumero(numero)"
              :caras="odontogramStore.getCarasDePieza(odontogramStore.getPiezaPorNumero(numero)?.id)"
              @click="onToothClick(numero, 'down')"
            />
          </div>

          <div class="q-mx-lg"></div>

          <!-- Cuadrante Inferior Izquierdo (31-38) -->
          <div class="row">
            <ToothComponent
              v-for="numero in [31, 32, 33, 34, 35, 36, 37, 38]"
              :key="numero"
              :numero="numero"
              posicion="down"
              :pieza="odontogramStore.getPiezaPorNumero(numero)"
              :caras="odontogramStore.getCarasDePieza(odontogramStore.getPiezaPorNumero(numero)?.id)"
              @click="onToothClick(numero, 'down')"
            />
          </div>
        </div>

        <!-- Leyenda -->
        <div class="row justify-center q-mt-xl">
          <div class="col-auto q-pa-md">
            <div class="text-subtitle2 q-mb-sm">Estados:</div>
            <q-chip size="sm" color="grey-3" text-color="grey-8">Sano</q-chip>
            <q-chip size="sm" color="red-3" text-color="red-9">Enfermo</q-chip>
            <q-chip size="sm" color="green-3" text-color="green-9">Tratado</q-chip>
            <q-chip size="sm" color="grey-8" text-color="white">Ausente</q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="odontogramStore.loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="text-grey-7 q-mt-md">Cargando odontograma...</p>
    </div>

    <!-- Empty State -->
    <q-card v-if="!pacienteStore.selectedPatient && !odontogramStore.loading" flat bordered>
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="person_search" size="80px" color="grey-5" />
        <p class="text-h6 text-grey-7 q-mt-md">Selecciona un paciente para comenzar</p>
        <p class="text-grey-6">Busca por CI o nombre del paciente</p>
      </q-card-section>
    </q-card>

    <!-- Modal de Pieza -->
    <PiezaModal
      v-model="showPiezaModal"
      :numero-diente="numeroDienteSeleccionado"
      :posicion="posicionDienteSeleccionado"
    />
  </q-page>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePacienteStore } from 'src/stores/pacienteStore'
import { useOdontogramStore } from 'src/stores/odontogramStore'
import SearchPatient from 'src/components/SearchPatien.vue'
import ToothComponent from 'src/components/ToothComponent.vue'
import PiezaModal from 'src/components/PiezaModal.vue'

const $q = useQuasar()
const pacienteStore = usePacienteStore()
const odontogramStore = useOdontogramStore()

// State
const showPiezaModal = ref(false)
const numeroDienteSeleccionado = ref(null)
const posicionDienteSeleccionado = ref(null)

const formOdontograma = reactive({
  tipo_denticion: 'Permanente',
  diagnostico_general: '',
  plan_tratamiento: '',
  notas: ''
})

onMounted(async () => {
  if (pacienteStore.pacientes.length === 0){
    await pacienteStore.cargarPacientes()
  }
})

// Watch para actualizar form cuando cambia el odontograma
watch(() => odontogramStore.odontogramaActual, (nuevoOdontograma) => {
  if (nuevoOdontograma) {
    formOdontograma.tipo_denticion = nuevoOdontograma.tipo_denticion
    formOdontograma.diagnostico_general = nuevoOdontograma.diagnostico_general || ''
    formOdontograma.plan_tratamiento = nuevoOdontograma.plan_tratamiento || ''
    formOdontograma.notas = nuevoOdontograma.notas || ''
  }
})

// Handlers
const onPacienteSeleccionado = async (paciente) => {
  try {
    await odontogramStore.cargarOdontogramaPorPaciente(paciente.ci)
    
    $q.notify({
      type: 'positive',
      message: 'Odontograma cargado correctamente',
      position: 'top-right'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar odontograma' + error.messagec,
      position: 'top-right'
    })
  }
}

const onToothClick = async (numero, posicion) => {
  numeroDienteSeleccionado.value = numero
  posicionDienteSeleccionado.value = posicion
  
  try {
    // Obtener o crear la pieza
    await odontogramStore.obtenerOCrearPieza(numero, posicion)
    
    // Abrir modal
    showPiezaModal.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar información del diente' + error.message,
      position: 'top-right'
    })
  }
}

const guardarCambiosOdontograma = async () => {
  try {
    await odontogramStore.actualizarOdontograma(formOdontograma)
    
    $q.notify({
      type: 'positive',
      message: 'Cambios guardados correctamente',
      position: 'top-right'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar cambios' + error.message,
      position: 'top-right'
    })
  }
}
</script>

<style scoped>
.reverse {
  flex-direction: row-reverse;
}
</style>