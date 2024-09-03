import {jwtDecode} from 'jwt-decode';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const clientId = 'musical-house';

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getTokenHeader = () => {
    return {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    }
}

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const saveToken = (token: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};


interface JwtPayload {
    exp: number; // Tiempo de expiración en segundos desde Epoch
}

export const checkToken = async (): Promise<boolean> => {

    console.log("checkToken")

    const token = getToken();
    const refreshToken = getRefreshToken();

    if (token) {
        console.log("token exists")
        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp > currentTime) {
                console.log("token has not expired")
                return true;
            } else if (refreshToken) {
                console.log("token has expired, refreshing")
                return await refreshAccessToken(refreshToken);
            } else {
                console.log("token has expired, no refresh token")
                clearToken();
                return false;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            clearToken();
            return false;
        }
    } else if (refreshToken) {
        console.log("no token, refreshing")
        return await refreshAccessToken(refreshToken);
    } else {
        console.log("no token or refresh token")
        return false;
    }
};

export const refreshAccessToken = async (refreshToken: string) => {
    //const redirectUri = encodeURIComponent('http://localhost:5173/');
    const tokenUrl = 'http://localhost:9090/realms/MusicalHouse/protocol/openid-connect/token';

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
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
            return true;
        } else {
            clearToken();
            return false;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearToken();
        return false;
    }
};

export const redirectToLogin = () => {
    const redirectUri = encodeURIComponent('http://localhost:5173/');
    window.location.href = `http://localhost:9090/realms/MusicalHouse/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
};

export const logout = (): void => {
    const redirectUri = encodeURIComponent('http://localhost:5173/');
    const logoutUrl = `http://localhost:9090/realms/MusicalHouse/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;
    clearToken();
    window.location.href = logoutUrl;
};
