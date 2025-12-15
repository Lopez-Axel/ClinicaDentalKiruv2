// Frontend/src/utils/reportePagoPDF.js
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { pagoService } from 'src/services/pagoService'
import { pacienteService } from 'src/services/pacienteService'
import { odontogramaService } from 'src/services/odontogramaService'
import { piezaService } from 'src/services/piezaService'

/**
 * Genera un reporte PDF global de todos los ingresos del negocio
 * Agrupa los pagos por paciente (odontograma)
 */
export const generarReportePagosGlobal = async () => {
  try {
    // 1. Obtener todos los pacientes activos
    const { data: responsePacientes } = await pacienteService.getAll()
    const pacientes = responsePacientes.data.filter(p => p.state === 1)

    // 2. Para cada paciente, obtener su odontograma, piezas y pagos
    const datosPorPaciente = []

    for (const paciente of pacientes) {
      try {
        // Obtener odontograma del paciente
        const { data: odontogramas } = await odontogramaService.getByPaciente(paciente.ci)
        
        if (!odontogramas || odontogramas.length === 0) continue

        const odontograma = odontogramas[0]

        // Obtener piezas del odontograma
        const { data: piezas } = await piezaService.getByOdontograma(odontograma.id)
        
        if (!piezas || piezas.length === 0) continue

        // Obtener pagos del paciente
        const { data: pagos } = await pagoService.getByPaciente(paciente.ci)

        // Calcular totales
        const totalTratamiento = piezas.reduce((sum, p) => sum + parseFloat(p.precio || 0), 0)
        const totalPagado = pagos
          .filter(p => p.estado === 'completado')
          .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
        const totalPendiente = totalTratamiento - totalPagado

        datosPorPaciente.push({
          paciente,
          odontograma,
          piezas,
          pagos,
          totales: {
            tratamiento: totalTratamiento,
            pagado: totalPagado,
            pendiente: totalPendiente
          }
        })
      } catch (error) {
        console.error(`Error procesando paciente ${paciente.ci}:`, error)
        continue
      }
    }

    // 3. Generar el PDF
    await generarPDF(datosPorPaciente)

  } catch (error) {
    console.error('Error generando reporte global:', error)
    throw error
  }
}

/**
 * Genera el documento PDF con los datos recopilados
 */
