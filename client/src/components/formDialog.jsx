import React from 'react';

// import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
// import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import PropTypes from 'prop-types';


export default class FormDialog extends React.Component {

    constructor(props) {
        super(props);
        let valueLength = 1;
        if (this.props.inputProp2) {
            valueLength = 2;
            if (this.props.inputProp3) {
                valueLength = 3;
            }
        }

        this.state = {
            open: false,
            values: new Array(valueLength)
        };
    }

    handleClickOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    handleChange = (event, i) => {
        const values = this.state.values;
        values[i] = event.target.value;
        this.setState({values});
        console.log("values: ", this.state.values);
    };

    handleSubmit = async () => {
        // await buildingActions.createBuilding(this.state.name);
        console.log("values", this.state.values);
        this.props.onSubmit(this.state.values);
        this.handleClose();
    };

    createInputField = (i) => {

        let inputFields;
        switch (i) {
            case 1:
                inputFields = this.props.inputProp2;
                break;
            case 2:
                inputFields = this.props.inputProp3;
                break;
            default:
                inputFields = this.props.inputProp1;
        }

        return <React.Fragment>
            <DialogContentText className={i !== 0 ? "mt-5" : ""}>
                {inputFields.description}
            </DialogContentText>
            <TextField
              autoFocus={i === 0}
              margin="dense"
              id={inputFields.id}
              label={inputFields.fieldDescription}
              type="name"
              onChange={event => this.handleChange(event, i)}
              fullWidth
            />
        </React.Fragment>;


    };

    render() {
        const {title, dropDown, inputProp2, inputProp3} = this.props;

        return (
          <div>
              <input
                className={dropDown ? "btn btn-outline-success btn-block mt-2" : "btn btn-outline-success mt-3 btn-block"}
                type="submit" onClick={this.handleClickOpen}
                value={title}/>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
              >
                  <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                  <DialogContent>
                      {/*<DialogContentText>
                          {description}
                      </DialogContentText>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={fieldDescription}
                        type="name"
                        onChange={this.handleChange}
                        fullWidth
                      />*/}
                      {this.createInputField(0)}
                      {inputProp2 && this.createInputField(1)}
                      {inputProp3 && this.createInputField(2)}


                  </DialogContent>
                  <DialogActions>
                      <Button onClick={this.handleClose} color="primary">
                          Cancel
                      </Button>
                      <Button onClick={this.handleSubmit} color="primary">
                          Create
                      </Button>
                  </DialogActions>
              </Dialog>
          </div>
        );
    }


}

FormDialog.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    inputProp1: PropTypes.shape({
        description: PropTypes.string.isRequired,
        fieldDescription: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired
    }).isRequired,
    inputProp2: PropTypes.shape({
        description: PropTypes.string.isRequired,
        fieldDescription: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired
    }),
    inputProp3: PropTypes.shape({
        description: PropTypes.string.isRequired,
        fieldDescription: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired
    })
};

FormDialog.defaultProps = {
    description: "",
    fieldDescription: "Name"
};
