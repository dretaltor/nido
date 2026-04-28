export type PropiedadEstado = 'activa' | 'pausada' | 'borrador' | 'vendida'
export interface PropiedadResumen { id:string;titulo:string;ubicacion:string;precio:number;moneda:'USD'|'CRC';tipo:'venta'|'alquiler';estado:PropiedadEstado;fotos_count:number;vistas_mes:number;consultas_mes:number;created_at:string;updated_at:string }
export interface MetricasPropietario { vistas_mes:number;vistas_mes_anterior:number;consultas_mes:number;consultas_semana:number;propiedades_activas:number;propiedades_pausadas:number;tasa_respuesta:number }
export interface VistasSemana { semana:string;vistas:number }
export interface Factura { id:string;descripcion:string;monto:number;moneda:'CRC'|'USD';fecha:string;estado:'pagado'|'pendiente'|'fallido' }
export interface PlanSuscripcion { nombre:string;precio_mensual:number;moneda:'CRC'|'USD';fecha_renovacion:string;stripe_subscription_id:string|null;activo:boolean }
export interface NotificacionPropietario { id:string;tipo:'consulta'|'alerta'|'sistema'|'pago';mensaje:string;leida:boolean;created_at:string;propiedad_id?:string }
export interface DashboardPropietarioData { metricas:MetricasPropietario;propiedades:PropiedadResumen[];vistas_semana:VistasSemana[];facturas:Factura[];plan:PlanSuscripcion|null;notificaciones:NotificacionPropietario[] }