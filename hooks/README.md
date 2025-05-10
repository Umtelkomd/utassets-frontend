# Git Hooks para UTAssets Frontend

Este directorio contiene hooks de Git para facilitar el desarrollo y mantener estándares de calidad.

## Hooks disponibles

### `pre-commit`

Verifica antes de cada commit:

- Elimina `console.log` no deseados en archivos JavaScript
- Alerta sobre archivos sensibles que podrían contener credenciales
- Ejecuta ESLint para verificar errores de código
- Formatea automáticamente el código con Prettier

## Instalación

Para instalar los hooks, ejecuta desde la raíz del proyecto:

```bash
# Copia el hook pre-commit al directorio .git/hooks y hazlo ejecutable
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Instalación automática para todo el equipo

Para instalar los hooks automáticamente en todos los clones del repositorio, agrega al `package.json`:

```json
{
  "scripts": {
    "postinstall": "cp -f hooks/pre-commit .git/hooks/ && chmod +x .git/hooks/pre-commit"
  }
}
```

## Omitir verificaciones (no recomendado)

En caso de necesidad, puedes omitir las verificaciones con:

```bash
git commit --no-verify -m "Tu mensaje"
```

**Nota**: Esto no es recomendable y solo debe usarse en casos excepcionales. 