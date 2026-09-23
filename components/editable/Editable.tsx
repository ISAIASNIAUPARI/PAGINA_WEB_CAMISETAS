'use client'

import React, { createContext, useContext } from 'react'

import { useEditOptional } from '@/components/admin/EditProvider'
import { useIsMobileView } from '@/components/admin/useIsMobileView'
import { SplitText } from '@/components/motion'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import type { ImageRef, TextStyles } from '@/lib/types'

import { EditableImage } from './EditableImage'
import { EditableText } from './EditableText'

/**
 * Adaptadores entre las secciones de LAMS y la capa de edición del protocolo
 * (EditableText / EditableImage de la Fase E):
 *
 *  · En el sitio público no montan nada del admin: renderizan el HTML de
 *    siempre, con las animaciones (titulares por palabras) y los overrides de
 *    color/tamaño/grosor que el cliente haya guardado.
 *  · En /admin (dentro de <EditProvider>) el texto se SELECCIONA y se edita en
 *    el sidebar, igual que en La Gloria.
 */

/** true solo dentro del panel /admin. */
export function useEditMode() {
  return !!useEditOptional()
}

type Scope = { styles: TextStyles; patch?: (next: TextStyles) => void }
const StylesScope = createContext<Scope>({ styles: {} })

/** Envuelve una sección: los <Txt k="…"> de adentro guardan su estilo aquí. */
export function TextStylesScope({ styles, patch, children }: { styles: TextStyles; patch?: (next: TextStyles) => void; children: React.ReactNode }) {
  return <StylesScope.Provider value={{ styles, patch }}>{children}</StylesScope.Provider>
}

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span' | 'strong'

export function Txt({
  k,
  value,
  onChange,
  as = 'span',
  className,
  split,
  delay,
  label,
}: {
  /** Clave estable del texto: con ella se guardan su color/tamaño/grosor. */
  k: string
  value: string
  onChange?: (v: string) => void
  as?: Tag | 'em'
  className?: string
  split?: boolean
  delay?: number
  label?: string
}) {
  const edit = useEditMode()
  const { styles, patch } = useContext(StylesScope)
  const isMobile = useIsMobileView()
  const tag = (as === 'em' ? 'span' : as) as Tag
  const cls = as === 'em' ? `${className ?? ''} italic` : className

  if (edit && onChange) {
    const color = textColorProps(styles.textColors, (tc) => patch?.({ ...styles, textColors: tc }))(k)
    const sizeWeight = textSizeProps(styles.textSizes, styles.textWeights, (next) => patch?.({ ...styles, ...next }))(k)
    return (
      <EditableText
        as={tag}
        edit
        value={value}
        onChange={onChange}
        className={cls}
        stopClickNavigation
        {...(patch ? color : {})}
        {...(patch ? sizeWeight : {})}
        label={label ?? color.label}
      />
    )
  }

  const c = styles.textColors?.[k]
  const size = isMobile ? styles.textSizes?.[k]?.m : styles.textSizes?.[k]?.d
  const w = styles.textWeights?.[k]
  const style: React.CSSProperties | undefined =
    c || size || w ? { ...(c ? { color: `var(--color-${c})` } : null), ...(size ? { fontSize: size } : null), ...(w ? { fontWeight: w } : null) } : undefined

  return React.createElement(tag, { className: cls, style }, split && !edit ? <SplitText text={value} delay={delay} /> : value)
}

/** Imagen: <img> normal en el sitio; seleccionable (cambiar + punto focal) en /admin. */
export function Img({
  image,
  onChange,
  className,
  imgClassName,
  aspectRatio = 3 / 4,
  eager,
}: {
  image: ImageRef
  onChange?: (next: ImageRef) => void
  className?: string
  imgClassName?: string
  aspectRatio?: number
  eager?: boolean
}) {
  const edit = useEditMode()
  const pos = image.focalX != null && image.focalY != null ? `${image.focalX}% ${image.focalY}%` : undefined
  if (edit && onChange) {
    return (
      <EditableImage
        edit
        fill
        src={image.url}
        alt={image.alt}
        className={className}
        imgClassName={imgClassName}
        aspectRatio={aspectRatio}
        focalX={image.focalX}
        focalY={image.focalY}
        onChange={(url) => onChange({ ...image, url })}
        onFocalChange={(x, y) => onChange({ ...image, focalX: x, focalY: y })}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={image.alt ?? ''}
      className={imgClassName}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={pos ? { objectPosition: pos } : undefined}
    />
  )
}

/**
 * Zona seleccionable genérica (enlaces de redes, datos de un producto…):
 * en /admin un clic abre sus controles en el sidebar. En el sitio no existe.
 */
export { SelectArea } from './SelectArea'
