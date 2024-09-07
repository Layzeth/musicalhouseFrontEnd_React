import Layout from "../layout/Layout";
import {Track} from "../models/Models.ts";
import {useEffect, useState} from "react";
import axios from "axios";
import {useSnackbar} from "notistack";
import {useErrorCatch} from "../utils/Callbacks.ts";
import Typography from "@mui/material/Typography";
import {LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Card, CardContent, Chip, IconButton, Tooltip} from "@mui/material";import {MICROSERVICE_GATEWAY} from "../Consts.ts";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GetAppIcon from '@mui/icons-material/GetApp';
import {getTokenHeader} from "../auth.ts";

export default function Tracks() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loadingTracks, setLoadingTracks] = useState(false);
    const[currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const {enqueueSnackbar} = useSnackbar();
    const errorCatch = useErrorCatch(enqueueSnackbar);

    const getTracks = async () => {
        setLoadingTracks(true);
        axios.get<Track[]>(`${MICROSERVICE_GATEWAY}/tracks`, getTokenHeader())
            .then(response => setTracks(response.data))
            .catch(errorCatch)
            .finally(() => setLoadingTracks(false));
    }

    const playTrack = (track: Track) => {

        if(currentAudio) {
            currentAudio.pause();
        }
        const url = `${MICROSERVICE_GATEWAY}/tracksInformation/reproduce/${track.fileIdentifier}`;
        const audio = new Audio(url);
        audio.play().then();
        setCurrentAudio(audio);
        
    }

    const downloadTrack = (track: Track) => {
        const url = `${MICROSERVICE_GATEWAY}/tracksInformation/download/${track.fileIdentifier}`;
        window.open(url, '_blank');
    }

    const likeTrack = (track: Track) => {
        axios.put(`${MICROSERVICE_GATEWAY}/tracksInformation/like/${track.fileIdentifier}`, getTokenHeader())
            .then(() => getTracks())
            .catch(errorCatch);
    }

    const dislikeTrack = (track: Track) => {
        axios.put(`${MICROSERVICE_GATEWAY}/tracksInformation/dislike/${track.fileIdentifier}`, getTokenHeader())
            .then(() => getTracks())
            .catch(errorCatch);
    }

    useEffect(() => {
        getTracks().then();
    }, [])

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Tracks</Typography>
            {loadingTracks ? (
                <LinearProgress />
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Genre</TableCell>
                                <TableCell>Contributors</TableCell>
                                <TableCell>Information</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tracks.map(track => (
                                <TableRow key={track.id} hover>
                                    <TableCell>{track.name}</TableCell>
                                    <TableCell>
                                        <Chip label={track.genre.name} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {track.contributors.map(contributor => (
                                            <Chip key={contributor.id} label={contributor.name} size="small" style={{margin: '2px'}} />
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <InfoTrack track={track} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Play">
                                            <IconButton onClick={() => playTrack(track)} color="primary">
                                                <PlayArrowIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download">
                                            <IconButton onClick={() => downloadTrack(track)} color="secondary">
                                                <GetAppIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Like">
                                            <IconButton onClick={() => likeTrack(track)}>
                                                <span>👍</span>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Dislike">
                                            <IconButton onClick={() => dislikeTrack(track)}>
                                                <span>👎</span>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Layout>
    );
}

interface TrackInformation {
    fileIdentifier: string;
    //reproductionCount: number;
    likeCount: number;
    dislikeCount: number;
    //downloadCount: number;
}

function InfoTrack({track}: { track: Track }) {
    const [information, setInformation] = useState<TrackInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const {enqueueSnackbar} = useSnackbar();
    const errorCatch = useErrorCatch(enqueueSnackbar);

    const getInformation = async () => {
        setLoading(true);
        axios.get<TrackInformation>(`${MICROSERVICE_GATEWAY}/tracksInformation/info/${track.fileIdentifier}`, getTokenHeader())
            .then(response => setInformation(response.data))
            .catch(errorCatch)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        getInformation().then();
    }, [track.fileIdentifier]);

    if (loading) {
        return <Box sx={{display: 'flex', justifyContent: 'center'}}><LinearProgress /></Box>;
    }

    if (!information) {
        return <Typography color="text.secondary">No information available</Typography>;
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle2" gutterBottom>Track Stats</Typography>
                <Box display="flex" justifyContent="space-between">
                    <Tooltip title="Reproductions">
                        <Chip icon={<PlayArrowIcon />} label={track.reproductionCount} size="small" />
                    </Tooltip>
                    <Tooltip title="Likes">
                        <Chip icon={<span>👍</span>} label={information.likeCount} size="small" />
                    </Tooltip>
                    <Tooltip title="Dislikes">
                        <Chip icon={<span>👎</span>} label={information.dislikeCount} size="small" />
                    </Tooltip>
                    <Tooltip title="Downloads">
                        <Chip icon={<GetAppIcon />} label={track.downloadCount} size="small" />
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
}