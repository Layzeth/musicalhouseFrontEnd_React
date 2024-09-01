import Layout from "../layout/Layout";
import {Autocomplete} from '@mui/material';
import {Artist, Genre, Release, ReleaseType, TrackMetadata} from "../models/Models.ts";
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {useErrorCatch} from "../utils/Callbacks.ts";
import {MICROSERVICE_GATEWAY} from "../Consts.ts";
import axios from "axios";
import Typography from "@mui/material/Typography";
import {Card, CardContent, CardHeader, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select, TextField, Box, Divider, Button} from "@mui/material";
import {LoadingButton} from "@mui/lab";


export interface MapFileToTrackMetadata {
    file: File;
    trackMetadata: TrackMetadata;
}

export default function Releases() {
    const [name, setName] = useState("");
    const [type, setType] = useState<ReleaseType>(ReleaseType.UNKNOWN);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [artistId, setArtistId] = useState(0);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [tracksFiles, setTracksFiles] = useState<File[]>([]);
    const [releases, setReleases] = useState<Release[]>([]);
    const [tracksMetadata, setTracksMetadata] = useState<MapFileToTrackMetadata[]>([]);
    const [loadingButtons, setLoadingButtons] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const catchError = useErrorCatch(enqueueSnackbar);

    const resetFields = () => {
        setName("");
        setType(ReleaseType.UNKNOWN);
        setArtistId(0);
        setTracksFiles([]);
        setTracksMetadata([]);
    }

    const getArtists = async () => {
        setLoadingTable(true);
        axios.get<Artist[]>(`${MICROSERVICE_GATEWAY}/artists`)
            .then(response => setArtists(response.data))
            .catch(catchError)
            .finally(() => setLoadingTable(false));
    }

    const getGenres = async () => {
        setLoadingTable(true);
        axios.get<Genre[]>(`${MICROSERVICE_GATEWAY}/genres`)
            .then(response => setGenres(response.data))
            .catch(catchError)
            .finally(() => setLoadingTable(false));
    }

    const getReleases = async () => {
        setLoadingTable(true);
        axios.get<Release[]>(`${MICROSERVICE_GATEWAY}/releases`)
            .then(response => setReleases(response.data))
            .catch(catchError)
            .finally(() => setLoadingTable(false));
    }

    const createRelease = async () => {
        setLoadingButtons(true);
        const form = new FormData();
        form.append("name", name);
        form.append("type", type);
        form.append("artistId", artistId.toString());
        tracksFiles.forEach(file => form.append("tracksFiles", file));

        form.append('tracksMetadata', new Blob([JSON.stringify(tracksMetadata.map(metadata => metadata.trackMetadata))], {
            type: "application/json"
        }));

        console.log("form", form);

        axios.post<string>(`${MICROSERVICE_GATEWAY}/releases`, form)
            .then(response => {
                enqueueSnackbar(response.data, {variant: 'success'});
                resetFields();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    }

    useEffect(() => {
        getArtists().then();
        getGenres().then();
        getReleases().then();
    }, [])

    useEffect(() => {
        setTracksMetadata(tracksFiles.map(file => ({
            file,
            trackMetadata: {
                name: "",
                genreId: 0,
                fileIdentifier: "",
                contributorsId: []
            }
        })))
    }, [tracksFiles]);

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Create New Release</Typography>
            <Card elevation={3} sx={{ mb: 5, p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Release Type</InputLabel>
                            <Select
                                value={type}
                                label="Release Type"
                                onChange={(e) => setType(e.target.value as ReleaseType)}
                            >
                                {Object.values(ReleaseType).map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Artist</InputLabel>
                            <Select
                                value={artistId}
                                label="Artist"
                                onChange={(e) => setArtistId(e.target.value as number)}
                            >
                                {artists.map((artist) => (
                                    <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ height: '56px', textTransform: 'none' }}
                        >
                            Upload Tracks
                            <input
                                type="file"
                                hidden
                                multiple
                                onChange={(e) => {
                                    const filelist = e.target.files;
                                    if (!filelist) return;
                                    const file: File[] = Array.from(filelist);
                                    setTracksFiles([...tracksFiles, ...file]);
                                }}
                            />
                        </Button>
                    </Grid>
                </Grid>

                {tracksMetadata.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>Track Metadata</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {tracksMetadata.map((metadata, index) => (
                            <Card key={`file${index}`} sx={{ mb: 2, p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Metadata for {metadata.file.name}</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Track Name"
                                            value={metadata.trackMetadata.name}
                                            onChange={(e) => {
                                                const newTracksMetadata = [...tracksMetadata];
                                                newTracksMetadata[index].trackMetadata.name = e.target.value;
                                                setTracksMetadata(newTracksMetadata);
                                            }}
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Genre</InputLabel>
                                            <Select
                                                value={metadata.trackMetadata.genreId}
                                                label="Genre"
                                                onChange={(e) => {
                                                    const newTracksMetadata = [...tracksMetadata];
                                                    newTracksMetadata[index].trackMetadata.genreId = e.target.value as number;
                                                    setTracksMetadata(newTracksMetadata);
                                                }}
                                            >
                                                {genres.map((genre) => (
                                                    <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>
                                                ))}
                                            </Select>

                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            multiple
                                            options={artists.filter(artist => artist.id !== artistId)}
                                            getOptionLabel={(option) => option.name}
                                            onChange={(_, newValue) => {
                                                const newTracksMetadata = [...tracksMetadata];
                                                newTracksMetadata[index].trackMetadata.contributorsId = newValue.map(artist => artist.id)
                                                setTracksMetadata(newTracksMetadata);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    label="Collaborators"
                                                    placeholder="Select collaborators"
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                        />
                                    </Grid>
                                </Grid>
                            </Card>
                        ))}
                    </Box>
                )}

                <Box sx={{ mt: 3 }}>
                    <LoadingButton
                        loading={loadingButtons}
                        onClick={createRelease}
                        variant="contained"
                        sx={{ minWidth: '150px' }}
                    >
                        Create Release
                    </LoadingButton>
                </Box>
            </Card>

            <Typography variant="h5" gutterBottom>Releases List</Typography>
            {loadingTable ? (
                <LinearProgress />
            ) : (
                <Grid container spacing={3}>
                    {releases.map(release => (
                        <Grid item xs={12} sm={6} md={4} key={release.id + "release"}>
                            <Card elevation={2}>
                                <CardHeader
                                    title={release.name}
                                    subheader={`${release.type} by ${release.artist.name}`}
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Release Date: {release.releaseDate}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Tracks: {release.tracks.length}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    {release.tracks.map((track, index) => (
                                        <Typography key={track.id + "track"} variant="body2">
                                            {index + 1}. {track.name}
                                        </Typography>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Layout>
    )
}