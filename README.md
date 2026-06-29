# Module ERP — Backend

Backend para el sistema de gestión de proveedores, órdenes, facturas y pagos de una empresa de manufactura mediana.

---

## Instalación

### Requisitos previos

- Node.js 18+
- Docker + imagen `postgresql:16`
- npm

### Pasos

**1. Clonar el repositorio**

```bash
git clone https://github.com/MarbeniX/module_erp.git
cd module_erp
```

**2. Instalar dependencias**

```bash
npm i
```

**3. Configurar variables de entorno**

Crear el archivo `.env.development` con las credenciales correspondientes. Las variables requeridas están declaradas en `.env.template`.

**4. Levantar el contenedor de base de datos**

```bash
docker compose up -d
```

Esto levanta una instancia de PostgreSQL 16 lista para el entorno de desarrollo local.

**5. Ejecutar el servicio**

```bash
npm run dev
```

**6. Ejecutar migraciones**

```bash
npx prisma migrate dev --name "first"
```

Crea todas las tablas en la base de datos del contenedor.

**7. Generar el cliente de Prisma**

```bash
npx prisma generate
```

Genera los tipos y el cliente localmente para que el sistema reconozca los modelos.

---

## ¿Qué construí?

Dado el problema de gestión con +40 proveedores, construí un backend general intentando abarcar los atributos, modelos y dominios **mínimos** para el sistema completo planteado.

El objetivo fue inicializar un proyecto con una **arquitectura por capas**:
Complementado con un servicio de mensajería por email y persistencia de datos con Prisma ORM.

> El diagrama de datos, logs de decisiones/acciones, planteamiento de validaciones, dudas y definición de endpoints por dominio se encuentran en el **Notion compartido**.

---

## ¿Qué hice?

### Modelos y dominios

Definí **8 modelos → 8 dominios**, considerando los requerimientos mínimos según la descripción dada:

| Modelo         | Descripción                                      |
| -------------- | ------------------------------------------------ |
| `User`         | Usuarios con roles diferenciados                 |
| `Supplier`     | Proveedores del sistema                          |
| `Product`      | Productos por proveedor                          |
| `Order`        | Órdenes de compra                                |
| `OrderLine`    | Líneas de detalle por orden                      |
| `Invoice`      | Facturas recibidas de proveedores                |
| `Payment`      | Pagos registrados contra facturas                |
| `SessionToken` | Tokens de sesión persistidos en BD por seguridad |

---

### Arquitectura por capas

El backend está estructurado en capas, siguiendo el principio **DRY (Don't Repeat Yourself)**:

- **Routes** — definición de endpoints y encadenamiento de middlewares
- **Controllers** — manejo de request/response
- **Services** — lógica de negocio y validaciones
- **Schemas** — validación y tipado de datos de entrada con Zod
- **Middlewares** — validación de datos, permisos por rol y acciones sensibles de administrador

---

### Decisiones técnicas

**Autenticación con JWT de doble token**

- Refresh token de **30 días** para que el usuario no tenga que iniciar sesión frecuentemente
- Access token de **15 minutos** para todas las acciones del sistema
- El payload de ambos tokens incluye el rol del usuario, lo que permite validar permisos sin consultar la base de datos en cada request
- Para acciones sensibles del administrador se emite un token de elevación de **5 minutos**

**Control de acceso por roles**

- 4 roles definidos: `purchases`, `finance`, `director`, `admin`
- Middleware de autorización con 3 niveles de acceso aplicados por dominio

**Envío de emails con Resend**

- Dominio propio configurado
- Notificaciones para: cambio de contraseña, cambio de rol con permisos dinámicos según el nuevo rol asignado, y liquidación total de facturas a directores

**Docker para entornos separados**

- Contenedor local para desarrollo completamente aislado de producción
- Scripts de npm que seleccionan automáticamente `.env.development` o `.env.production` según el entorno

**Prisma ORM**

- Prevención de SQL injections
- Manejo de migraciones sin destruir datos existentes
- Cliente tipado que refuerza la integridad del esquema en tiempo de compilación

**Seguridad adicional**

- Hasheo de contraseñas con bcrypt
- Tokens de sesión persistidos en base de datos para control de sesiones activas

---

### Lo más complejo

Los dominios de **Orders**, **Invoices** y **Payments** fueron los de mayor complejidad, ya que cada uno requiere validaciones cruzadas con múltiples modelos:

- Una orden solo puede facturarse si está en estado `received`
- Una factura solo puede pagarse si está `validated`
- Un pago no puede exceder el saldo pendiente de la factura
- Al completar el total de una factura, el sistema automáticamente cambia su estado a `paid` y notifica a todos los directores por email

---

> Diagrama de datos · Logs de decisiones · Planteamiento de modelos y endpoints → **Notion compartido**
