import React, {useState} from 'react';
import './Upload.scss';
import {Box, Button, SxProps, Theme} from '@mui/material';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import UploadWindow from "./UploadWindow";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import Typography from "@mui/material/Typography";

/**
 * Consists of general settings for upload component
 * functionalities and call back methods evoked
 * for specific interactions
 */
interface CMRUploadProps{
    //Determines if the upload buttons should retain the uploaded
    //file after upload, or if it should refresh for a new session
    retains?:boolean;
    maxCount: number;
    onRemove?:(removedFile: File)=>void;
    /**
     * Allows access to file content prior to uploading.
     * If returned value from the method is false,
     * prevents the file upload process. Called before
     * create payload.
     * @param file
     */
    beforeUpload?: (file:File)=>Promise<boolean>;
    createPayload: (file: File,fileAlias:string, fileDatabase: string)=>
        (Promise<{destination: string, formData:FormData, config: AxiosRequestConfig}|undefined>);
    onUploadProgressUpdate?:(loaded: number, total: number)=>void|undefined;
    onUploaded: (res: AxiosResponse, file: File)=>void;
    /**
     * Displays button showing the uploaded file if this field is set
     */
    uploadedFile?: string;
    sx?:  SxProps<Theme>|undefined;
    rest?: any;
}


const CmrUpload = (props: CMRUploadProps) => {

    let [open, setOpen] = useState(false);
    /**
     * Life cycle representing the current status of the upload
     * process.
     */
    let [uploading, setUploading] = useState(false);
    let [progress, setProgress] = useState(0);
    let [uploadedFile, setUploadedFile] = useState<string|undefined>(props.uploadedFile);
    const upload= async (file: File, fileAlias:string, fileDatabase: string)=>{
        setUploading(true);
        let status = 0;
        try {
            if(props.beforeUpload!=undefined&&!await props.beforeUpload(file)){
                setUploading(false);
                return 200;
            }
            let payload = await props.createPayload(file, fileAlias, fileDatabase);
            if(payload==undefined)
                return 0;
            payload.config.onUploadProgress = (progressEvent) => {
                console.log(progressEvent.loaded);
                const percentage = (progressEvent.loaded * 100) / progressEvent.total;
                setProgress(+percentage.toFixed(2));
            };
            const res = await axios.post(payload.destination, payload.formData, payload.config);
            status = res.status;
            if(status===200){
                props.onUploaded(res,file);
                setUploadedFile(file.name);
            }
        } catch (err) {
            console.log('Upload mask file error: ', err);
            status = err;
            setOpen(true);
            throw(err);
        } finally {
            setUploading(false);
        }
        return status;
    }

    function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth:'100pt', marginRight:'10pt'}}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                        props.value,
                    )}%`}</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <React.Fragment>
            {(!uploading)?

                <Button variant={(uploadedFile==undefined)?"contained":"outlined"}
                        onClick={()=>{
                            setOpen(true);
                        }}
                        sx={props.sx}>
                    {(uploadedFile==undefined)?"Upload":uploadedFile}
                </Button>
            :
                <LinearProgressWithLabel value={progress} />}
            <UploadWindow open={open} setOpen={setOpen} upload={upload}/>
        </React.Fragment>
    );
};

export type {CMRUploadProps};
export default CmrUpload;
