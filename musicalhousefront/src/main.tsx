import {createBrowserRouter, RouteObject, RouterProvider} from "react-router-dom";
import ReactDOM from 'react-dom/client'
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Index from "./pages/Index.tsx";
import Artists from "./pages/Artists.tsx";
import Tracks from "./pages/Tracks.tsx";
import Genres from "./pages/Genres.tsx";
import Releases from "./pages/Releases.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import {SnackbarProvider} from "notistack";


const routerElements: RouteObject[] = [
    {
        path: '/',
        element: <Index/>
    },
    {
        path: '/artista',
        element: <Artists/>
    },
    {
        path: '/generos',
        element: <Genres/>
    },
    {
        path: '/lanzamientos',
        element: <Releases/>
    },
    {
        path: '/tracks',
        element: <Tracks/>
    }
];


const theme = createTheme({
    palette: {
        primary: {
            main: '#242660',
        },
        background: {
            default: '#f3f1e3'
        }
    },
})

const router = createBrowserRouter(routerElements);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={6} autoHideDuration={4000} anchorOrigin={{horizontal: "right", vertical: "top"}}>
            <CssBaseline/>
            <RouterProvider router={router}/>
        </SnackbarProvider>
    </ThemeProvider>
)
