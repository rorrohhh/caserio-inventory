/**
 * Wrapper simple para llamar a NUI callbacks.
 */
export async function fetchNui<T = any>(eventName: string, data?: any, mockData?: T): Promise<T> {
    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    };

    // 1. Obtenemos el nombre del recurso
    const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'nui-frame-app';

    // 2. DETECCIÓN INTELIGENTE:
    // Si no existe la función 'invokeNative' en window, significa que estamos en Chrome/Firefox (Desarrollo)
    // y no dentro de FiveM.
    const isBrowser = !(window as any).invokeNative;

    // Si estamos en navegador y pasamos datos de prueba (mockData), los devolvemos simulando carga.
    if (isBrowser && mockData) {
        console.log(`[Browser Mock] Evento: ${eventName}`, data);
        return new Promise((resolve) => setTimeout(() => resolve(mockData), 500));
    }

    try {
        const resp = await fetch(`https://${resourceName}/${eventName}`, options);
        const respFormatted = await resp.json();
        return respFormatted;
    } catch (error) {
        // Esto evita que la UI se rompa si el script de Lua no responde o hay error de red
        // console.error(`Error en fetchNui para ${eventName}:`, error);
        throw error;
    }
}