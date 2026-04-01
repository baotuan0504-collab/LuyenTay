type Handler = (...args: any[]) => void


const listeners: Record<string, Handler[]> = {}


export const events = {
  on(event: string, handler: Handler) {
    if (!listeners[event]) listeners[event] = []
    listeners[event].push(handler)
    return () => this.off(event, handler)
  },
  off(event: string, handler: Handler) {
    if (!listeners[event]) return
    listeners[event] = listeners[event].filter(h => h !== handler)
  },
  emit(event: string, ...args: any[]) {
    const handlers = listeners[event]
    if (!handlers) return
    handlers.forEach(h => {
      try {
        h(...args)
      } catch (e) {
        console.error(`Event handler error for ${event}:`, e)
      }
    })
  },
}


export default events