const generarPDF = async (datosPorPaciente) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // ========================================
  // PORTADA
  // ========================================
  doc.setFillColor(102, 126, 234)
  doc.rect(0, 0, pageWidth, 60, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('CLÍNICA DENTAL KIRU', pageWidth / 2, 25, { align: 'center' })

  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte Global de Ingresos', pageWidth / 2, 38, { align: 'center' })

  doc.setFontSize(12)
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Generado el ${fechaActual}`, pageWidth / 2, 50, { align: 'center' })

  // Volver a color negro
  doc.setTextColor(0, 0, 0)
  yPosition = 75

  // ========================================
  // RESUMEN GENERAL
  // ========================================
  const totalGeneral = datosPorPaciente.reduce((sum, d) => sum + d.totales.tratamiento, 0)
  const pagadoGeneral = datosPorPaciente.reduce((sum, d) => sum + d.totales.pagado, 0)
  const pendienteGeneral = datosPorPaciente.reduce((sum, d) => sum + d.totales.pendiente, 0)

  doc.setFillColor(248, 249, 250)
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F')

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen General', margin + 5, yPosition + 8)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Pacientes con Tratamiento: ${datosPorPaciente.length}`, margin + 5, yPosition + 16)
  doc.text(`Total Ingresos por Tratamientos: Bs. ${formatearMontoNumero(totalGeneral)}`, margin + 5, yPosition + 23)
  doc.text(`Total Pagado: Bs. ${formatearMontoNumero(pagadoGeneral)}`, margin + 5, yPosition + 30)

  doc.setTextColor(200, 35, 51)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Pendiente: Bs. ${formatearMontoNumero(pendienteGeneral)}`, pageWidth - margin - 5, yPosition + 30, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  yPosition += 50

  // ========================================
  // DETALLE POR PACIENTE
  // ========================================
  doc.addPage()
  yPosition = margin

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle por Paciente', margin, yPosition)
  yPosition += 10

  for (const datos of datosPorPaciente) {
    // Verificar si necesitamos nueva página
    if (yPosition > pageHeight - 70) {
      doc.addPage()
      yPosition = margin
    }

    // Encabezado del paciente
    doc.setFillColor(102, 126, 234)
    doc.setTextColor(255, 255, 255)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const nombreCompleto = `${datos.paciente.nombre} ${datos.paciente.apellido_paterno} ${datos.paciente.apellido_materno || ''}`
    doc.text(nombreCompleto, margin + 2, yPosition + 7)
    doc.text(`CI: ${datos.paciente.ci}`, pageWidth - margin - 2, yPosition + 7, { align: 'right' })

    doc.setTextColor(0, 0, 0)
    yPosition += 15

    // Tabla de piezas
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Piezas en Tratamiento:', margin, yPosition)
    yPosition += 5

    const datosPiezas = datos.piezas.map(pieza => {
      const pagosPieza = datos.pagos.filter(p => p.id_pieza === pieza.id)
      const pagadoPieza = pagosPieza
        .filter(p => p.estado === 'completado')
        .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
      const pendientePieza = parseFloat(pieza.precio) - pagadoPieza

      return [
        pieza.numero.toString(),
        pieza.diagnostico || 'Sin diagnóstico',
        `Bs. ${formatearMontoNumero(pieza.precio)}`,
        `Bs. ${formatearMontoNumero(pagadoPieza)}`,
        `Bs. ${formatearMontoNumero(pendientePieza)}`
      ]
    })

    autoTable(doc, {
      startY: yPosition,
      head: [['Pieza', 'Diagnóstico', 'Precio', 'Pagado', 'Pendiente']],
      body: datosPiezas,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left', cellWidth: 60 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 }
      },
      margin: { left: margin, right: margin }
    })

    yPosition = doc.lastAutoTable.finalY + 5

    // Tabla de pagos
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Historial de Pagos:', margin, yPosition)
    yPosition += 5

    const datosPagos = datos.pagos.map(pago => [
      new Date(pago.created_at).toLocaleDateString('es-ES'),
      `Pieza ${pago.numero_pieza}`,
      `Bs. ${formatearMontoNumero(pago.monto)}`,
      pago.tipo_pago === 'efectivo' ? 'Efectivo' : pago.tipo_pago === 'stripe' ? 'Stripe' : pago.tipo_pago.toUpperCase(),
      pago.estado === 'completado' ? 'Completado' : pago.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Pieza', 'Monto', 'Método', 'Estado']],
      body: datosPagos.length > 0 ? datosPagos : [['Sin pagos registrados', '', '', '', '']],
      theme: 'striped',
      headStyles: {
        fillColor: [118, 75, 162],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 30 },
        4: { halign: 'center', cellWidth: 30 }
      },
      margin: { left: margin, right: margin }
    })

    yPosition = doc.lastAutoTable.finalY + 5

    // Totales del paciente
    doc.setFillColor(248, 249, 250)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Tratamiento: Bs. ${formatearMontoNumero(datos.totales.tratamiento)}`, margin + 5, yPosition + 6)
    doc.setTextColor(76, 175, 80)
    doc.text(`Total Pagado: Bs. ${formatearMontoNumero(datos.totales.pagado)}`, margin + 5, yPosition + 12)
    doc.setTextColor(255, 152, 0)
    doc.text(`Saldo Pendiente: Bs. ${formatearMontoNumero(datos.totales.pendiente)}`, pageWidth - margin - 5, yPosition + 9, { align: 'right' })
    doc.setTextColor(0, 0, 0)

    yPosition += 20
  }

  // ========================================
  // PIE DE PÁGINA EN TODAS LAS PÁGINAS
  // ========================================
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    doc.text(
      'Clínica Dental Kiru - Sistema de Gestión',
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    )
  }

  // ========================================
  // GUARDAR PDF
  // ========================================
  const nombreArchivo = `Reporte_Ingresos_Global_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}

/**
 * Formatea un número a formato monetario boliviano
 */
const formatearMontoNumero = (monto) => {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto || 0)
}