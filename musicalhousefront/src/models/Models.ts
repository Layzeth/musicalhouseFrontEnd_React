export interface Artist {
    id: number;
    name: string;
    country: string;
    birthday: string;
}

export interface Genre {
    id: number;
    name: string;

}

export interface Track {
    id: number;
    name: string;
    fileIdentifier: string;
    genre: Genre;
    contributors: Artist[];
}

export enum ReleaseType {
    ALBUM = "ALBUM",
    SINGLE = "SINGLE",
    EP = "EP",
    COMPILATION = "COMPILATION",
    MIXTAPE = "MIXTAPE",
    BOOTLEG = "BOOTLEG",
    INTERVIEW = "INTERVIEW",
    LIVE = "LIVE",
    SOUNDTRACK = "SOUNDTRACK",
    UNKNOWN = "UNKNOWN"
}

export interface Release {
    id: number;
    name: string;
    type: ReleaseType;
    releaseDate: string;
    artist: Artist;
    tracks: Track[];
}

export interface TrackMetadata {
    name: string;
    genreId: number;
    fileIdentifier: string;
    contributorsId: number[];
}