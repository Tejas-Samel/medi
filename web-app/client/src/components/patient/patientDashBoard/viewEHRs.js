import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from '../../genericFiles/Title';
import axios from "axios";
import {ADDRESS} from "../../genericFiles/constants";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import PropTypes from 'prop-types';
import SpinnerDialog from "../../genericFiles/SpinnerDialog";


const useStyles = makeStyles((theme) => ({
    seeMore: {
        marginTop: theme.spacing(3),
    },
}));

function SimpleDialog(props) {
    const {onClose, imageURL, open} = props;

    const handleClose = () => {
        onClose(imageURL);
    };
    return (
        <Dialog onClose={handleClose} scroll={"body"} aria-labelledby="simple-dialog-title" open={open}>
            <img src={imageURL} alt=""
                 width="100%" height="60%"/>
        </Dialog>
    );
}

SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    imageURL: PropTypes.string.isRequired,
};

export default function ViewEHRs(props) {
    const classes = useStyles();
    const [updatedData, setUpdatedData] = React.useState(JSON.parse(props.data));
    const [loaded, setLoaded] = React.useState(false);
    const [ehrsDetail, setEHRsDetail] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [imageURL, setImageURL] = React.useState('');
    useEffect(() => {
        const fetchEHRsData = async () => {
            setLoaded(true);
            try {
                let patientSchema = {
                    patientId: updatedData.userName,
                    sessionKey: updatedData.sessionKey,
                    listType: 'ehrs',
                    ehrs: updatedData.ehrs
                };
                let response = await axios.post(ADDRESS + `readPatientDocuments`, patientSchema);
                response = response.data;
                if (response.length) {
                    setEHRsDetail(response);
                }
            } catch (e) {
                console.log(e);
            }
            setLoaded(false);
        };
        fetchEHRsData();
    }, []);

    async function displayEHR(values) {
        console.log(values);
        console.log("here");
        setLoaded(true);
        try {
            let fileSchema = {
                documentId: values.ehrId,
                type: 'EHR',
                patientId: values.patientId,
            };
            await axios.post(ADDRESS + `fetchFileFromDatabase`, fileSchema, {responseType: "blob"})
                .then(res => {
                    console.log(res);
                    let url = URL.createObjectURL(res.data);
                    console.log(url);
                    setOpen(true);
                    setImageURL(url);
                });
        } catch (e) {
            console.log(e);
        }
        setLoaded(false);
    }

    function createTableBody() {
        let rows = [];
        for (let i = 0; i < ehrsDetail.length; i++) {
            rows.push(<TableRow key={i}>
                <TableCell>{ehrsDetail[i].ehrId}</TableCell>
                <TableCell>{ehrsDetail[i].time}</TableCell>
                <TableCell>{localStorage.getItem(ehrsDetail[i].doctorId)}</TableCell>
                <TableCell>{localStorage.getItem(ehrsDetail[i].hospitalId)}</TableCell>
                <TableCell align="right"><Button name={i} onClick={() => displayEHR(ehrsDetail[i])}
                                                 variant="contained"
                                                 component="label"
                                                 fullWidth
                                                 color="primary">{'click here'}
                </Button>
                </TableCell>
            </TableRow>);
        }
        console.log(rows);
        return rows;
    }

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <React.Fragment>
            <Title>{updatedData.firstName} {updatedData.lastName} EHRs</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell style={{fontWeight: 'bold'}}>Document Id</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Date</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Doctor Name</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Hospital Name</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>View Document</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {createTableBody()}
                </TableBody>
            </Table>
            <SimpleDialog imageURL={imageURL} open={open} onClose={handleClose}/>
            <SpinnerDialog open={loaded}/>
        </React.Fragment>
    );
}