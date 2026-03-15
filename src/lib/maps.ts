export const openGoogleMaps = (location: string, placeId?: string) => {
    const query = encodeURIComponent(location);
    let url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    if (placeId) {
        url += `&query_place_id=${placeId}`;
    }
    window.open(url, '_blank');
};

export const openGoogleMapsDirections = (destination: string, destinationPlaceId?: string) => {
    const encodedDest = encodeURIComponent(destination);
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
    if (destinationPlaceId) {
        url += `&destination_place_id=${destinationPlaceId}`;
    }
    window.open(url, '_blank');
};
