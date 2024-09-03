import ReactDOM from 'react-dom/client';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {SnackbarProvider} from 'notistack';
import {createBrowserRouter, RouteObject, RouterProvider} from 'react-router-dom';
import {checkToken, redirectToLogin, saveToken} from './auth';
import Artists from "./pages/Artists.tsx";
import Genres from "./pages/Genres.tsx";
import Releases from "./pages/Releases.tsx";
import Tracks from "./pages/Tracks.tsx";
import Index from "./pages/Index.tsx";

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

const router = createBrowserRouter(routerElements); // Importa tu router

const initApp = async (): Promise<void> => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Intercambia el código por un token
        const tokenUrl = 'http://localhost:9090/realms/MusicalHouse/protocol/openid-connect/token';
        const clientId = 'musical-house';
        const redirectUri = 'http://localhost:5173/';

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('client_id', clientId);

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (response.ok) {
                const data = await response.json();
                saveToken(data.access_token, data.refresh_token);
                window.history.replaceState({}, document.title, "/"); // Limpiar la URL
            } else {
                redirectToLogin();
            }
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            redirectToLogin();
        }
    } else {
        const hasToken = await checkToken();
        if (!hasToken) {
            redirectToLogin();
        }
    }

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <ThemeProvider theme={theme}>
            <SnackbarProvider
                maxSnack={6}
                autoHideDuration={4000}
                anchorOrigin={{horizontal: "right", vertical: "top"}}>
                <CssBaseline/>
                <RouterProvider router={router}/>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

initApp().then();
