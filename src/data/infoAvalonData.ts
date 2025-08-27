import { v4 as uuidv4 } from 'uuid';

export interface InfoAvalonItem {
  id: string;
  type: 'text' | 'pdf' | 'image';
  title: string;
  keywords: string[];
  content: string; // text content or URL
  description?: string; 
}

export const avalonData: InfoAvalonItem[] = [
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'HACER UN CAMBIO DE HABITACIÓN',
    keywords: ["cambio de habitación", "room change", "cambio habitacion", "hacer un cambio de habitacion"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/hacer_un_cambio_de_habitacion.pdf', 
    description: `Mediante “Gestión de reservas” o bien buscando la reserva en el buscador de documentos (la Lupa) abrimos la reserva.
Una vez en la pestaña ‘Reservas (Modificar)’ apretamos el botón ‘Cambios’.

Debemos pulsar en el símbolo “+” y rellenar los datos que se nos pide. Notar que el check “Aplicar” no lo podemos deshabilitar si el check in no está hecho.
NOTA: Los cambios se deben aplicar cuando llega el cliente por la puerta y no aplicarse el cambio cuando se programa.

Para realizar un cambio a futuro – programado hay que deshabilitar el check “Aplicar” para que se aplique el día que se configure. El cambio se aplica automáticamente en el cierre del hotel del día expuesto o bien cuando lo aplicamos de forma manual.

Si ha habido un error y no permite “Eliminar asignación” hay que hacer otro cambio de habitación programado para el mismo día; es decir, hay que ajustar las líneas sin eliminar las anteriores asignaciones.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO SACO UNA RESERVA A OTRO HOTEL',
    keywords: ["sacar reserva", "otro hotel", "desviar reserva", "cambiar hotel", "mover reserva", "trasladar reserva"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_saco_una_reserva_a_otro_hotel.pdf',
    description: `¿COMO SACO UNA RESERVA A OTRO HOTEL?
Mediante “Gestión de reservas” o bien buscando la reserva en el buscador de documentos (la Lupa) abrimos la reserva. Una vez en la pestaña ‘Reservas (Modificar)’ apretamos el botón ‘Cambios’

Debemos pulsar en el símbolo “+” y rellenar los datos que se nos pide. Se trata de un cambio de habitación eligiendo el hotel al que va:
-Toda la estancia a Hipotels: Tenemos que modificar la Reserva;
    
Debemos eliminar la asignación de habitación (muy importante); seleccionamos el campo i eliminamos.

Si la reserva es a Entidad basta con cambiar el “Hotel de uso”

Si la reserva es a cliente hay que cambiar el “Hotel de uso” y el “Hotel de Facturación”
Una vez cambiado grabamos.

-Fuera de Hipotels: Se debe hacer un cambio de habitación a Hotel Desvíos y a una habitación “Z”. Si se desvía toda la estancia y a la vuelta se realiza otro cambio de habitación a nuestro hotel.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'ABREVIACIONES',
    keywords: ["abreviaciones", "teclas de función", "atajos de teclado", "alt", "ctrl", "shift", "shortcuts", "combinaciones"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/abreviaciones.pdf',
    description: `ANEXO: ABREVIACIONES

ALT 
La tecla Alt se utiliza comúnmente para acceder a opciones de menú o botones, se combina con la letra que está subrayada en el texto de la opción o botón correspondiente. Por ejemplo pulsando Alt+A en el Escritorio ejecutaríamos la opción Archivo.

La combinación Alt+F4 cierra la aplicación (cierra la ventana Escritorio). 
CTRL y SHIFT (MAYUSCULAS) 

Las teclas Ctrl o Control y Shift se utilizan para ejecutar procesos alternativos de forma rápida. Son procesos que no están accesibles de forma directa, por ejemplo a través de una opción de menú, pero que son lo suficientemente importantes como para disponer de un acceso más o menos directo.
 
TECLAS DE FUNCION Y SUS COMBINACIONES

 
OTRAS COMBINACIONES DE LA TECLA CTRL`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO COBRO UN ANTICIPO DE NOSHOW SIN DATOS DE CLIENTE',
    keywords: ["cobrar anticipo", "noshow", "no show","sin datos", "cliente sin datos", "cobro contado", "anticipo contado", "factura noshow"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cobro_un_anticipo_de_noshow_sin_datos_de_cliente.pdf',
    description: `¿COMO COBRO UN ANTICIPO DE NOSHOW SIN DATOS DE CLIENTE?

Como no tenemos los datos del cliente no podemos realizar una factura, en este caso debemos ir al anticipo en el menú “Tareas/Anticipos” de la reserva, o también en el acceso directo de la reserva, selecciona la línea a cobrar y utilizar la opción “Contado”`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO AÑADIR CRÉDITO A UNA RESERVA',
    keywords: ["añadir crédito", "crédito reserva", "tarjeta de crédito", "crédito limitado", "crédito ilimitado", "garantía"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_anadir_credito_a_una_reserva.pdf',
    description: `¿COMO AÑADIR CRÉDITO A UNA RESERVA?

Con tarjeta de crédito:
Despliega el tipo de crédito y elije limitado (si el cliente lo exije) o ilimitado. 
Pulsa el botón de Tarjeta de crédito, Añade la tarjeta de cliente introduciendo los números de la misma, el tipo y la fecha de caducidad. 

Recuerda darle al botón de guardar una vez introducido todos los datos`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO AÑADO UNA TERCERA PERSONA EXTRA A UNA RESERVA',
    keywords: ["tercera persona", "persona extra", "pax extra", "añadir persona", "multireserva", "dingus", "pax_adicional", "sin disponibilidad"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_anado_una_tercera_persona_extra_a_una_reserva.pdf',
    description: `¿COMO AÑADO UNA TERCERA PERSONA EXTRA A UNA RESERVA? Pax Extra

Se trata de realizar una nueva reserva a través de Dingus
            
Utilizando el menú “Reservas Cliente (Call Center Hotel), Busqueda de precios y disponibilidad” marcando la opción “Sin Disponibilidad”, de esta forma nos aparecerán los tipos de cliente PAX_ADICIONAL (comprueba el tipo de habitación), hacemos la reserva de una persona con este tipo de cliente y al bajar a Avalon la asignamos a la misma habitación de la reserva principal (siempre con un usuario con permisos de multireserva)

Tener en cuenta que hasta que no se asigne la habitación esta reserva suma y que para realizar el chekin también debe ser un usuario con permisos de multireserva.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO ASIGNO HABITACION',
    keywords: ["asignar habitación", "asignación", "asignación gráfica", "asignación manual", "asignar reserva", "check-in", "asignar habitacion"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_asigno_habitacion.pdf',
    description: `¿COMO ASIGNO HABITACION?

Se puede asignar de tres formas, utilizando un formulario normal y entrando en la habitación manualmente o utilizando la asignación grafica

O bien entrando en la habitación manually escribiendo el numero en el terminal y abriendo la reserva.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO CAMBIAR EL TIPO DE COBRO DE UN COBRO YA REALIZADO',
    keywords: ["cambiar cobro", "tipo de cobro", "modificar cobro", "cajas", "movimientos", "facturación"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cambiar_el_tipo_de_cobro_de_un_cobro_ya_realizado.pdf',
    description: `¿COMO CAMBIAR EL TIPO DE COBRO DE UN COBRO YA REALIZADO?

Solo se puede hacer antes de cerrar la caja; se puede realizar desde el menú de Recepción. 
Cajas / Movimientos

Abre la opción en la línea de la factura que dice Tipo de Cobro y elije la deseada

Si el cobro debiera ser de dos tipos diferentes, borro la línea y desde “Facturación y Finanzas / Facturas” selecciono la factura y la cobro de nuevo.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO CAMBIO EL DIA DE TRABAJO',
    keywords: ["cambiar día", "cambio dia", "fecha de trabajo", "cierre diario", "checkin", "checkout", "no puedo cerrar", "cambiar fecha"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cambio_el_dia_de_trabajo.pdf',
    description: `¿COMO CAMBIO EL DIA PARA HACER CHEKIN – CHECKOUT SI NO PUEDO HACER CIERRE DIARIO?

Si no podemos realizar el cierre diario podemos seguir trabajando cambiando el día en “Fecha de trabajo”

Este proceso NO HACE EL CIERRE DIARIO, por lo que el cierre debe seguir haciéndose cuando se solvente la incidencia que lo impide, pero deja seguir trabajando para poder hacer entradas o salidas. 

En esta situación es recomendable no hacer checkout a las salidas para evitar errores.
Puedes Facturar Agencias ‘de salidas’ para evitar futuros errores y poder hacer checkout a las habitaciones de salida.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO CAMBIO EL NOMBRE DE UN SERVICIO FACTURADO',
    keywords: ["renombrar servicio", "cambiar nombre factura", "editar línea factura", "renombrar línea", "facturación", "cuentas", "editor de cuentas"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cambio_el_nombre_de_un_servicio_facturado.pdf',
    description: `¿COMO CAMBIO EL NOMBRE DE UN SERVICIO FACTURADO (UNA LINEA)?

Desde la misma factura en la pantalla “Facturación / Facturas” seleccionamos la factura en concreto y utilizando el botón “Renombrar” podemos renombrar cada línea de la factura para que en la impresión salga lo que deseemos.

También se puede utilizando el Terminal, introduciendo el número de habitación y una vez en la reserva apretando el botón ‘Cuentas’

O bien desde el editor de cuentas.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO CAMBIO UN ANTICIPO DE CUENTA',
    keywords: ["cambiar anticipo", "mover anticipo", "anticipo cuenta", "arrastrar anticipo", "reasignar anticipo"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cambio_un_anticipo_de_cuenta.pdf',
    description: `COMO CAMBIO UN ANTICIPO DE CUENTA

Desde el botón de anticipos que aparece en la pantalla de cuentas, abrirá la pantalla de anticipos y podrán arrastrar el anticipo a aquella cuenta a la que quieran aplicarlo.
Simplemente pinchando y arrastrando. ¿?

Ir al anticipo en el menú “Tareas”  ”Anticipos” de la reserva, o también en el acceso directo de la reserva.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO CERRAR CUENTAS DE NO ALOJADOS PARA QUE NO APAREZCAN UNA VEZ FACTURADAS',
    keywords: ["cerrar cuentas", "no alojados", "gestión de cuentas", "cuentas abiertas", "cuentas cerradas", "auditoría"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cerrar_cuentas_de_no_alojados_para_que_no_aparezcan_una_vez_facturadas.pdf',
    description: `COMO CERRAR CUENTAS DE NO ALOJADOS PARA QUE NO APAREZCAN UNA VEZ FACTURADAS

En la gestión de Cuentas de No Alojados se ha puesto un nuevo botón Tareas que permite Cerrar | Abrir las cuentas. 

De ese modo cuando una cuenta se queda sin líneas pendientes de facturar, se puede pasar a estado Cerrada y se dejará de ver por defecto en la ventana (el filtro cuando entras es ‘Cerrada’= no). Una cuenta cerrada se puede volver a Abrir.

No se pueden cerrar cuentas con líneas pendientes de facturar ni la cuenta de auditoria.

El filtro de cuentas cerradas / abiertas se ha aplicado en todas las ventanas donde se consultan las cuentas de No Alojados (tpv, desvío cargos, etc….). También se ha incluido en la APP de BAR para que solo salgan las que están abiertas.

En los informes de cuentas y deuda pendiente de recepción las cerradas no se tendrán en cuenta.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO COBRAR LA COMPENSACIÓN DE OVB OVERBOOKING',
    keywords: ["compensación", "overbooking", "ovb", "cobrar compensación", "indemnizaciones", "paquetes", "factura negativo", "desviar cliente"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cobrar_la_compensacion_de_ovb_overbooking.pdf',
    description: `¿COMO COBRAR LA COMPENSACIÓN DE OVB OVERBOOKING?

Lo primero es buscar la carpeta que almacena los overbooking, localiza la ficha con el número de habitación o nombre del cliente.

Mediante “Gestión de reservas”,  desde el Terminal/Habitación o bien buscando la reserva en el buscador de documentos (la Lupa) abrimos la reserva.

Paso 1: Primero comprueba la Cuenta de la reserva

Si el importe es superior a la compensación debemos ticar el importe que nos marca la compensación en NEGATIVO (ver paso 2)

Si el importe es inferior a la compensación debemos ticar el importe total de la cuenta en NEGATIVO (ver paso 2)

Si el importe es superior al otorgado en la ficha de overbooking

Paso 2:
Despliega la opción ‘Tareas’ y haz clic en el apartado ‘Paquetes’
En los comentarios encontrarás información sobre el overbooking, debe coincidir con la ficha.

Selecciona la categoría ‘ALOJAMIENTOS’ y el paquete ‘INDEMNIZACIONES’

Los importes se tican en el apartado Precio (siempre en negativo -)
Marca el Tipo de cobro como EFECTIVO y acepta en el botón de aprobación

Escribe en comentarios el hotel al que el cliente fue desviado, por cuantas noches y el importe de la compensación que indica la ficha. 
Marca el cuadradito ‘Imprimir comentarios’

Vuelve a Comprobar la Cuenta de la reserva 

Si el importe era superior a la compensación ahora la cuenta nos muestra la cantidad que el cliente debe pagar (se habrá restado la compensación de overbooking). Procede a cobrar la factura con el método de pago preferido por el cliente.

En el caso de que la cuenta era inferior, ahora nos debe mostrar el importe de la cuenta (factura) a cero.

Ten en cuenta que si el cliente no consumió el máximo compensado durante la estancia en el hotel y había alguna diferencia, esta diferencia el cliente lo pierde, por lo tanto nunca se debe abonar al cliente aunque este lo reclame.
Explique al cliente amablemente el funcionamiento de la compensación.

Errores:
Es algo común que al introducir el importe en la casilla Precio del paquete indemnizaciones, nos olvidemos de restarlo. Si no lo hemos hecho acabamos de hacer una factura positiva errónea que debemos de rectificar.

Para ello tenemos que hacer el paso 1 al revés, es decir restando, esto nos arregla el fallo anterior, pero aún debemos de hacer otra más que será la buena, es decir la que deberíamos haber hecho desde el principio (imprime una copia).

Ahora tenemos 2 positivos (unos de ellos es el ‘bueno’ y debemos tener dos copias del mismo) y un negativo, junta un positivo y un negativo (estos se anulan), el positivo restante será el ticket correcto que va junto a la ficha de indemnización, pero de este deberíamos tener una copia ya que también necesitamos juntarlo con el positivo y negativo que ya juntamos anteriormente.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO DAR COBRO NEGATIVO A UNA FACTURA YA COBRADA',
    keywords: ["cobro negativo", "factura cobrada", "sobrante negativo", "abono", "desliquidar", "descuento entidad", "cancelar sobrante"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_dar_cobro_negativo_a_una_factura_ya_cobrada.pdf',
    description: `El modo de proceder en estos casos es generar un sobrante negativo indicando en la ventana de sobrante todos los detalles relativos a esta "incidencia", esto es:

- Importe que se descuenta la entidad
- En nº de documento externo el número original de la factura, ya que , no se puede desliquidar la factura que se pago en el mes de Enero
- En observaciones se puede indicar, los motivos por el que la entidad decide descontarse esa cantidad.

De esta manera Avalon, no paraliza el proceso de cobro, es necesario registrar el cobro conjunto que realiza la entidad aunque se descuente una cantidad con la que no se está deSacuerdo.

Así si finalmente, tras gestionar esta incidencia, resulta que finalmente no es correcto que la entidad se descuente dicha cantidad se podrá cancelar el sobrante negativo con el cobro correspondiente recibido.

Si por el contrario, la entidad está en lo cierto se deberá emitir un abono para ajustar la facturación y producción de la entidad que se cancelará contra dicho sobrante negativo.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO ENVIAR UNA ENCUESTA INE',
    keywords: ["INE", "encuesta", "cuestionario", "estadística", "nacionalidades", "provincias", "código de control", "enviar encuesta"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_enviar_una_encuesta_ine.pdf',
    description: `Intento explicar la forma de enviar cuestionarios de INE así como la forma de revisar la información y a tener en cuenta.
Primeramente hay que tener pasadas las nacionalidades y las provincias en todos los cardex (provincias solo en españoles)

Hay que rellenar la cabecera de la encuesta de la siguiente forma
NºOrden: Es el número de orden informado por INE

Código de control: Es el código de control informado por INE

Hotel: El Hotel

N. registro: Es el UR de la primera página del cuestionario Excel, por ejemplo en este caso 3926 ( 2=semana y 6=mes y 39 viene indicado por INE)

Fecha de referencia:  Es la fecha del primer día de la encuesta

Inicio/Fin de temporada: Pues eso, fechas de apertura y cierre del hotel

Habitaciones/plazas: Nº de habitaciones y plazas oficiales

Desde/Hasta: Primer día del mes y último día del mes que se nos pide la encuesta

Todo lo otro se rellena con lo que se nos pide
Una vez rellenada la cabecera la guardamos y generamos para ver el resultado y pasar a la comprobación de los datos:

Para ver el resultado y comprobar los datos debemos utilizamos el apartado Detalle. 

Primeramente revisamos las estancias por provincias y países y conseguir que no haya ninguno en la fila en blanco, sino dará error al enviar el cuestionario. Para conseguir esto debemos revisar los datos de los clientes utilizando Detalle (Personas entradas) tanto de países como de provincias y en los que haya estancias en la fila en blanco vamos a ese día de entrada y lo  revisamos en Clientes / Cardex  , en esta pantalla podemos filtrar por fecha de estancia y/o fecha de entrada(el país de nacimiento y país de residencia siempre debe estar rellenado y la provincia en caso de ser españoles). Notar que para mayor facilidad se pueden recolocar las columnas de país nacimiento ,país residencia y provincia en las primeras posiciones.

NO ES NECESARIO PONER “NO IMPUTA” EN LAS PROVINCIAS

Una vez revisados los datos de los clientes volvemos a generar los datos y si siguen apareciendo estancias en la fila en blanco lo que se debe hacer y como último recurso es sumar las estancias que aparecen en la primera fila a la segunda y poner un cero (0) en la primera fila.

Se debe revisar todas las pantallas de provincias y países (estancias, entradas y salidas)

Seguidamente revisamos las habitaciones por si hubiera algún error, para eso vamos a DetalleHabitaciones:

En esta pantalla se muestran las habitaciones ocupadas diariamente, lo que debemos revisar es la fila DIF/HABS, si en esta fila aparece un valor en negativo nos indica que estamos por encima de las habitaciones oficiales, por lo que debemos restar ese número de habitaciones a las habitaciones indicadas en la fila OTRAS si es posible o en otra fila con el fin de que nos quede en blanco (0) la fila DIF/HABS. Una vez revisadas las habitaciones guardamos.

En este momento podemos proceder a enviar la encuesta para ver si da más errores (posiblemente de errores en pernoctaciones desde el día 2 al 31 … ); la encuesta se envía en Tareas / Enviar

Si da error en pernoctaciones se deben revisar utilizando una hoja de Excel y sumando las estancias del día anterior a las entradas del día actual menos las salidas del día actual.
Para ello se deben exportar a Excel las estancias, personas entradas y personas salidas tanto de provincias como de países y copiar los datos un una hoja de Excel adjunta y revisar las diferencias. 

Donde haya una diferencia se deben modificar las salidas de ese dia.

Una vez revisado se puede enviar la encuesta a través de tareas / envÍo`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO CAMBIO LOS DATOS DE UNA FACTURA SI EL CLIENTE LA QUIERE A UNA EMPRESA',
    keywords: ["cambiar datos factura", "factura empresa", "modificar factura", "facturación", "datos fiscales", "factura a nombre de empresa"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_cambio_los_datos_de_una_factura_si_el_cliente_la_quiere_a_una_empresa.pdf',
    description: `¿COMO CAMBIO LOS DATOS DE UNA FACTURA SI EL CLIENTE LA QUIERE A UNA EMPRESA?

Debemos ir al menú “Facturación” y a “Facturas”; seleccionamos la factura a modificar (podemos filtrar por bono, nombre, fechas, etc.

La abrimos utilizando el botón “Consultar” y directamente en la factura podemos modificar los datos introduciendo el nombre de la empresa, dirección etc… y grabamos. 

Siempre y cuando la reserva este como “Estancia” igual a huésped, si está a Entidad deben ponerse en contacto con facturación, esta información debería ser la misma que aparece en la factura.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO FACTURO',
    keywords: ["facturar", "cobrar", "factura", "extras", "cuentas", "desviar cargos", "no alojados", "cuenta de auditoria", "facturar e imprimir"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_facturo.pdf',
    description: `¿COMO FACTURO?

Extras: A la salida (si nos ha dejado tarjeta de crédito). En Cuentas de la reserva.

Si todo está Ok basta seleccionar Facturar / facturar e imprimir (si deseo imprimir la factura) y elige el tipo de facturación (ejemplo: visa, efectivo…?

Si hay alguna línea que no se corresponde a este cliente tengo dos opciones: 
Si sé de que cliente es se lo traspaso.
Utilizaremos una cuenta de “No Alojados” como puente, en concreto la de prolongaciones. Lo puedo hacer desde la opción “Facturar” / “Desviar a no Alojados”

Vamos a “Cuentas no alojados” y seleccionamos la cuenta de prolongaciones.

La abrimos pulsando sobre “Cuentas” y después de seleccionar las líneas que anteriormente habíamos traído aquí desde la reserva antigua.

Elegimos “Facturar / Desviar a en Hotel” del menú del editor de cuentas. 

Seleccionamos la cuenta de la reserva nueva de entrada y los cargos deberían aparecer en la cuenta de la reserva nueva. 
 
Si no lo sé lo paso a cuenta de auditoria. (es recomendable mantener la factura en la cuenta de No Alojados, informar al jefe de recepción y agotar todas las posibilidades de encontrar al dueño de la factura antes de enviar a cuenta de auditoría)`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO HACER CHECKIN',
    keywords: ["checkin", "hacer checkin", "check in", "entrada", "gestión de reservas", "escanear", "vidsigner", "ecotasa", "facturar ecotasa"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_hacer_checkin.pdf',
    description: `¿COMO HACER CHECKIN?

Desde el icono de gestión de reservas. 

Buscamos la reserva por el nombre del cliente y/o localizador haciendo click sobre el campo por el que queremos buscar.
Entramos a la reserva pulsando sobre la flecha azul
Una vez en la vista de la reserva pulsamos el botón Check In (maleta con flecha verde)
Si existen varias habitaciones en la misma reserva, selecciona la habitación antes de apretar el botón de Check in

Primero seleccionamos la fila del cliente y luego pulsamos en escanear (prepara la tarjeta o pasaporte en el escáner)

El siguiente paso es seleccionar una o varias filas (solo adultos) y pulsar el botón VIDSIGNER0. 
Esto envía el cardex a la tablet para donde el cliente debe firmar la protección de datos.

Ahora podemos pulsar en CONTINUAR (botón a la derecha del todo)

Es el momento de facturar y cobrar el cargo de la ecotasa.
Para ello pulsa el botón Cuentas

Ahora elige el método de pago.
Es posible fraccionar la factura si el cliente lo desea, simplemente escribe la cantidad y luego pulsa el botón correspondiente (efectivo, visa…)

Existe la opción de check in masivo donde se pueden realizar comprobaciones de datos faltantes antes de realizar el check in.

Si se detecta durante el proceso alguna incidencia con las personas se debe informar a reservas para que sea subsanada antes de hacer el check in; si no se encuentra a nadie se deberá modificar la reserva en dingus para que baje con los datos correctos también antes de realizar el check in.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO HACER EL CIERRE DIARIO',
    keywords: ["cierre diario", "cerrar día", "facturación", "finanzas", "cajas cerradas", "puntos de venta"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_hacer_el_cierre_diario.pdf',
    description: `¿COMO HACER EL CIERRE DIARIO?

Opción de menú Facturacion y Finanzas / Cerrar Día

Antes debemos tener todas las salidas del día facturadas, cajas cerradas, puntos de venta (terminales) cerrados, entradas y salidas realizadas … y si hemos cambiado la fecha de trabaja también debemos tener las salidas de la nueva fecha de trabaja facturadas.

Chequeamos si hay errores y si los hay los solucionamos y una vez este todo arreglado procedemos a cerrar.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO HAGO UN UPGRADE DE HABITACIÓN',
    keywords: ["upgrade", "cambio de habitación", "cargo adicional", "suplemento", "bookincenter", "paquetes", "upgrade hab", "premium"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_hago_un_upgrade_de_habitacion.pdf',
    description: `¿COMO HAGO UN UPGRADE DE HABITACIÓN?

Los  cambios de habitación ( UPGRADE ) con cargo adicional, de venta en Recepcion deberán gestionarse como detallado a continuación: 

La tarifa a aplicar de los suplementos por cambio de tipo de habitación, irán en base a los precios de BookinCenter del momento en que el cliente solicite el cambio
Deberá realizarse la consulta a través de Busqueda de precios y disponibilidad, marcando los flags de las opciones Multitarifa y Sin disponibilidad, y seleccionando las fechas de estancia, ocupación, eligiendo de la tabla de precios el régimen de reserva.

El importe será el resultante de la diferencia de precio entre la habitación reservada y la habitación de UPGRADE

El importe de UPGRADE deberá introducirse en Avalon por Paquetes, seleccionando la opción UPGRADE HAB.

Mediante “Gestión de reservas”,  desde el Terminal/Habitación o bien buscando la reserva en el buscador de documentos (la Lupa) abrimos la reserva.

Despliega la opción ‘Tareas’ y haz clic en el apartado ‘Paquetes’

Selecciona la categoría ‘ALOJAMIENTOS’ y el paquete ‘UPGRADE HAB’

Para UPGRADE a tipología PREMIUM, se ha modificado a aplicación como EXTRA que se deberá añadir a la reserva en BookinCenter en los casos de reservas CALL CENTER | CALL CENTER HOTEL o bien como cargo en Avalon por opción Paquetes SERVICIOSWEB_ALLSTAY,si la reserva ya estuviera en estado Check in. 

Se enviará a cada recepción diariamente un email con un documento adjunto para notificar los cambios de habitación con cargo adicional realizados el día anterior ( ver documento ), para que podamos indicarlo en la reserva, a través de BookinCenter, y sea posible la consulta de UPGRADES realizados. Dicho documento, deberá ser enviado a las direcciones: support.online-sales@hipotels.biz, cumplimentado con los datos solicitados. 

En caso de no recibir el reenvío, se entenderá que no han realizado cargos adicionales por cambio de tipo de habitación el día anterior de la recepción del documento.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO HAGO UN UPGRADE DE PENSIÓN',
    keywords: ["upgrade pensión", "cambio de régimen", "upgrade pension", "paquetes", "alojamientos", "mejorar pensión"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_hago_un_upgrade_de_pension.pdf',
    description: `¿COMO HAGO UN UPGRADE DE PENSIÓN?

El importe de UPGRADE deberá introducirse en Avalon por Paquetes, seleccionando la opción UPGRADE PENSION.
Mediante “Gestión de reservas”,  desde el Terminal/Habitación o bien buscando la reserva en el buscador de documentos (la Lupa) abrimos la reserva.

Despliega la opción ‘Tareas’ y haz clic en el apartado ‘Paquetes’

Selecciona la categoría ‘ALOJAMIENTOS’ y el paquete ‘UPGRADE PENSION’

Elige el nuevo régimen de pensión abriendo el desplegable y aprieta la tecla ENTER del teclado, en este momento debe de salir el importe Total paquete, elige el Tipo de cobro a realizar y acepta en el botón de verificación. `
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO HAGO UNA PROLONGACIÓN',
    keywords: ["prolongación", "extender estancia", "nueva reserva", "dingus", "desviar cargos", "cuentas no alojados", "check out", "check in", "traspasar cargos"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_hago_una_prolongacion.pdf',
    description: `¿COMO HAGO UNA PROLONGACIÓN?

A través de Dingus se debe hacer una nueva reserva y realizamos el check out de la vieja, quedándonos con la nueva por los días de prolongación.
¿Qué hacemos con los cargos?, tenemos dos opciones

Los facturamos y cobramos al dar el check out

Los traspasamos a la reserva nueva, ¿cómo?: 
Utilizaremos una cuenta de “No Alojados” como puente, en concreto la de prolongaciones. Lo puedo hacer desde la opción “Facturar” / “Desviar a no Alojados”

Damos el Check out a la reserva de salida y el check in a la nueva

Una vez hecho el chek in vamos  a “Cuentas no alojados” y seleccionamos la cuenta de prolongaciones.

La abrimos pulsando sobre “Cuentas” y después de seleccionar las líneas que anteriormente habíamos traído aquí desde la reserva antigua. 

Elegimos “Facturar” / ”Desviar a en Hotel” del menú del editor de cuentas. 

Seleccionamos la cuenta de la reserva nueva de entrada y los cargos deberían aparecer en la cuenta de la reserva nueva.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO IMPRIMIR PROFORMA Y FACTURAR SI ES CORRECTA',
    keywords: ["proforma", "imprimir proforma", "facturar", "vista preliminar", "cuentas", "check in", "imprimir factura", "factura proforma"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_imprimir_proforma_y_facturar_si_es_correcta.pdf',
    description: `¿COMO IMPRIMIR PROFORMA Y FACTURAR SI ES CORRECTA?

Desde la reserva podemos acceder a Cuentas y allí imprimir o bien Vista preliminar. 

De esta forma imprimimos la proforma que podrá comprobar el cliente, si esta correcta podemos Facturar desde esta misma ventana.

Podemos sacar la proforma incluso antes de hacer el Check in, o de que el cliente llegue.

Una vez dentro de la reserva abrimos el desplegable de flechas azules y pulsamos Imprimir

Saldrá una pequeña ventana donde podemos marcar la opción Proforma y darle a imprimir.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO INTRODUZCO LAS COMISIONES HIPOTELS',
    keywords: ["comisiones", "hipotels", "comisiones varias", "venta", "terminal", "recepcion", "introducir comisiones"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_introduzco_las_comisiones_hipotels.pdf',
    description: `¿COMO INTRODUZCO LAS COMISIONES HIPOTELS?

Desde el terminal de Recepcion, en el apartado de Venta

Pulsa la opción ‘Comisiones Varias’ para ver los diferentes tipos.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO LIMITO EL CREDITO A X EUROS Y INTRODUZO EL IMPORTE QUE SE ENTREGUE COMO ANTICIPO',
    keywords: ["limitar crédito", "crédito limitado", "anticipo", "importe anticipo", "registrar caja", "tipo de crédito", "bloquear", "avisar"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_limito_el_credito_a_x_euros_y_introduzo_el_importe_que_se_entregue_como_anticipo.pdf',
    description: `¿COMO LIMITO EL CREDITO A X EUROS Y INTRODUZO EL IMPORTE QUE SE ENTREGUE COMO ANTICIPO?

En la reserva cambio el “Tipo de Crédito” a Limitado e introduzco el importe limite, \`puedo elegir “avisar” o “bloquear”.

Para que el importe se registre en caja y se aplique a la facturación se debe introducir en la misma reserva un anticipo por el importe que nos deje el cliente y con la forma de pago correcta.  

Elige la opción nuevo para abrir el método de pago.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO MARCO QUE UNA RESERVA NO TIENE CRÉDITO',
    keywords: ["crédito", "sin crédito", "marcar sin crédito", "gestión de reservas", "buscador de documentos", "configurar crédito"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_marco_que_una_reserva_no_tiene_credito.pdf',
    description: `¿COMO MARCO QUE UNA RESERVA NO TIENE CRÉDITO?

Abrimos la reserva utilizando “gestión de Reservas” 

O bien el “Buscador de documentos”

Cambiamos el crédito en la misma reserva:

Nota: Se puede configurar que las reservas lleguen automáticamente sin crédito o con crédito (ponerse en con dpto.  informática)`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO MODIFICO LAS OBSERVACIONES A LAS RESERVAS DE FORMA RAPIDA',
    keywords: ["modificar observaciones", "observaciones reserva", "entrada masiva", "ficha", "edición rápida", "observaciones rapidas"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_modifico_las_observaciones_a_las_reservas_de_forma_rapida.pdf',
    description: `¿COMO MODIFICO LAS OBSERVACIONES A LAS RESERVAS DE FORMA RAPIDA?

Utilizando la pantalla de “entrada masiva de reservas”, podemos elegir que columnas ver y ordenarlas según nuestra conveniencia. 

En la opción Ficha accedemos a la reserva`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO PASAR CARGOS ENTRE CUENTAS EN HOTEL',
    keywords: ["pasar cargos", "mover cargos", "traspasar cargos", "cuentas", "hotel", "ctrl", "arrastrar", "mover", "facturado"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_pasar_cargos_entre_cuentas_en_hotel.pdf',
    description: `¿COMO PASAR CARGOS ENTRE CUENTAS EN HOTEL?

Puedo seleccionar dos o más cuentas manteniendo pulsada la tecla  Ctrl y seguidamente pulsamos “Cuentas”; se nos van a abrir las dos o más cuentas y podremos mover cargos de una cuenta a otra. (Siempre que no este facturado).

Para mover los cargos solos se trata de arrastrar la línea a la cuenta deseada, de derecha a izquierda o de izquierda a derecha.

También puedes marcar el cargo y utilizar la opción Mover, después selecciona la cuenta de destino.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO PONGO LA MISMA HABITACION EN DOS RESERVAS',
    keywords: ["misma habitación dos reservas", "multireserva", "medias dobles", "comunicantes", "jefe de recepción", "habitación Z", "asignar misma habitación"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_pongo_la_misma_habitacion_en_dos_reservas.pdf',
    description: `¿COMO PONGO LA MISMA HABITACION EN DOS RESERVAS?

Se debe hacer con el usuario de jefe de Recepción.  Se trata de simplemente asignar las habitaciones de forma normal a las reservas con este usuario.

Si aún no está en el hotel se puede modificar la habitación directamente de la reserva, sino se hace un cambio de habitación.

Para gestionar las "medias dobles” en previsión también se debe asignar la misma habitación a las dos reservas, aunque sea una entrada para dentro de 6 meses y no sepamos que habitaciones tendremos vacías, se podría asignar, una habitación tipo “Z” si están creadas en el hotel.

El tema de las antiguas “comunicantes” se tratará ahora de dos reservas que ocupan dos habitaciones. Ya no se ponen dos habitaciones a la misma reserva.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO QUITO UN CARGO DE EXTRA ERRONEO',
    keywords: ["quitar cargo", "cargo erroneo", "extra erroneo", "eliminar cargo", "auditoria", "mover a auditoria", "abonar y nueva"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_quito_un_cargo_de_extra_erroneo.pdf',
    description: `¿COMO QUITO UN CARGO DE EXTRA ERRONEO?

No se puede poner en negativo ni eliminar un cargo, se debe llevar a la cuenta de no alojados de “Auditoria”

Antes de facturar: Elegimos el Cargos y seleccionamos en la misma pantalla “Mover a Auditoria”

Después de Facturar: Hay que hacer un “Abonar y Nueva” desde Facturación y Fiananzas / Facturas  y enviar los cargos a “Auditoria”. En la pantalla que se nos muestra al pulsar sobre “Abonar y nueva” podemos enviar a “Auditoria” los cargos que queramos. Si no queremos enviar ninguno a auditoria pulsamos sobre “Continuar”`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'COMO VENDO ALGO',
    keywords: ["vender", "venta", "cajas fuertes", "paquetes", "cobrar", "producto", "categoría", "terminal"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/como_vendo_algo.pdf',
    description: `¿COMO VENDO ALGO (CAJAS FUERTES,ETC…)?

Desde el terminal poniendo la habitación y según la necesidad o venta o paquetes (en la reserva)

En PAQUETES, elige la CATEGORÍA y el PRODUCTO

Rellena los datos marcando los días (si es preciso) y tipo de cobro, después acepta la operación.

En Venta, elige la CATEGORÍA y el PRODUCTO, algunos productos pueden no tener precio, puedes escribir la cantidad y marcar el producto, por último dale al botón COBRAR, elige el tipo y valida la operación.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'GESTION DE NO SHOW',
    keywords: ["gestion no show", "no show", "no presentado", "recuperado", "tareas no show"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/gestion_de_no_show.pdf',
    description: `Se deberá poner el cliente en estado NO SHOW para TODAS las entradas no llegadas del día tanto ENTIDAD como CLIENTES. 
En la reserva despliega el botón de Tareas y busca la opción ‘NO SHOW’, es la última de la lista. 

Informar diariamente de los No show y No show presentados al día siguiente  "Recuperado" a support.online-sales@hipotels.com`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'GESTION REPETIDORES AL ESCANEAR DOCUMENTOS',
    keywords: ["repetidores", "escanear documentos", "fusión", "fusionar", "cardex", "búsqueda repetidores", "localizar clientes", "fusionar fichas"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/gestion_repetidores_al_escanear_documentos.pdf',
    description: `La posibilidad de localizar clientes repetidores al escanear documentos se basa en la configuración que se haga en la ventana ‘Campos para búsqueda de repetidores’ que se encuentra en Recepción y Reservas | Datos.

En dicha ventana, se deben definir grupos (1, 2, 3… ya que representarán el orden de búsqueda) de campos para localizar repetidores y a cada grupo, asignar uno o varios campos que aparecen en la ficha de la reserva (Documento, Apellido, Nombre, etc.) que nos interese para localizar a los clientes.

De esta manera, al escanear documentos, el sistema buscará registros que coincidan con los criterios definidos en los grupos de búsqueda, por orden de grupo, y cuando encuentre alguna coincidencia dejará de buscar. Es decir, si al escanear el documento, el sistema encuentra coincidencias con los campos del primer grupo, dejará de buscar. Sin embargo, si del primer grupo no encuentra nada, pasará a buscar coincidencias en los campos del grupo 2.

Desde ésta misma ventana, verá que la primera columna empezando por la derecha es ‘Aceptar con una coincidencia’. Esta columna permite la posibilidad de que el sistema, para los grupos en que se indique, al encontrar un registro coincidente lo acepte como bueno y que los datos nuevos se fusionen directamente con los que ha encontrado en la ficha cárdex. 

En caso de no activar esa columna, o de que el sistema encuentre más de una coincidencia, aparece una nueva ventana. En ella, la primera línea que se muestra es el cárdex que se acaba de escanear. Las otras líneas son las coincidencias que se han encontrado. Las opciones son:

· Aceptar el registro de la fila en la que se hace clic. Si el cárdex es nuevo se creará una ficha nueva, pero si es uno de los que existen, se descartan los demás y se sustituyen los datos.

El icono de esta opción es una V azul.

· Fusionar las dos fichas. Se grabarán los datos que traiga el escaneo del nuevo documento en el registro existente, y los datos que no traiga el nuevo escaneo se dejarán como están. El icono son dos hojas, una encima de la otra, con una flecha roja dirigida hacia abajo.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'HABITACIONES COMUNICANTES',
    keywords: ["comunicantes", "habitaciones comunicantes", "puerta comunicante", "asignar comunicantes", "tipo de ocupación", "desplazado", "no contar"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/habitaciones_comunicantes.pdf',
    description: `Se ha hecho una gestión de habitaciones comunicantes.

En el mantenimiento de habitaciones hay un botón nuevo para definir las habitaciones comunicantes. Si no están definidas ahí no se podrán asignar. Puedes asignar como comunicantes todas las que quieras.
 
Si la habitación tiene comunicantes en la ficha de la reserva sale este icono 
 
Si pulsas te aparece una ventana para que indiques con qué habitación comunica
 
Ahí hay dos botones. El de Comunica activa la comunicación (abre la puerta comunicante). El de No comunica la cierra. Con las fechas defines los días que la puerta está abierta. Podría ser comunicante sólo algunos días de la estancia.

Cuando abres la puerta comunicante en la ficha de la reserva cambia el icono por este 
 
En el hotel siempre tienes el mismo número de habitaciones totales, lo único que pasa ahora si comunicas es que una reserva puede ocupar dos habitaciones. La que comunica sale como ocupada los días que comunica. 
- Tipo de ocupación

En la tabla de Tipos de habitación por hotel se ha sustituido el check de Desplazados por un option con los siguientes valores.

Estándar. La habitación se comporta de forma normal.

Desplazado. Es una habitación de desplazados. Sustituye al antiguo check.

No contar. Estas habitaciones no cuentan en las estadísticas de ocupación. Son habitaciones normales, se puede asignar, crear tareas, configurar en ama de llaves, etc. pero no cuentan para la ocupación, ni estadística en general.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'LISTADO DE LEGIONELA',
    keywords: ["legionela", "listado", "informe", "housekeeping", "hskp", "cmp-99", "servicios"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/listado_de_legionela.pdf',
    description: `Housekeeping / Informes / Servicios x Asistente HSKP

En el apartado de ‘Asistente HSKP’ escribe ‘cmp-99’ o abre el desplegable y al final veras CMP-99`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'Bienvenidos y Llaves',
    keywords: ["bienvenidos", "llaves", "tarjetas bienvenida", "hipocardgenius", "hipoconserjesuite", "imprimir tarjetas", "excel", "importar datos", "A6", "bypass"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Bienvenidos.pdf',
    description: `Tarjetas bienvenidos: Utilizando el programa HipoCardGenius o HipoConsergeSuite (pestaña HipoCardGenius)

Entrar por gestión de reservas y ordenar la lista por habitación.

Apretar el botón de ‘Excel’
Al abrirse el Excel, copiamos el número de habitación, el apellido y el régimen.
Vamos al programa HipoCardGenius o HipoConsergeSuite y pegamos la información en el apartado 'Pega los Datos Aquí' dentro de la pestaña 'Importar Datos'

Después aprieta el botón 'Procesar y Añadir Huéspedes'
Seleccionamos la pestaña 'Imprimir Tarjetas' (coloca las tarjetas en el Bypass de la impresora)

Asegúrate de tener seleccionada la plantilla correcta. Aprieta el botón azul 'Imprimir Tarjetas Seleccionadas'
La impresión debe realizarse en formato A6 y sin márgenes.

Se recomienda que el informático instale una copia de la impresora que utilice la recepción indicando impresión obligatoria a través del Bypass.

Si no se ha generado una impresora adaptada al programa, imprime en la de uso habitual sacando la bandeja DinA4 (evita impresiones erróneas). Esto dará un error por falta de papel, en la impresora selecciona la opción Bypass formato A6`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'Policia, Hospederias, Entrada de Viajeros',
    keywords: ["policia", "hospederias", "entrada de viajeros", "generar archivo", "alta masiva", "parte de viajeros", "ses.mir.es", "errores", "fallos"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Policia.pdf',
    description: `Opción: Recepción y reservas, Clientes, Entrada de Viajeros
Comprobar fechas de nacimiento, expedición y sexo.
2025 Datos requeridos:
C.P. - Estado/C.A. - Población - Provincia - País de Residencia - eMail - Teléfono No Soporte
Apretamos el botón ‘Generar’
Nos debería aparecer el mensaje: Se va a generar un archivo.... Aceptamos.
   Entrar por chrome, en hospederías:
https://hospedajes.ses.mir.es/hospedajes-sede/#/comunicacion/inicio
 
 Elegimos la opción del medio, Alta masiva
 Apretamos donde se indica ‘Seleccione un tipo de comunicación’ Y elegimos la opción ‘Parte de viajeros’
Buscamos el Botón naranja que nos indica: ‘Seleccionar archivo’
 Buscamos el archivo que nos generó Avalon y lo cargamos.
Si el mensaje es correcto, el texto nos dirá ok en tonos verdes.
Fallos: hay múltiples posibilidades y aún estamos recopilando y estudiándolos para darles una solución. De no encontrarlo en este manual, comuníquese en el grupo y entre todos trataremos de darle respuesta.

 FALLOS
Al intentar generar el archivo en Avalon es normal que nos valla indicando multitud de errores, por eso lo mas fácil es rellenar todos los datos, ya sea con puntos, barras o copiando los datos de otros pasajeros siempre que sean de la misma habitación.
El email debe ser con estructura info@info.com. por ejemplo: nolose@nolose.com, eso@eso.es......
Este fallo nos indica error en el código postal.
Se recomienda cerrar la ventana de Entrada de viajeros y volverla a cargar como se indica en el primer paso del manual.
Si el fallo sigue, revisemos el apartado C.P.
Puede ser que al introducir el c.p se cambie automáticamente la nacionalidad del cliente a español y no reconozca el código postal con otra información (como la provincia) asociada anteriormente a este cliente.
Es cuestión de prueba y error`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'Nueva Reserva BookinCenter',
    keywords: ["nueva reserva", "bookincenter", "crear reserva", "manual", "cliente", "habitacion", "estancia", "tarifa", "cupo", "prepagos", "cancelacion", "extras", "reservas"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Nueva_Reserva_BookinCenter.pdf',
    description: `Para las nuevas reservas, que por un motivo u otro precisen ser introducidas de forma manual en BookinCenter, excepto las que se realicen como venta mediante código cliente CALL CENTER, el funcionamiento de Bookincenter asi como las opciones de este modulo son los indicados a continuación:
Reservas de forma manual a través de la opción "Nueva reserva" del menú principal "Reservas".
Una vez accedamos a dicha pantalla, nos encontraremos con el siguiente entorno:

Lo primero que podemos visualizar son los datos básicos de la reserva, encuadrados en la cabecera de fondo gris:
Todos los campos que vemos señalados con asterisco serán obligatorios.
 
 Cliente: seleccionaremos el cliente con el que queremos hacer la reserva.

 Fecha desde/hasta: rango de fechas de estancia de la reserva. Debemos tener en cuenta que si en nuestra reserva hay más de una habitación con fechas de estancia distintas, las
 fechas aquí reflejadas cogerán desde la fecha de entrada más cercana hasta la fecha de
salida más lejana.

 No noches: número de noches total de la reserva.

 Nombre: nombre del pasajero principal de la reserva. Dado que este concepto es
obligatorio, aparece como dato por defecto la palabra Nombre y, de no ser modificado, la
reserva se grabará con ese dato como nombre del pasajero.

 Localizador: podemos indicarlo manualmente o dejarlo en blanco, en cuyo caso se
generará automáticamente un localizador cuando guardemos la reserva, con el formato AA00000AA
A continuación encontramos dos pestañas: Cabecera reserva y Datos reserva.

La Cabecera reserva nos ofrece los siguientes datos:
  Fecha venta: por defecto aparecerá siempre la fecha del día en curso, si bien ésta es modificable.

 Total reserva/total recálculo: importes de la reserva que se cargarán automáticamente una vez guardemos la reserva.

 Divisa: moneda de los importes de la reserva.

 No habitaciones: nos permite añadir o quitar habitaciones.

 Comisión: indica el importe de la comisión de esta reserva. Se genera de forma automática cuando se guarda la reserva si ésta está en PVP. En caso de que la reserva esté en neto, el importe siempre será 0.

 Tipo comisión: indica si la reserva es neta o PVP (esta información la recupera de lo que tengamos configurado para el cliente de esta reserva en la pantalla de Grupos por hotel).

 Importe pendiente: en caso de que se haya realizado ya algún pago de la reserva, aquí aparecerá el importe restante. Se calculará de forma automática al guardar la reserva.

 Total paxes: número total de pasajeros de la reserva.

 Fecha modificación: indica la fecha en la que ha tenido lugar la última modificación de la
reserva.

 Fecha creación: indica la fecha en que se generó la reserva en Bookincenter.

 Usuario creación: indica el usuario que ha dado de alta la reserva.

 Usuario modificación: indica el usuario que ha realizado la última modificación.

 Estado: informa del estado de la reserva. Pueden ser:

 Nueva: lo visualizaremos sólo mientras estamos dando de alta la reserva. Una vez se guarde
cambiará a OK.

 RQ: podemos crear la reserva en estado on request en sustitución de OK, siempre y cuando
se haya definido para este cliente la posibilidad de realizar reservas en RQ en la pantalla
de Grupos por hotel.

 En espera: es otro tipo de estado para la reserva, que no descuenta cupo. En un futuro (y
controlado por el usuario) la reserva se podrá pasar a estado OK (y por tanto ya descontaría
cupo) o bien a estado Rechazada.

 Forzar: la reserva quedará marcada con esta opción en caso de que sea necesario forzarla
por no haber disponibilidad. Si ya somos conscientes de que no se está respetando la disponibilidad, podemos marcar esta opción directamente; caso contrario, el sistema nos dará aviso de que se va a forzar la reserva y deberemos aceptar para que ésta se dé de alta.
  
La siguiente pestaña, como hemos comentado, sería la de Datos reserva.
Aquí podremos indicar los datos personales del pasajero, así como los datos de la tarjeta de crédito.
En el apartado Comentarios, podremos añadir cualquier cuestión que consideremos sea importante conozca el hotelero (cliente VIP, habitación fumadores, piso alto, etc.).
Tras la cabecera de la reserva tenemos las líneas de habitación, donde podremos cargar los datos de contratación de ésta.
Podremos crear la reserva con una o varias habitaciones.
No será necesario que todas las habitaciones tengan las mismas características: cada una de ellas podrá ser de una tipología distinta, en distinto régimen, distintas fechas, etc.
Existe, así mismo, la posibilidad de introducir los datos directamente en el grid, haciendo doble click sobre cualquiera de sus casillas, o bien en el modo editar, al que podremos acceder seleccionando una de las líneas y clickando sobre ella.


Distintas opciones que encontramos:

  Estado: siempre que creemos una reserva desde cero, esta casilla aparecerá con el concepto Nueva por defecto. No obstante, podremos cambiar dicho estado a En
espera o RQ (OJO; este cambio sólo se podrá hacer editando la línea desde el modo grid).

 Ref. Habitación: podremos asignar un número de referencia por habitación a esta reserva.

 Habitación: indicaremos la tipología de habitación deseada.

 Habitación venta: tipo de habitación con la que la reserva ha sido vendida inicialmente,
 pudiendo coincidir o no con la habitación actualmente contratada.

 Régimen: pensión alimenticia elegida para la estancia de esta habitación.

 Fecha desde/hasta: fechas de la estancia de esa habitación.

 Fecha venta: fecha en la que la habitación que estamos visualizando fue vendida.

 Adultos/Niños/Bebés: indicaremos los paxes que ocuparán la habitación.

 Grupos Cupo/Tarfia: tarifa y cupo que serán aplicados sobre esta habitación.

 Cód. Promoción: en caso de que queramos aplicar alguna de nuestras promociones a esta
habitación, indicaremos la promoción correspondiente en este apartado.

 Promoción Descuento:

 Precio total: costa de la estancia de esa habitación. Puede indicarse un precio concreto y
dejarse en blanco, en cuyo caso la reserva se deberá "recalcular" al guardarse para que en el sistema le aplique precio de forma automática siguiendo las condiciones especificadas en la habitación.

 Tipo tarifa: seleccionaremos si la tarifa aplicada es neta o PVP, o bien podemos dejar este apartado sin editar y el sistema tomará los datos de la cabecera de la reserva.

 En Check Out: podremos definir si la reserva ya está en check out.
El resto de opciones sólo serán editables una vez la reserva haya sido guardada, es decir, sólo podremos editarlas al modificar una reserva.
Tras los datos en la cabecera de la habitación, encontramos toda una serie de pestañas:

  Datos reserva: nos permite cargar los datos que deseemos para la habitación que estamos editando tales como horas de llegada y salida, datos tarjeta, etc. Para ir añadiendo datos, podremos añadir filas con el botón del menú inferior derecho de la pantalla.

 Estancias: el sistema detecta los días de descuento de cupo de la habitación en esta pantalla, y los registra.

 Paxes: recogerá el número de paxes por tipo y podremos indicar sus edades y nombres.

  Prepagos: condiciones de prepago impuestas para esta reserva.

 Líneas de precio: desglosa el importe total de esta habitación por día. El importe de cada
día será asignado al primer pax adulto.

 Líneas de precio contrato: en caso de que sea un canal tipo push, y el cliente esté definido
como 'recalcular reserva sincronizada', el importe del recálculo que se aplica en nuestro
sistema se recoge en esta pestaña.

 Gastos de cancelación: gastos de cancelación aplicables a esta reserva. Estos gastos se
reflejarán en el momento en que se guarde la reserva, si bien sólo será cargados para cobro
 en caso de que la reserva acabe siendo cancelada.

 Extras: si la reserva tiene extras aplicados, se recoge en esta pestaña la información sobre
los mismos.

Una vez introducidos todos los datos, pulsaremos sobre el botón Aceptar del menú inferior derecho para salir de esta pantalla conservando los datos. En caso de no querer conservar dichos datos o cambios, pulsaremos sobre el botón Cancelar.
Destacar, en esta pantalla, el botón Nueva habitación, que nos permitirá crear una nueva línea de habitación para editar sin necesidad de salir a la pantalla principal de Nueva reserva.
Regresando a la pantalla principal, vemos toda una serie de opciones que nos ofrece el menú inferior derecho. Repasemos las mismas:

  Datos reserva: podremos consultar en una sola pantalla los datos de cada una de las habitaciones creadas, así como editarlos.

 Extras: permite consultar los extras cargados, así como añadir o eliminar.

 Prepagos: muestra los prepagos que deben ser realizados; ofrece, así mismo, la posibilidad
de añadirlos así como eliminarlos.



 Gastos de cancelación: refleja los gastos de cancelación que será aplicados en caso de anulación de la reserva. Podremos, así mismo, modificarlos.

 Acciones:

 Cancelar: si consultamos una reserva ya grabada, tenemos la posibilidad de anular la reserva en su totalidad desde esta opción del menú. OJO, en caso de que se trate de una reserva de más de una habitación y solo queramos eliminar alguna de las habitaciones, se deberá ejecutar la opción de cancelar esta habitación desde la misma línea de la habitación, pinchando en el desplegable de 'estado' y seleccionando la opción 'Cancelado' y a continuación guardar la reserva.

 Calcular: calculará el coste de la reserva según los precios cargados en ese momento en Bookincenter. Si queremos poner un precio manual, omitiremos esta opción.

 Envíos: muestra el estado de los distintos envíos que Bookincenter permite realizar a PMS o de bono por mail.

 Recalcular: si guardamos la reserva con esta opción marcada, el sistema calculará el coste de la misma conforme a los precios cargados en Bookincenter y registrará la reserva automáticamente con los mismos.

 Guardar reserva: registrará la reserva en firme en el sistema.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'CERRAR MINIBAR',
    keywords: ["cerrar minibar", "minibar", "tpv", "arqueo", "restauración", "tiendas"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Minibar.pdf',
    description: `Opción: Restauración y tiendas Selecionamos el botón llamado Tpv\nARQUEO, aceptar, aceptar.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'VISAS, EFECTIVO, TRASPASO, DIFERENCIAS',
    keywords: ["visas", "efectivo", "traspaso", "diferencias", "arqueo", "caja", "totalización", "datáfono", "cierre contable"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Manual_VISAS_EFECTIVO_TRASPASO_DIFERENCIAS.pdf',
    description: `Totalización visas y cuadre del arqueo efectivo de bares y restaurantes Ticar DIFERENCIAS de efectivo
TRASPASO DE CAJA
(escanear Visas y enviar por @contabilidad)

Opción: Recepción y Reservas, Informes, Cajas, Arqueo de caja.
En caja marcamos ‘recepción’
Ordenación: Tipo de cobro
Imprimir la hoja o ver en la opción ‘Pantalla’
Aprieta en 'Efectivos' en la barra lateral de la aplicación

EFECTIVO
En la primera casilla ‘Arqueo’ introducimos el monto indicado en la hoja entregada por el departamento, de haber un faltante, introducirlo en la segunda casilla ‘Faltante’.
El monto que nos indica en el arqueo de caja (avalon) lo introducimos a la derecha, en la casilla recaudación+, al igual si hubiese un monto negativo lo introducimos en la opción recaudación-
DIFERENCIAS
Si surgen diferencias ir a: Terminal, Venta, diferencias bares...
Añade el importe y seguidamente pulsa el botón del departamento, seguidamente el botón COBRAR (amarillo), efectivo.

VISAS
Sacamos la consulta del datáfono ‘MENU’ – ‘OPERS. COMERCIO’ – CONSULTA DE TOTALES,
Una vez comprobado que coinciden en la hoja de arqueo cerramos la totalización ‘MENU’ –
‘OPERS. COMERCIO’ – CIERRE CONTABLE
Sumamos todas las totalizaciones de los diferentes departamentos y comprobamos el total. Este debe cuadrar con el total Visas/Amex del informe ‘Arqueo de Caja’
Si todo está bien, procederemos a cerrar los datáfonos.
Grapamos las totalizaciones (recuerda imprimir la hoja visas después de completar los datos para grapar las totalizaciones en la misma)
Escanea la hoja al ordenador.
Enviamos por email a: ‘’preguntar dirección email’’ con el asunto TOTALIZACIONES ‘FECHA’

Traspasos caja y comprobar que este a “0”
Opción: Recepción y reservas, Terminal, Traspaso Caja, Cajas disponibles: Recepción
Tipo: Efectivo
Introducir el importe
Cajas disponibles: Dirección.
Concepto: Salida Banco
Marcar la casilla: imprimir recibo
Sacamos el efectivo de la caja y lo metemos en un sobre.

Comprobamos que no haya diferencias en el efectivo que debemos tener de fondo. Hay hoteles que se indica cierta cantidad al iniciar el día, otros esta cantidad está descontada y empieza a 0... comprueba que el arqueo en Abalon esté dando la cifra esperada.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'BUSQUEDA DE PRECIOS EN BOOKINCENTER',
    keywords: ["búsqueda precios", "bookincenter", "tarifas", "disponibilidad", "reservas", "multitarifa", "cupo", "prepagos", "cancelacion", "buscar precios"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Busqueda_precios_BookinCenter.pdf',
    description: `A través del apartado "Reservas", podemos acceder al "Buscador de Precios y Disponibilidad"
 
En esta pantalla, podremos consultar todas las tarifas y disponibilidad existentes en las fechas que indiquemos.
En este sentido, debemos señalar dos puntos importantes:

 Multitarifa: si marcamos esa opción, nos mostrará todas las tarifas disponibles; caso contrario, sólo mostrará la marcada "Por Defecto" en Grupos Hotel.

 Sin disponibilidad: devolverá precio tanto de las habitaciones que tengan disponibilidad como de las que no.

 Ver precios privados: nos mostrará las tarifas y promociones que hayan sido creadas como privadas.

Una vez introducidos todos los datos, seleccionaremos "Buscar" y el sistema nos devolverá todos los resultados disponibles en función de la información facilitada.
 
Como podemos ver, en este caso disponemos de dos resultados diferentes: el correspondiente a la Tarifa Online, y el correspondiente a la Tarifa Online con la promoción "Tarifa no Reembolsable no permite cambios (PVP)"
Los resultados en azul indican que hay disponibilidad, en rojo que no. Haciendo doble click en el precio, podremos consultar el desglose del mismo:

En la parte inferior de esta venta, vemos el motivo de la no disponibilidad:
 
En este caso, no estamos respetando la capacidad de la habitación.
También contamos con un calendario donde, al hacer doble click, podemos ver la disponibilidad en los 30 días siguientes a la fecha de entrada seleccionada en nuestra búsqueda:

Por otro lado, esta pantalla permite, asimismo, realizar reservas. Una vez tenemos disponibilidad, seleccionamos la opción correspondiente y pulsamos el botón "Reservar":
Y de este modo accederemos directamente a la pantalla "Nueva Reserva".

*NOTA: si marcamos la opción "Sin disponibilidad" en la búsqueda, siempre deberemos obtener resultado. Si no es así, o recibimos un aviso de "error de sincronización", ello indica que hay carencia de algún dato. Es imprescindible, para que el sistema devuelva precio, que siempre haya precio de habitación y régimen, cupo y multitarifa cargados.

Para reservas CALL CENTER se ha activado un sistema de cobro mediante plataforma que envía al cliente un enlace para introducir sus datos de tarjeta y autorizar el cargo mediante PIN, lo cual conlleva a que dicho pago no podrá ser devuelto por el cliente, pero si no es autorizado por el cliente a las 24 h de la recepcion del mismo, automáticamente se le cancelara la reserva.

Los anticipos en las reservas con prepago se seguirán introduciendo como hasta la fecha.`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'FACTURAR AGENCIAS',
    keywords: ["facturar agencias", "agencias", "facturación", "finanzas", "otas", "proforma", "entidad de negocio", "b2b", "b2c"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Facturar_Agencias.pdf',
    description: `Opción: Facturación y Finanzas, Agencias.

Apretamos opciones de ventana y se desplegará la información, desmarcamos Proforma, introducimos la fecha de entrada del día actual, apretar la estrella al lado de entidad de negocio, y escribir en grupo (OTAS_B2B) seleccionar todas y aceptamos.

Apretamos donde dice Facturar

Repetimos el proceso cambiando la información de grupo, Introducimos (OTAS_B2C) 

Podemos saltarnos un paso simplemente introduciendo la palabra OTAS

Por último, ponemos la fecha de salida y apretamos Facturar`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'REVISAR E IMPRIMIR PAQUETES GOLF',
    keywords: ["golf", "paquetes", "imprimir", "revisar", "documentos", "reservas"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Golf.pdf',
    description: `Opción: Recepción y reservas, gestión de reservas, entrar al número de habitación y después a VER RESERVA.

Desplegar el botón de tareas y apretar en ‘documentos’`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'LISTADO DE CLIENTES Y OCUPACIÓN',
    keywords: ["listado clientes", "clientes alojados", "ocupación", "informes", "recepción", "reservas", "listado"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Listado_de_Clientes_alojados_y_Ocupacion.pdf',
    description: `Listado de Clientes alojados y Ocupación

Los listados se encuentran en la pestaña Recepción y reservas / Informes Al desplegarse encontraremos las diferentes opciones.

CLIENTES ALOJADOS

Desactivar comentarios Ordenación Habitación Estado Entrada


OCUPACIÓN

Elige la fecha de entrada ‘desde’’ - ‘hasta’ en función de los requisitos de la recepción. Para informes de control diario, elige la fecha actual en las dos opciones,
ejemplo: informe para consumo eléctrico`
  },
  {
    id: uuidv4(),
    type: 'pdf',
    title: 'LISTADO DE CUMPLEAÑOS',
    keywords: ["listado cumpleaños", "cumpleaños", "aniversario", "clientes alojados", "informes", "fecha de nacimiento"],
    content: 'https://hkigsovaxybfkswgjwpr.supabase.co/storage/v1/object/public/infoavalon/Listado_de_Cumpleaños.pdf',
    description: `Los listados se encuentran en la pestaña Recepción y reservas / Informes Al desplegarse encontraremos las diferentes opciones.

CUMPLEAÑOS

Informes: Clientes alojados.
Añadir ‘fecha de nacimiento desde: día requerido. Ordenación: Habitación.
Estado: Entrada`
  }
];