<template>
  <q-dialog v-model="showDialog" persistent max-width="700px">
    <q-card class="recipe-dialog">
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-title">
            <i class="fa-solid fa-file-prescription"></i>
            <span>Receta Médica Odontológica</span>
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

      <q-form @submit="saveRecipe" class="form-container">
        <q-card-section class="dialog-content">
          <!-- Información del Paciente -->
          <div class="patient-info-section">
            <h4 class="section-title">
              <i class="fa-solid fa-user-injured"></i>
              Información del Paciente
            </h4>
            <div class="patient-details">
              <div class="patient-main-info">
                <div class="patient-name">{{ pacienteNombre }}</div>
                <div class="patient-meta">
                  <span class="patient-ci"><strong>C.I.:</strong> {{ currentPatient?.ci }}</span>
                  <span class="patient-age"><strong>Edad:</strong> {{ calcularEdad(currentPatient?.fecha_nacimiento) }} años</span>
                  <span class="patient-city"><strong>Ciudad:</strong> {{ currentPatient?.ciudad }}</span>
                </div>
              </div>
              <div class="patient-alerts" v-if="hasClinicalAlerts">
                <div class="alert-badge">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  <span>Alerta Clínica: {{ currentPatient?.alertas_clinicas }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-fields">
            <!-- Información de la Receta -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fa-solid fa-file-medical"></i>
                Información de la Receta
              </h4>
              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">
                    <i class="fa-solid fa-calendar"></i>
                    <span>Fecha de Emisión</span>
                  </label>
                  <q-input
                    v-model="form.fecha"
                    filled
                    dense
                    readonly
                    class="form-input"
                  />
                </div>
                <div class="field-group">
                  <label class="field-label">
                    <i class="fa-solid fa-calendar-check"></i>
                    <span>Válida hasta</span>
                  </label>
                  <q-input
                    v-model="form.valida_hasta"
                    filled
                    dense
                    type="date"
                    :rules="[val => !!val || 'La fecha de validez es requerida']"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Diagnóstico -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fa-solid fa-stethoscope"></i>
                Diagnóstico
                <span class="required">*</span>
              </h4>
              <div class="field-row">
                <div class="field-group full-width">
                  <q-input
                    v-model="form.diagnostico"
                    filled
                    dense
                    type="textarea"
                    rows="3"
                    :rules="[val => !!val || 'El diagnóstico es requerido']"
                    class="form-input"
                    placeholder="Describa el diagnóstico odontológico..."
                  />
                </div>
              </div>
            </div>

            <!-- Medicamentos -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fa-solid fa-pills"></i>
                Medicamentos Recetados
                <span class="required">*</span>
              </h4>
              <div class="medicines-container">
                <div v-for="(medicine, index) in form.medicamentos" :key="index" class="medicine-item">
                  <div class="medicine-header">
                    <span class="medicine-number">Medicamento {{ index + 1 }}</span>
                    <q-btn
                      v-if="form.medicamentos.length > 1"
                      flat
                      round
                      dense
                      icon="fa-solid fa-trash"
                      color="negative"
                      size="sm"
                      @click="removeMedicine(index)"
                    />
                  </div>
                  <div class="field-row">
                    <div class="field-group">
                      <label class="field-label">Nombre del Medicamento</label>
                      <q-input
                        v-model="medicine.nombre"
                        filled
                        dense
                        :rules="[val => !!val || 'El nombre es requerido']"
                        placeholder="Ej: Amoxicilina 500mg"
                      />
                    </div>
                    <div class="field-group">
                      <label class="field-label">Dosis</label>
                      <q-input
                        v-model="medicine.dosis"
                        filled
                        dense
                        :rules="[val => !!val || 'La dosis es requerida']"
                        placeholder="Ej: 1 tableta cada 8 horas"
                      />
                    </div>
                    <div class="field-group">
                      <label class="field-label">Duración</label>
                      <q-input
                        v-model="medicine.duracion"
                        filled
                        dense
                        :rules="[val => !!val || 'La duración es requerida']"
                        placeholder="Ej: 7 días"
                      />
                    </div>
                  </div>
                  <div class="field-row">
                    <div class="field-group full-width">
                      <label class="field-label">Indicaciones Especiales</label>
                      <q-input
                        v-model="medicine.indicaciones"
                        filled
                        dense
                        type="textarea"
                        rows="1"
                        placeholder="Indicaciones adicionales..."
                      />
                    </div>
                  </div>
                </div>
                
                <q-btn
                  outline
                  color="primary"
                  icon="fa-solid fa-plus"
                  label="Agregar Medicamento"
                  @click="addMedicine"
                  class="add-medicine-btn"
                  no-caps
                />
              </div>
            </div>

            <!-- Indicaciones Generales -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fa-solid fa-list-check"></i>
                Indicaciones Generales
              </h4>
              <div class="field-row">
                <div class="field-group full-width">
                  <q-input
                    v-model="form.indicaciones_generales"
                    filled
                    dense
                    type="textarea"
                    rows="3"
                    class="form-input"
                    placeholder="Indicaciones generales para el paciente..."
                  />
                </div>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fa-solid fa-note-sticky"></i>
                Observaciones
              </h4>
              <div class="field-row">
                <div class="field-group full-width">
                  <q-input
                    v-model="form.observaciones"
                    filled
                    dense
                    type="textarea"
                    rows="2"
                    class="form-input"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
            </div>

            <!-- Odontólogo -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fa-solid fa-user-md"></i>
                Información del Odontólogo
              </h4>
              <div class="field-row">
                <div class="field-group full-width">
                  <label class="field-label">Odontólogo</label>
                  <q-select
                    v-model="form.dentista_id"
                    :options="dentistOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    filled
                    dense
                    :rules="[val => !!val || 'Seleccione un dentista']"
                    placeholder="Seleccionar dentista"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions class="dialog-actions">
          <q-btn
            flat
            label="Cancelar"
            @click="closeDialog"
            class="secondary-btn"
            no-caps
          />
          <q-space />
          <q-btn
            type="submit"
            label="Guardar Receta"
            icon="fa-solid fa-file-prescription"
            :loading="loading"
            class="primary-btn"
            unelevated
            no-caps
          />
          <q-btn
            v-if="savedRecipe"
            label="Imprimir Receta"
            icon="fa-solid fa-print"
            color="secondary"
            @click="printRecipe"
            no-caps
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePacienteStore } from 'stores/pacienteStore'
import { useDentistaStore } from 'stores/dentistaStore'
import { useRecetaStore } from 'stores/recetaStore'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'RecipePatientDialog',
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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const pacienteStore = usePacienteStore()
    const dentistaStore = useDentistaStore()
    const recetaStore = useRecetaStore()
    
    const loading = ref(false)
    const savedRecipe = ref(null)
    const today = new Date().toISOString().slice(0, 10)
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    
    const clinicaInfo = ref({
      nombre: 'CLÍNICA DENTAL KIRU',
      direccion: 'Av. Principal #123, La Paz',
      telefono: '(591) 2-1234567',
      email: 'info@clinicakiru.com',
      web: 'www.clinicakiru.com'
    })

    const form = ref({
      fecha: today,
      valida_hasta: nextWeek,
      diagnostico: '',
      medicamentos: [
        {
          nombre: '',
          dosis: '',
          duracion: '',
          indicaciones: ''
        }
      ],
      indicaciones_generales: '',
      observaciones: '',
      dentista_id: null
    })

    // Computed
    const showDialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const currentPatient = computed(() => props.patientData || pacienteStore.selectedPatient)
    
    const pacienteNombre = computed(() => {
      if (!currentPatient.value) return ''
      const parts = [
        currentPatient.value.nombre,
        currentPatient.value.apellido_paterno,
        currentPatient.value.apellido_materno
      ].filter(Boolean)
      return parts.join(' ')
    })

    const hasClinicalAlerts = computed(() => {
      return currentPatient.value?.alertas_clinicas && 
             currentPatient.value.alertas_clinicas.trim() !== ''
    })

    const dentistOptions = computed(() => {
      return dentistaStore.dentistas.map(d => {
        const nombreCompleto = [
          d.nombre,
          d.segundo_nombre,
          d.apellido_paterno,
          d.apellido_materno
        ].filter(Boolean).join(' ')
        
        return {
          label: nombreCompleto,
          value: d.id
        }
      })
    })

    const selectedDentist = computed(() => {
      return dentistaStore.dentistas.find(d => d.id === form.value.dentista_id)
    })

    const selectedDentistName = computed(() => {
      if (!selectedDentist.value) return 'Dentista'
      
      return [
        selectedDentist.value.nombre,
        selectedDentist.value.segundo_nombre,
        selectedDentist.value.apellido_paterno,
        selectedDentist.value.apellido_materno
      ].filter(Boolean).join(' ')
    })

    const selectedDentistColegiatura = computed(() => {
      return selectedDentist.value?.colegiatura || null
    })

    // Methods
    const calcularEdad = (fechaNacimiento) => {
      if (!fechaNacimiento) return '--'
      const birth = new Date(fechaNacimiento)
      const today = new Date()
      let edad = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        edad--
      }
      return edad
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }

    const addMedicine = () => {
      form.value.medicamentos.push({
        nombre: '',
        dosis: '',
        duracion: '',
        indicaciones: ''
      })
    }

    const removeMedicine = (index) => {
      if (form.value.medicamentos.length > 1) {
        form.value.medicamentos.splice(index, 1)
      }
    }

    const resetForm = () => {
      form.value = {
        fecha: today,
        valida_hasta: nextWeek,
        diagnostico: '',
        medicamentos: [
          {
            nombre: '',
            dosis: '',
            duracion: '',
            indicaciones: ''
          }
        ],
        indicaciones_generales: '',
        observaciones: '',
        dentista_id: null
      }
      savedRecipe.value = null
    }

    const closeDialog = () => {
      showDialog.value = false
      resetForm()
    }

    const saveRecipe = async () => {
      if (!currentPatient.value) {
        $q.notify({
          type: 'negative',
          message: 'No hay paciente seleccionado',
          icon: 'fa-solid fa-exclamation-triangle'
        })
        return
      }

      loading.value = true
      try {
        const recetaData = {
          paciente_id: currentPatient.value.id,
          dentista_id: form.value.dentista_id,
          fecha: form.value.fecha,
          valida_hasta: form.value.valida_hasta,
          diagnostico: form.value.diagnostico,
          indicaciones_generales: form.value.indicaciones_generales,
          observaciones: form.value.observaciones,
          medicamentos: form.value.medicamentos
        }

        const result = await recetaStore.crearReceta(recetaData)
        savedRecipe.value = result

        $q.notify({
          type: 'positive',
          message: 'Receta guardada exitosamente',
          icon: 'fa-solid fa-check'
        })
      } catch (error) {
        console.error('Error saving recipe:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al guardar la receta',
          icon: 'fa-solid fa-exclamation-triangle'
        })
      } finally {
        loading.value = false
      }
    }

    const printRecipe = async () => {
      if (!savedRecipe.value) {
        $q.notify({
          type: 'warning',
          message: 'Primero debe guardar la receta',
          icon: 'fa-solid fa-exclamation-triangle'
        })
        return
      }

      try {
        const doc = new jsPDF('p', 'mm', 'a4')
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 15
        let yPosition = margin

        // ========================================
        // ENCABEZADO CON BRANDING
        // ========================================
        doc.setFillColor(102, 126, 234)
        doc.rect(0, 0, pageWidth, 50, 'F')

        // Logo/Icono
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(40)
        doc.text('🦷', pageWidth / 2 - 8, 22)

        // Nombre de la clínica
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.text(clinicaInfo.value.nombre, pageWidth / 2, 32, { align: 'center' })

        // Subtítulo
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('RECETA MÉDICA ODONTOLÓGICA', pageWidth / 2, 40, { align: 'center' })

        // Información de contacto
        doc.setFontSize(8)
        doc.text(clinicaInfo.value.direccion, pageWidth / 2, 45, { align: 'center' })
        doc.text(`Tel: ${clinicaInfo.value.telefono} | ${clinicaInfo.value.email}`, pageWidth / 2, 48, { align: 'center' })

        yPosition = 60

        // ========================================
        // INFORMACIÓN DEL PACIENTE Y FECHAS
        // ========================================
        doc.setFillColor(248, 249, 250)
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 28, 3, 3, 'F')

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        
        // Columna izquierda - Datos del paciente
        doc.text('PACIENTE:', margin + 5, yPosition + 7)
        doc.setFont('helvetica', 'normal')
        doc.text(pacienteNombre.value, margin + 30, yPosition + 7)

        doc.setFont('helvetica', 'bold')
        doc.text('C.I.:', margin + 5, yPosition + 14)
        doc.setFont('helvetica', 'normal')
        doc.text(currentPatient.value.ci, margin + 30, yPosition + 14)

        doc.setFont('helvetica', 'bold')
        doc.text('EDAD:', margin + 5, yPosition + 21)
        doc.setFont('helvetica', 'normal')
        doc.text(`${calcularEdad(currentPatient.value.fecha_nacimiento)} años`, margin + 30, yPosition + 21)

        // Columna derecha - Fechas
        doc.setFont('helvetica', 'bold')
        doc.text('FECHA:', pageWidth - margin - 60, yPosition + 7, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.text(formatDate(savedRecipe.value.fecha), pageWidth - margin - 5, yPosition + 7, { align: 'right' })

        doc.setFont('helvetica', 'bold')
        doc.text('VÁLIDA HASTA:', pageWidth - margin - 60, yPosition + 14, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.text(formatDate(savedRecipe.value.valida_hasta), pageWidth - margin - 5, yPosition + 14, { align: 'right' })

        yPosition += 35

        // ========================================
        // ALERTA CLÍNICA (si existe)
        // ========================================
        if (hasClinicalAlerts.value) {
          doc.setFillColor(255, 243, 205)
          doc.setDrawColor(255, 193, 7)
          doc.setLineWidth(0.5)
          doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 3, 3, 'FD')

          doc.setTextColor(133, 100, 4)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text('⚠ ALERTA CLÍNICA:', margin + 5, yPosition + 7)
          
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          const alertText = doc.splitTextToSize(
            currentPatient.value.alertas_clinicas,
            pageWidth - 2 * margin - 45
          )
          doc.text(alertText, margin + 45, yPosition + 7)

          yPosition += 20
          doc.setTextColor(0, 0, 0)
        }

        // ========================================
        // DIAGNÓSTICO
        // ========================================
        doc.setFillColor(102, 126, 234)
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('📋 DIAGNÓSTICO', margin + 3, yPosition + 5.5)

        yPosition += 10

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const diagnosticoText = doc.splitTextToSize(
          savedRecipe.value.diagnostico,
          pageWidth - 2 * margin - 6
        )
        doc.text(diagnosticoText, margin + 3, yPosition + 5)
        yPosition += diagnosticoText.length * 5 + 10

        // ========================================
        // MEDICAMENTOS - TABLA
        // ========================================
        doc.setFillColor(102, 126, 234)
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('💊 MEDICAMENTOS RECETADOS', margin + 3, yPosition + 5.5)

        yPosition += 10

        const medicamentosData = savedRecipe.value.medicamentos.map((med, idx) => {
          const indicaciones = med.indicaciones || 'Sin indicaciones especiales'
          return [
            (idx + 1).toString(),
            med.nombre,
            med.dosis,
            med.duracion,
            indicaciones
          ]
        })

        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Medicamento', 'Dosis', 'Duración', 'Indicaciones']],
          body: medicamentosData,
          theme: 'grid',
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [44, 62, 80]
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { halign: 'left', cellWidth: 45 },
            2: { halign: 'left', cellWidth: 40 },
            3: { halign: 'center', cellWidth: 25 },
            4: { halign: 'left', cellWidth: 'auto' }
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: margin, right: margin }
        })

        yPosition = doc.lastAutoTable.finalY + 10

        // ========================================
        // INDICACIONES GENERALES
        // ========================================
        if (savedRecipe.value.indicaciones_generales) {
          doc.setFillColor(118, 75, 162)
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
          
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text('📌 INDICACIONES GENERALES', margin + 3, yPosition + 5.5)

          yPosition += 10

          doc.setTextColor(0, 0, 0)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          const indicacionesText = doc.splitTextToSize(
            savedRecipe.value.indicaciones_generales,
            pageWidth - 2 * margin - 6
          )
          doc.text(indicacionesText, margin + 3, yPosition + 5)
          yPosition += indicacionesText.length * 4 + 10
        }

        // ========================================
        // OBSERVACIONES
        // ========================================
        if (savedRecipe.value.observaciones) {
          doc.setFillColor(52, 152, 219)
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
          
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text('📝 OBSERVACIONES', margin + 3, yPosition + 5.5)

          yPosition += 10

          doc.setTextColor(0, 0, 0)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          const observacionesText = doc.splitTextToSize(
            savedRecipe.value.observaciones,
            pageWidth - 2 * margin - 6
          )
          doc.text(observacionesText, margin + 3, yPosition + 5)
          yPosition += observacionesText.length * 4 + 10
        }

        // ========================================
        // FIRMA DEL ODONTÓLOGO
        // ========================================
        yPosition = Math.max(yPosition, pageHeight - 60)

        doc.setDrawColor(102, 126, 234)
        doc.setLineWidth(0.5)
        doc.line(pageWidth / 2 - 40, yPosition + 20, pageWidth / 2 + 40, yPosition + 20)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(44, 62, 80)
        doc.text(selectedDentistName.value, pageWidth / 2, yPosition + 26, { align: 'center' })

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(127, 140, 141)
        doc.text('Odontólogo(a)', pageWidth / 2, yPosition + 31, { align: 'center' })

        if (selectedDentistColegiatura.value) {
          doc.text(`Reg. Prof. ${selectedDentistColegiatura.value}`, pageWidth / 2, yPosition + 36, { align: 'center' })
        }

        // ========================================
        // FOOTER
        // ========================================
        doc.setFillColor(248, 249, 250)
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F')

        doc.setFontSize(7)
        doc.setTextColor(127, 140, 141)
        doc.setFont('helvetica', 'italic')
        doc.text(
          'Esta receta médica es válida únicamente hasta la fecha indicada. No automedicarse.',
          pageWidth / 2,
          pageHeight - 12,
          { align: 'center' }
        )
        doc.text(
          `${clinicaInfo.value.web} | ${clinicaInfo.value.telefono}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        )

        // Línea decorativa
        doc.setDrawColor(102, 126, 234)
        doc.setLineWidth(1)
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

        // ========================================
        // GUARDAR PDF
        // ========================================
        const nombreArchivo = `Receta_${currentPatient.value.ci}_${today}.pdf`
        doc.save(nombreArchivo)

        $q.notify({
          type: 'positive',
          message: 'PDF generado exitosamente',
          icon: 'fa-solid fa-file-pdf'
        })
      } catch (error) {
        console.error('Error generating PDF:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al generar el PDF',
          icon: 'fa-solid fa-exclamation-triangle'
        })
      }
    }

    watch(() => props.modelValue, (newValue) => {
      if (newValue) resetForm()
    })

    onMounted(async () => {
      if (dentistaStore.dentistas.length === 0) {
        await dentistaStore.obtenerDentistas()
      }
    })

    return {
      showDialog,
      form,
      currentPatient,
      pacienteNombre,
      hasClinicalAlerts,
      dentistOptions,
      selectedDentistName,
      selectedDentistColegiatura,
      loading,
      savedRecipe,
      clinicaInfo,
      addMedicine,
      removeMedicine,
      closeDialog,
      saveRecipe,
      printRecipe,
      calcularEdad,
      formatDate
    }
  }
}
</script>