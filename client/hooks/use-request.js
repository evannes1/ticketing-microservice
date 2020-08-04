import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors]=useState(null);

    const doRequest=async (props={}) => {
        try {
            console.log("IN doRequest....");
            console.log("URL: ", url);
            console.log("Method: ", method);
            console.log("Req body: ", body);
            // re-set errors
            setErrors(null);
            // use object lookup on axios object using the method parameter, to retrieve
            //  the correct method to invoke; should be "get" or "post" or "delete"
            // so axios[get] will return the "get" function.
            const response=await axios[method](url, { ...body, ...props });

            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oooops....</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map(err => <li key={err.message}>{err.message}</li>)}
                    </ul>
                </div>
            );
        }

    };

    return { doRequest, errors };
}