import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {ArtTrack, Home, LibraryMusic, Mic, MusicNote} from "@mui/icons-material";
import {Link} from "react-router-dom";
import { styled } from '@mui/material/styles';

interface ListPage {
    icon: JSX.Element;
    name: string;
    path: string;
    subMenu?: SubMenu[];
}

interface SubMenu {
    name: string;
    path: string;
}

const StyledLink = styled(Link)({
    textDecoration: 'none',
    color: 'white',
    '&:hover': {
        color: 'green',
    },
});

export const list: ListPage[] = [
    {
        icon: <Home/>,
        name: "Incio",
        path: "/"
    },
    {
        icon: <Mic/>,
        name: "Artista",
        path: "/artista",
    },
    {
        icon: <LibraryMusic/>,
        name: "Géneros",
        path: "/generos",
    },
    {
        icon: <MusicNote/>,
        name: "Lanzamientos",
        path: "/lanzamientos",
    },
    {
        icon: <ArtTrack/>,
        name: "Tracks",
        path: "/tracks",
    }
]

export const mainListItems = list.map((item, index) => (
    <StyledLink to={item.path} key={item.name}>
        <ListItemButton key={index + "item"}>
            <ListItemIcon>
                {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name}/>
        </ListItemButton>
    </StyledLink>
));
