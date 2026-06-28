export async function fetchIconSvg(iconName: string): Promise<string> {
  const [provider, name] = iconName.split(':')
  const url = provider && name
    ? `https://api.iconify.design/${provider}/${name}.svg`
    : `https://api.iconify.design/${iconName}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error('图标不存在')
  return await res.text()
}

export async function searchIcons(query: string): Promise<{ icons: string[]; status: string; count: number }> {
  if (!query.trim()) {
    return { icons: [], status: '', count: 0 }
  }
  try {
    const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=30`)
    const data = await res.json()
    const icons: string[] = data.icons || []
    const status = icons.length === 0 ? '无结果' : `找到 ${icons.length} 个图标`
    return { icons, status, count: icons.length }
  } catch {
    return { icons: [], status: '搜索出错', count: 0 }
  }
}

export function getSearchIconUrl(iconName: string): string {
  return `https://api.iconify.design/${iconName}.svg`
}

export function applyColorToSvg(svgString: string, color: string): string {
  if (!color || !svgString) return svgString
  try {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.documentElement
    if (svgElement.tagName !== 'svg') return svgString

    function setFillRecursive(element: Element) {
      if (element.tagName === 'defs' || element.tagName === 'style' || element.tagName === 'script') return
      const fill = element.getAttribute('fill')
      if (fill !== null && fill !== 'none') {
        element.setAttribute('fill', color)
      }
      for (let i = 0; i < element.children.length; i++) {
        setFillRecursive(element.children[i])
      }
    }
    setFillRecursive(svgElement)

    const serializer = new XMLSerializer()
    return serializer.serializeToString(svgElement)
  } catch {
    return svgString
  }
}
