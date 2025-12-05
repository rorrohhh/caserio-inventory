// Detecta si estamos en el navegador o en el juego
export const isEnvBrowser = (): boolean => !(window as any).invokeNative;
