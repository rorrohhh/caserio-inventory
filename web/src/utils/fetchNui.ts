// Esta función detecta si estamos en el navegador o en el juego
export const isEnvBrowser = (): boolean => !(window as any).invokeNative;

export async function fetchNui<T = any>(eventName: string, data?: any, mockData?: T): Promise<T> {
    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    };

    if (isEnvBrowser() && mockData) {
        // Si estamos en el navegador (dev), devolvemos datos falsos tras un delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockData;
    }

    // Nombre del recurso (debe coincidir con el nombre de tu carpeta en resources)
    // FIX: Ajusta 'nextgen-inventory' si cambias el nombre de la carpeta
    const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'nextgen-inventory';

    const resp = await fetch(`https://${resourceName}/${eventName}`, options);

    const respFormatted = await resp.json();

    return respFormatted;
}