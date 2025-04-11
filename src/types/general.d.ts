export interface StateData {
    id:  number;
    name: string;
    date_added: string;
    country: number;
}
export interface stateLocationsData {
    id:  number;
    name: string;
    state: number;
}

export interface StateDataResponse {
    data: StateData[]
}


export interface StateLocationsResponse{
    data: stateLocationsData[]
}