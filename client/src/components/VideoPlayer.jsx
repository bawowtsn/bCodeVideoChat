import React, { useContext } from 'react';

import { Grid, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SocketContext } from '../SocketContext';

const useStyles = makeStyles((theme) => ({
    video: {
        width: '550px',

        [theme.breakpoints.down('xs')]: {
            width: '300px',
        },
    },
    
    gridContainer: {
        justifyContent: 'center',
        //the following code specifies the width on mobile devices
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },

    paper: {
        padding: '10px',
        border: '2px solid black',
        margin: '10px',
    },
}));

const VideoPlayer = () => {
   const {name, callAccepted, myVideo, userVideo, callEnded, stream, call} = useContext(SocketContext);

    const classes = useStyles();

    return (
        <div>
            <Grid container className={classes.gridContainer}>
                
                {/* Setup my video*/}
                {
                    stream && (
                        <Paper className={classes.paper}>

                            {/* the code below makes a grid of type item and sets the screen width to full or 12 spaces for mobile 'xs' devices and half or 6 spaces for medium 'md' or larger devices, total grid space is 12*/}
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="h5" gutterBottom>{name || 'name'}</Typography>
                                <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
                            </Grid>
                        </Paper>                  
                    )
                }

                {/* Setup user video*/}

                {
                    callAccepted && !callEnded && (

                        <Paper className={classes.paper}>

                            {/* the code below makes a grid of type item and sets the screen width to full or 12 spaces for mobile 'xs' devices and half or 6 spaces for medium 'md' or larger devices, total grid space is 12*/}
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="h5" gutterBottom>{call.name || 'callerName'}</Typography>
                                <video playsInline muted ref={userVideo} autoPlay className={classes.video} />
                            </Grid>

                        </Paper>
                    )
                }
            </Grid>
        </div>
    );
}

export default VideoPlayer
