# 🌍 GeoSpatial Dashboard - Frontend

Dashboard de análisis geoespacial desarrollado con Next.js 16, implementando **patrones de diseño SOLID** y **Atomic Design**.

## 🎯 Patrones Implementados

### 1. **Atomic Design**
```
src/components/
├── atoms/          # Componentes básicos (Button, Input, Label)
├── molecules/      # Combinación de átomos (InputField, CheckboxField)  
├── organisms/      # Funcionalidades complejas (LoginForm, DashboardStats)
└── templates/      # Layouts (AuthLayout, DashboardLayout)
```

### 2. **SOLID Principles**

- **S** - Single Responsibility: Cada componente tiene una responsabilidad específica
- **O** - Open/Closed: Extensible mediante props sin modificar la implementación
- **L** - Liskov Substitution: Interfaces intercambiables
- **I** - Interface Segregation: Interfaces específicas y enfocadas
- **D** - Dependency Inversion: Dependencia de abstracciones (Context, Hooks)

### 3. **Custom Hook Pattern**
- `useAuth()` - Manejo de autenticación
- `useFormWithValidation()` - Wrapper de react-hook-form con Zod
- `useLocalStorage()` - Persistencia local segura

### 4. **Provider Pattern**
- `AuthProvider` - Estado global de autenticación
- Context API para compartir estado

### 5. **Repository Pattern** (Simulado)
- Abstracción de la capa de datos en el AuthContext

## 🚀 Tecnologías

- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: Tailwind CSS 4.0
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios con interceptors
- **State Management**: TanStack Query + React Context
- **Auth**: JWT con refresh automático
- **TypeScript**: Tipado estricto
- **Patterns**: Atomic Design + SOLID + Repository Pattern

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── auth/              # Página de login/registro
│   ├── dashboard/         # Página de dashboard  
│   ├── layout.tsx         # Layout principal con providers
│   └── page.tsx           # Redirección inteligente
├── components/            # Componentes organizados por Atomic Design
│   ├── atoms/            # Button, Input, Label
│   ├── molecules/        # InputField, CheckboxField
│   ├── organisms/        # LoginForm, RegisterForm, DashboardStats
│   └── templates/        # AuthLayout, DashboardLayout
├── context/              # Contextos de React (AuthContext)
├── hooks/                # Custom hooks reutilizables + TanStack Query
├── services/             # Servicios HTTP con Axios (Repository Pattern)
├── lib/                  # Utilidades y schemas de validación
└── types/                # Definiciones de TypeScript
```

## 🔐 Autenticación

**Conectado a backend real con JWT:**

La aplicación está configurada para conectarse a tu backend usando:
- **Login**: `POST /auth/login`
- **Registro**: `POST /auth/register`

### Configuración del Backend:
1. Asegúrate de que tu backend esté corriendo en el puerto configurado
2. Por defecto busca el backend en: `http://localhost:8000`
3. Puedes cambiar la URL en el archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Funcionalidades implementadas:
- ✅ **Login** con validación y JWT
- ✅ **Registro** con validación de contraseñas
- ✅ **Persistencia de sesión** (Remember me)
- ✅ **Token automático** en headers
- ✅ **Interceptors** para manejo de errores
- ✅ **TanStack Query** para cache inteligente
- ✅ **Logout** con limpieza de datos
- ✅ **Validación en tiempo real** con Zod

## 🎨 Componentes Destacados

### Átomos (Básicos y Reutilizables)
```tsx
<Button variant="primary" size="lg" isLoading={loading}>
  Iniciar Sesión
</Button>

<Input 
  variant="default" 
  icon={<EmailIcon />} 
  placeholder="tu@email.com" 
/>
```

### Moléculas (Composición de Átomos)
```tsx
<InputField
  label="Email"
  required
  error={getFieldError('email')}
  {...register('email')}
/>
```

### Organismos (Funcionalidades Complejas)
```tsx
<LoginForm 
  onSuccess={handleLoginSuccess}
  onError={handleLoginError}
/>
```

## 🔧 Instalación y Uso

### Prerrequisitos
```bash
Node.js 18+ 
npm o yarn
Token gratuito de Mapbox (ver MAPBOX_SETUP.md)
```

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# ⚠️ IMPORTANTE: Añadir tu token de Mapbox en .env.local
```

### Configuración de Mapbox
1. **Obtener token gratuito:** Ve a [account.mapbox.com](https://account.mapbox.com)
2. **Configurar:** Añade tu token en `.env.local`:
```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.tu_token_aqui
```
3. **Detalles completos:** Ver [MAPBOX_SETUP.md](./MAPBOX_SETUP.md)

### Ejecutar
```bash
# Desarrollar
npm run dev

# La aplicación estará disponible en:
http://localhost:3000 (o puerto disponible)
```

## ✨ Características Técnicas

### Servicios HTTP con Axios
```tsx
// Configuración centralizada con interceptors
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000
});

// Auto-inyección de token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### TanStack Query para Cache Inteligente
```tsx
const loginMutation = useMutation({
  mutationFn: (credentials) => AuthService.login(credentials),
  onSuccess: (data) => {
    localStorage.setItem('auth_token', data.accessToken);
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  }
});
```

### Validación con Zod
```tsx
const loginSchema = z.object({
  email: z.string().email('Email válido requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rememberMe: z.boolean().optional()
});
```

### Repository Pattern para Servicios
```tsx
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }
}
```

### Custom Hook para Formularios
```tsx
const { register, getFieldError, isSubmitting } = useFormWithValidation({
  schema: loginSchema
});
```

### Gestión de Estado con useReducer + TanStack Query
```tsx
const [state, dispatch] = useReducer(authReducer, initialState);
const loginMutation = useLoginMutation();
```

### Utilities Funcionales
```tsx
// Combinación de clases CSS
const className = cn(baseClasses, variants[variant], sizes[size]);

// Storage seguro con error handling
secureStorageSet('auth_user', user);
const user = secureStorageGet<User>('auth_user');
```

## 🎯 Beneficios del Diseño

1. **Escalabilidad**: Arquitectura modular y componible
2. **Mantenibilidad**: Separación clara de responsabilidades
3. **Reutilización**: Componentes atómicos reutilizables
4. **Testing**: Componentes aislados fáciles de testear
5. **TypeSafety**: Tipado estricto en toda la aplicación
6. **Performance**: Optimizaciones de React y Next.js
7. **Accesibilidad**: Componentes semánticamente correctos
8. **UX**: Feedback visual, estados de loading, validaciones

## 📊 Dashboard Features

- 📈 **Métricas en tiempo real** - Estadísticas clave
- ⚡ **Acciones rápidas** - Flujos principales
- 📝 **Actividad reciente** - Log de eventos  
- 🎛️ **Sidebar navegable** - Menú colapsible
- 👤 **Perfil de usuario** - Info y logout
- 🔄 **Estado reactivo** - Actualizaciones automáticas

## 🌟 Próximos Pasos Sugeridos

1. **Testing**: Implementar tests unitarios con Jest + RTL
2. **API Integration**: Conectar con backend real
3. **Error Boundaries**: Manejo de errores React
4. **SEO**: Meta tags y optimizaciones Next.js  
5. **Performance**: Lazy loading, code splitting
6. **PWA**: Service workers y offline support
7. **Theming**: Sistema de temas dinámico
8. **I18n**: Internacionalización

---

**Desarrollado con ❤️ aplicando principios SOLID y Clean Architecture**
