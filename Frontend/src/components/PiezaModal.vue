<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 700px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Diente {{ numeroDiente }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 70vh" class="scroll">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="pieza" label="Información de Pieza" icon="medical_services" />
          <q-tab name="caras" label="Caras del Diente" icon="view_in_ar" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Panel de Pieza -->
          <q-tab-panel name="pieza">
            <div class="row q-col-gutter-md">
              <!-- Estado General -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formPieza.estado_general"
                  :options="opcionesEstado"
                  label="Estado General *"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="healing" />
                  </template>
                </q-select>
              </div>

              <!-- Precio -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formPieza.precio"
                  type="number"
                  label="Precio (Bs.) *"
                  outlined
                  dense
                  min="0"
                  step="0.01"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" />
                  </template>
                </q-input>
              </div>

              <!-- Dentición -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formPieza.denticion"
                  :options="opcionesDenticion"
                  label="Dentición *"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="baby_changing_station" />
                  </template>
                </q-select>
              </div>

              <!-- Imagen del Diente -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formPieza.image_tooth"
                  :options="opcionesImagen"
                  label="Imagen del Diente"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="image" />
                  </template>
                </q-select>
              </div>

              <!-- Símbolo -->
              <div class="col-12">
                <q-select
                  v-model="formPieza.simbolo"
                  :options="opcionesSimbolo"
                  label="Símbolo"
                  outlined
                  dense
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="category" />
                  </template>
                </q-select>
              </div>

              <!-- Diagnóstico -->
              <div class="col-12">
                <q-input
                  v-model="formPieza.diagnostico"
                  label="Diagnóstico"
                  outlined
                  type="textarea"
                  rows="3"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-input>
              </div>

              <!-- Notas del Símbolo -->
              <div class="col-12">
                <q-input
                  v-model="formPieza.notas_simbolo"
                  label="Notas del Símbolo"
                  outlined
                  type="textarea"
                  rows="2"
                >
                  <template v-slot:prepend>
                    <q-icon name="note" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-tab-panel>

          <!-- Panel de Caras -->
          <q-tab-panel name="caras">
            <div class="q-mb-md">
              <q-btn
                color="primary"
                label="Agregar Cara"
                icon="add"
                @click="abrirFormularioCara(null)"
                :disable="!odontogramStore.piezaSeleccionada"
              />
            </div>

            <!-- Lista de Caras -->
            <div v-if="carasDePieza.length > 0" class="q-gutter-sm">
              <q-card
                v-for="cara in carasDePieza"
                :key="cara.id"
                flat
                bordered
              >
                <q-card-section class="row items-center">
                  <div class="col">
                    <div class="text-subtitle1">{{ cara.cara }}</div>
                    <div class="text-caption text-grey-7">
                      {{ cara.tipo_simbologia }} - {{ cara.valor_simbologia }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <div 
                      class="cara-color-preview"
                      :style="{ backgroundColor: cara.color }"
                    ></div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      color="primary"
                      @click="abrirFormularioCara(cara)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      @click="eliminarCaraConfirm(cara.id)"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div v-else class="text-center text-grey-7 q-pa-lg">
              <q-icon name="info" size="48px" />
              <p>No hay caras registradas para este diente</p>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
        <q-btn
          v-if="odontogramStore.piezaSeleccionada && formPieza.precio > 0"
          flat
          label="Pagar"
          color="secondary"
          icon="payment"
          @click="abrirModalPago"
        />
        <q-btn
          flat
          label="Guardar Pieza"
          color="primary"
          @click="guardarPieza"
          :loading="odontogramStore.loadingPieza"
        />
      </q-card-actions>
    </q-card>

    <!-- Modal de Cara -->
    <CaraModal
      v-model="showCaraModal"
      :cara="caraSeleccionada"
      @guardar="guardarCara"
    />

    <!-- Modal de Pago -->
    <PagoStripeModal
      v-model="showPagoModal"
      :pieza="datosPiezaPago"
      @pago-exitoso="onPagoExitoso"
    />
    
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useOdontogramStore } from 'src/stores/odontogramStore'
import CaraModal from 'src/components/CaraModal.vue'
import PagoStripeModal from 'src/components/PagoStripeModal.vue'

const props = defineProps({
  modelValue: Boolean,
  numeroDiente: Number,
  posicion: String
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const odontogramStore = useOdontogramStore()

// State
const tab = ref('pieza')
const showCaraModal = ref(false)
const caraSeleccionada = ref(null)
const showPagoModal = ref(false)

const formPieza = reactive({
  numero: null,
  denticion: 'permanente',
  estado_general: 'enfermo',
  precio: 0,
  diagnostico: '',
  image_tooth: 'tooth_up.png',
  simbolo: null,
  notas_simbolo: ''
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const carasDePieza = computed(() => {
  if (!odontogramStore.piezaSeleccionada) return []
  return odontogramStore.getCarasDePieza(odontogramStore.piezaSeleccionada.id)
})

const datosPiezaPago = computed(() => ({
  id: odontogramStore.piezaSeleccionada?.id,
  numero: formPieza.numero,
  precio: formPieza.precio,
  diagnostico: formPieza.diagnostico
}))

// Opciones
const opcionesEstado = [
  { label: 'Sano', value: 'sano' },
  { label: 'Enfermo', value: 'enfermo' },
  { label: 'Tratado', value: 'tratado' },
  { label: 'Ausente', value: 'ausente' }
]

const opcionesDenticion = [
  { label: 'Permanente', value: 'permanente' },
  { label: 'Temporal', value: 'temporal' }
]

const opcionesImagen = [
  { label: 'Diente Superior', value: 'tooth_up.png' },
  { label: 'Diente Inferior', value: 'tooth_down.png' }
]

const opcionesSimbolo = [
  'Exodoncia',
  'Obturacion',
  'Endodoncia',
  'Corona',
  'Implante',
  'Protesis Removible',
  'Edentulo',
  'Protesis Completa',
  'Protesis Fija',
  'Diente extruido',
  'Diente intruido',
  'Ortodoncia Fija',
  'Ortodoncia Removible'
]

// Watch para actualizar form cuando cambia la pieza seleccionada
watch(() => odontogramStore.piezaSeleccionada, (pieza) => {
  if (pieza) {
    formPieza.numero = pieza.numero
    formPieza.denticion = pieza.denticion
    formPieza.estado_general = pieza.estado_general
    formPieza.precio = pieza.precio
    formPieza.diagnostico = pieza.diagnostico || ''
    formPieza.image_tooth = pieza.image_tooth
    formPieza.simbolo = pieza.simbolo
    formPieza.notas_simbolo = pieza.notas_simbolo || ''
  }
}, { immediate: true })

// Handlers
const guardarPieza = async () => {
  try {
    if (!odontogramStore.piezaSeleccionada) {
      $q.notify({
        type: 'negative',
        message: 'No hay pieza seleccionada',
        position: 'top-right'
      })
      return
    }

    await odontogramStore.actualizarPieza(
      odontogramStore.piezaSeleccionada.id,
      formPieza
    )

    $q.notify({
      type: 'positive',
      message: 'Pieza guardada correctamente',
      position: 'top-right'
    })

    isOpen.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar pieza' + error.message, 
      position: 'top-right'
    })
  }
}

const abrirFormularioCara = (cara) => {
  caraSeleccionada.value = cara
  showCaraModal.value = true
}

const guardarCara = async (datoCara) => {
  try {
    if (caraSeleccionada.value) {
      // Actualizar cara existente
      await odontogramStore.actualizarCara(
        caraSeleccionada.value.id,
        odontogramStore.piezaSeleccionada.id,
        datoCara
      )
      $q.notify({
        type: 'positive',
        message: 'Cara actualizada correctamente',
        position: 'top-right'
      })
    } else {
      // Crear nueva cara
      await odontogramStore.agregarCara(
        odontogramStore.piezaSeleccionada.id,
        datoCara
      )
      $q.notify({
        type: 'positive',
        message: 'Cara agregada correctamente',
        position: 'top-right'
      })
    }

    showCaraModal.value = false
    caraSeleccionada.value = null
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar cara' + error.message,
      position: 'top-right'
    })
  }
}

const eliminarCaraConfirm = (idCara) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar esta cara?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await odontogramStore.eliminarCara(idCara, odontogramStore.piezaSeleccionada.id)
      $q.notify({
        type: 'positive',
        message: 'Cara eliminada correctamente',
        position: 'top-right'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar cara' + error.message,
        position: 'top-right'
      })
    }
  })
}

const abrirModalPago = () => {
  showPagoModal.value = true
}

const onPagoExitoso = () => {
  $q.notify({
    type: 'positive',
    message: 'Pago registrado exitosamente',
    position: 'top-right'
  })
  showPagoModal.value = false
}
</script>

<style scoped>
.cara-color-preview {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid #e0e0e0;
}
</style>