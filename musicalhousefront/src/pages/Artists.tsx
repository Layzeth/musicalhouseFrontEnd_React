import Layout from "../layout/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import {MICROSERVICE_GATEWAY} from "../Consts.ts";
import {Artist} from "../models/Models.ts";
import {useErrorCatch} from "../utils/Callbacks.ts";
import {useSnackbar} from "notistack";
import {
    Grid,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Box,
    Container,
    CssBaseline,
} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {getTokenHeader} from "../auth.ts";

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1DB954', // Verde de Spotify
        },
        background: {
            default: '#121212', // Negro de Spotify
            paper: '#181818', // Negro de Spotify
        },
        text: {
            primary: '#FFFFFF', // Blanco
            secondary: '#B3B3B3', // Gris claro
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '50px',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: '#B3B3B3',
                },
            },
        },
    },
});

export default function Artists() {
    const [name, setName] = useState("");
    const [country, setCountry] = useState("");
    const [birthday, setBirthday] = useState("");
    const [artists, setArtists] = useState<Artist[]>([]);
    const [artistToEdit, setArtistToEdit] = useState<Artist | null>(null);
    const [loadingButtons, setLoadingButtons] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const catchError = useErrorCatch(enqueueSnackbar);

    const setArtistToUpdate = (artist: Artist) => {
        setArtistToEdit(artist);
        setName(artist.name);
        setCountry(artist.country);
        setBirthday(artist.birthday);
    };

    const resetFields = () => {
        setArtistToEdit(null);
        setName("");
        setCountry("");
        setBirthday("");
    };

    const createArtist = async () => {

        setLoadingButtons(true);
        const form = new FormData();
        form.append("name", name);
        form.append("country", country);
        form.append("birthday", birthday);

        axios.post<string>(`${MICROSERVICE_GATEWAY}/artists`, form, getTokenHeader())
            .then(response => {
                enqueueSnackbar(response.data, {variant: 'success'});
                resetFields();
                getArtists().then();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    };

    const updateArtist = async () => {
        if (!artistToEdit) return;

        setLoadingButtons(true);
        const form = new FormData();
        form.append("id", artistToEdit.id.toString());
        form.append("name", name);
        form.append("country", country);
        form.append("birthday", birthday);

        axios.put<string>(`${MICROSERVICE_GATEWAY}/artists`, form, getTokenHeader())
            .then(response => {
                enqueueSnackbar(response.data, {variant: 'success'});
                resetFields();
                getArtists().then();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    };

    const deleteArtist = async (id: number) => {
        setLoadingButtons(true);
        axios.delete<string>(`${MICROSERVICE_GATEWAY}/artists/${id}`, getTokenHeader())
            .then(response => {
                enqueueSnackbar(response.data, {variant: 'success'});
                getArtists().then();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    };

    const getArtists = async () => {
        setLoadingTable(true);
        axios.get<Artist[]>(`${MICROSERVICE_GATEWAY}/artists`, getTokenHeader())
            .then(response => {
                setArtists(response.data);
            })
            .catch(catchError)
            .finally(() => setLoadingTable(false));
    };

    useEffect(() => {
        getArtists().then();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Layout>
                <Container maxWidth="md">
                    <Typography variant="h4" align="center" gutterBottom color="textPrimary">
                        {artistToEdit ? "Edit Artist" : "Create Artist"}
                    </Typography>
                    <Box component={Paper} p={3} mb={4} bgcolor="background.paper">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={name}
                                    onChange={event => setName(event.target.value)}
                                    variant="outlined"
                                    InputLabelProps={{shrink: true}}
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Country"
                                    value={country}
                                    onChange={event => setCountry(event.target.value)}
                                    variant="outlined"
                                    InputLabelProps={{shrink: true}}
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Birthday"
                                    value={birthday}
                                    onChange={event => setBirthday(event.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    variant="outlined"
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                {artistToEdit ? (
                                    <LoadingButton
                                        loading={loadingButtons}
                                        onClick={updateArtist}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                    >
                                        Update Artist
                                    </LoadingButton>
                                ) : (
                                    <LoadingButton
                                        loading={loadingButtons}
                                        onClick={createArtist}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                    >
                                        Create Artist
                                    </LoadingButton>
                                )}
                            </Grid>
                        </Grid>
                    </Box>

                    <Typography variant="h4" align="center" gutterBottom color="textPrimary">
                        Artist List
                    </Typography>
                    {loadingTable ? (
                        <LinearProgress color="primary"/>
                    ) : (
                        <Paper>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Country</TableCell>
                                            <TableCell>Birthday</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {artists.map(artist => (
                                            <TableRow key={artist.id}>
                                                <TableCell>{artist.name}</TableCell>
                                                <TableCell>{artist.country}</TableCell>
                                                <TableCell>{artist.birthday}</TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" justifyContent="center">
                                                        <LoadingButton
                                                            loading={loadingButtons}
                                                            onClick={() => setArtistToUpdate(artist)}
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            sx={{mr: 1}}
                                                        >
                                                            Edit
                                                        </LoadingButton>
                                                        <LoadingButton
                                                            loading={loadingButtons}
                                                            onClick={() => deleteArtist(artist.id)}
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                        >
                                                            Delete
                                                        </LoadingButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Container>
            </Layout>
        </ThemeProvider>
    );
}
