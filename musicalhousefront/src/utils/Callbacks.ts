import {EnqueueSnackbar, OptionsWithExtraProps, VariantType} from "notistack";
import {isAxiosError} from "axios";


export interface ErrorResponse {
    error: string;
    status: number;
    timestamp: string;
}

export const useErrorCatch = (enqueueSnackbar: EnqueueSnackbar) => (error: object | string) => {

    console.log("Error: ", error)

    if (typeof error === "string") {
        enqueueSnackbar(error, {variant: 'warning'});
        return;
    }

    const options: OptionsWithExtraProps<VariantType> = {variant: 'error'};

    function enqueueSnackbarMessage(data: ErrorResponse | ErrorResponse[]) {
        if (Array.isArray(data)) {
            data.forEach((errorResponse: ErrorResponse) => {
                enqueueSnackbar(errorResponse.error, options);
            });
        } else {
            enqueueSnackbar(data.error, options);
        }
    }

    if (isAxiosError(error)) {
        const response = error.response;
        if (!response) {
            console.log("Error: ", error)
            enqueueSnackbar("Error de conexion", options);
            return;
        }

        const errorResponse: ErrorResponse | ErrorResponse[] | undefined = response.data;

        if (errorResponse) {
            enqueueSnackbarMessage(errorResponse);
            return;
        } else {
            enqueueSnackbar(error.message, options);
        }
    } else {
        console.log("Error: ", error)
        enqueueSnackbar("Error de conexion", options);
    }
}
	
