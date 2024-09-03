import Layout from "../layout/Layout";
import { useEffect, useState } from "react";
import { Genre } from "../models/Models.ts";
import { useSnackbar } from "notistack";
import { useErrorCatch } from "../utils/Callbacks.ts";
import axios from "axios";
import { MICROSERVICE_GATEWAY } from "../Consts.ts";
import Typography from "@mui/material/Typography";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, LinearProgress } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { styled } from "@mui/system";
import {getTokenHeader} from "../auth.ts";

const CustomPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: "#121212",
    padding: theme.spacing(2),
    color: "#fff",
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomButton = styled(LoadingButton)(() => ({
    backgroundColor: "#1DB954",
    color: "#fff",
    "&:hover": {
        backgroundColor: "#1ed760",
    },
}));

export default function Genres() {
    const [name, setName] = useState("");
    const [genres, setGenres] = useState<Genre[]>([]);
    const [genreToEdit, setGenreToEdit] = useState<Genre | null>(null);
    const [loadingButtons, setLoadingButtons] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const catchError = useErrorCatch(enqueueSnackbar);

    const setGenreToUpdate = (genre: Genre) => {
        setGenreToEdit(genre);
        setName(genre.name);
    }

    const resetFields = () => {
        setGenreToEdit(null);
        setName("");
    }

    const createGenre = async () => {
        setLoadingButtons(true);
        const form = new FormData();
        form.append("name", name);

        axios.post<string>(`${MICROSERVICE_GATEWAY}/genres`, form, getTokenHeader())
            .then(response => {
                enqueueSnackbar(response.data, { variant: 'success' });
                resetFields();
                getGenres().then();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    }

    const updateGenre = async () => {
        if (!genreToEdit) return;

        setLoadingButtons(true);
        const form = new FormData();
        form.append("id", genreToEdit.id.toString())
        form.append("name", name);

        axios.put<string>(`${MICROSERVICE_GATEWAY}/genres`, form, getTokenHeader())
            .then(response => {
                enqueueSnackbar(response.data, { variant: 'success' });
                resetFields();
                getGenres().then();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    }

    const deleteGenre = async (id: number) => {
        setLoadingButtons(true);
        axios.delete<string>(`${MICROSERVICE_GATEWAY}/genres/${id}`, getTokenHeader())
            .then(response => {
                enqueueSnackbar(response.data, { variant: 'success' });
                getGenres().then();
            })
            .catch(catchError)
            .finally(() => setLoadingButtons(false));
    }

    const getGenres = async () => {
        setLoadingTable(true);
        axios.get<Genre[]>(`${MICROSERVICE_GATEWAY}/genres`, getTokenHeader())
            .then(response => {
                setGenres(response.data);
            })
            .catch(catchError)
            .finally(() => setLoadingTable(false));
    }

    useEffect(() => {
        getGenres().then();
    }, []);

    return (
        <Layout>
            <CustomPaper>
                <Typography variant="h4" gutterBottom>Manage Genres</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name"
                            variant="outlined"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            InputProps={{
                                style: { color: '#fff' },
                            }}
                            InputLabelProps={{
                                style: { color: '#fff' },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {genreToEdit ? (
                            <CustomButton
                                fullWidth
                                loading={loadingButtons}
                                onClick={updateGenre}
                                variant="contained"
                            >
                                Update
                            </CustomButton>
                        ) : (
                            <CustomButton
                                fullWidth
                                loading={loadingButtons}
                                onClick={createGenre}
                                variant="contained"
                            >
                                Create
                            </CustomButton>
                        )}
                    </Grid>
                </Grid>
            </CustomPaper>

            <Typography variant="h5" gutterBottom sx={{ mt: 5, color: '#fff' }}>Genres List</Typography>
            {loadingTable ? (
                <LinearProgress />
            ) : (
                <CustomPaper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ color: '#fff' }}>Name</TableCell>
                                    <TableCell style={{ color: '#fff' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {genres.map(genre => (
                                    <TableRow key={genre.id}>
                                        <TableCell style={{ color: '#fff' }}>{genre.name}</TableCell>
                                        <TableCell>
                                            <LoadingButton
                                                loading={loadingButtons}
                                                onClick={() => setGenreToUpdate(genre)}
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                sx={{ mr: 1 }}
                                            >
                                                Edit
                                            </LoadingButton>
                                            <LoadingButton
                                                loading={loadingButtons}
                                                onClick={() => deleteGenre(genre.id)}
                                                variant="contained"
                                                color="error"
                                                size="small"
                                            >
                                                Delete
                                            </LoadingButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomPaper>
            )}
        </Layout>
    )
}
