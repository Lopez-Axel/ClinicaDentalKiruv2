<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 500px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ cara ? 'Editar' : 'Agregar' }} Cara</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Cara -->
          <div class="col-12">
            <q-select
              v-model="form.cara"
              :options="opcionesCara"
              label="Cara del Diente *"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="view_in_ar" />
              </template>
            </q-select>
          </div>

          <!-- Color -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.color"
              label="Color"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="palette" />
              </template>
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="form.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Estado -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.estado_cara"
              :options="opcionesEstadoCara"
              label="Estado"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="flag" />
              </template>
            </q-select>
          </div>

          <!-- Tipo Simbología -->
          <div class="col-12">
            <q-select
              v-model="form.tipo_simbologia"
              :options="opcionesTipoSimbologia"
              label="Tipo de Simbología *"
              outlined
              dense
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <!-- Valor Simbología -->
          <div class="col-12">
            <q-input
              v-model="form.valor_simbologia"
              label="Valor Simbología"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
            </q-input>
          </div>

          <!-- Material -->
          <div class="col-12">
            <q-input
              v-model="form.material"
              label="Material"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="construction" />
              </template>
            </q-input>
          </div>

          <!-- Notas -->
          <div class="col-12">
            <q-input
              v-model="form.notas"
              label="Notas"
              outlined
              type="textarea"
              rows="3"
            >
              <template v-slot:prepend>
                <q-icon name="note" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
        <q-btn
          flat
          label="Guardar"
          color="primary"
          @click="guardar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, reactive } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  cara: Object
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const form = reactive({
  cara: 'Vestibular',
  color: '#FFFFFF',
  tipo_simbologia: 'patologia',
  valor_simbologia: '',
  estado_cara: null,
  material: '',
  notas: ''
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const opcionesCara = [
  'Vestibular',
  'Palatino',
  'Lingual',
  'Oclusal',
  'Mesial',
  'Distal'
]

const opcionesEstadoCara = [
  'activo',
  'inactivo',
  'completado'
]

const opcionesTipoSimbologia = [
  { label: 'Patología', value: 'patologia' },
  { label: 'Restauración', value: 'restauracion' },
  { label: 'Tratamiento', value: 'tratamiento' },
  { label: 'Edentulismo', value: 'edentulismo' }
]

watch(() => props.cara, (nuevaCara) => {
  if (nuevaCara) {
    form.cara = nuevaCara.cara
    form.color = nuevaCara.color || '#FFFFFF'
    form.tipo_simbologia = nuevaCara.tipo_simbologia
    form.valor_simbologia = nuevaCara.valor_simbologia || ''
    form.estado_cara = nuevaCara.estado_cara
    form.material = nuevaCara.material || ''
    form.notas = nuevaCara.notas || ''
  } else {
    // Reset form
    form.cara = 'Vestibular'
    form.color = '#FFFFFF'
    form.tipo_simbologia = 'patologia'
    form.valor_simbologia = ''
    form.estado_cara = null
    form.material = ''
    form.notas = ''
  }
}, { immediate: true })

const guardar = () => {
  emit('guardar', { ...form })
  isOpen.value = false
}
</script>