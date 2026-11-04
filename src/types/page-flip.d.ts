// Tipos mínimos da StPageFlip, que não publica declarações no pacote
declare module 'page-flip' {
  type FlipCorner = 'top' | 'bottom'

  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>)
    loadFromHTML(items: HTMLElement[]): void
    on(event: 'flip' | 'changeState' | 'init', callback: (event: { data: unknown }) => void): PageFlip
    flipNext(corner?: FlipCorner): void
    flipPrev(corner?: FlipCorner): void
    flip(page: number, corner?: FlipCorner): void
    getCurrentPageIndex(): number
    destroy(): void
  }
}
