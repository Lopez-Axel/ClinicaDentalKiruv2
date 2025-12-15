<template>
  <div class="search-section">
    <q-select
      v-model="pacienteSeleccionado"
      :options="opcionesFiltradas"
      option-value="id"
      option-label="label"
      use-input
      input-debounce="300"
      outlined
      dense
      clearable
      placeholder="Buscar paciente por CI o nombre..."
      @filter="filtrarPacientes"
      @update:model-value="seleccionarPaciente"
    >
      <template v-slot:prepend>
        <i class="fa-solid fa-search"></i>
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
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>CI: {{ scope.opt.ci }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <div v-if="store.selectedPatient" class="paciente-info q-mt-md">
      <q-card>
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <div class="col">
              <p class="text-h6">{{ store.getNombreCompleto(store.selectedPatient) }}</p>
              <p class="text-subtitle2 text-grey-7">CI: {{ store.selectedPatient.ci }}</p>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="fa-solid fa-times"
                @click="limpiarSeleccion"
                color="negative"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePacienteStore } from 'src/stores/pacienteStore'

const emit = defineEmits(['paciente-seleccionado'])
const store = usePacienteStore()

const pacienteSeleccionado = ref(null)
const opcionesFiltradas = ref([])

const filtrarPacientes = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    
    opcionesFiltradas.value = store.pacientes
      .filter(p => p.state === 1)
      .filter(p => {
        const nombreCompleto = store.getNombreCompleto(p).toLowerCase()
        const ci = p.ci?.toLowerCase() || ''
        return nombreCompleto.includes(needle) || ci.includes(needle)
      })
      .map(p => ({
        id: p.id,
        ci: p.ci,
        label: `${store.getNombreCompleto(p)} - CI: ${p.ci}`,
        paciente: p
      }))
      .slice(0, 50)
  })
}

watch(() => store.selectedPatient, (nuevo) => {
  if (nuevo) {
    emit('paciente-seleccionado', nuevo)
  }
})

const seleccionarPaciente = (opcion) => {
  if (opcion && opcion.paciente) {
    store.seleccionarPaciente(opcion.paciente)
  }
}

const limpiarSeleccion = () => {
  store.limpiarPacienteSeleccionado()
  pacienteSeleccionado.value = null
}
</script>