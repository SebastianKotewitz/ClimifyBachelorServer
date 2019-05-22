import React from 'react';
import PropTypes from 'prop-types';

const Modal = props => {
    const {feedback, id} = props;


    const questions = new Set();
    const users = new Set();

    for (let i = 0; i < feedback.length; i++) {
        questions.add(feedback[i].question);
        users.add(feedback[i].user);
    }

    return (
      <div>
          <div className="modal fade" id={id} tabIndex="-1" role="dialog" aria-labelledby={id + "Label"}
               aria-hidden="true">

              <div className="modal-dialog modal-dialog-centered" role="document">

                  <div className="modal-content">
                      <div className="modal-header">
                          <h5 className="modal-title" id={id + "Label"}>{props.title}</h5>
                          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div className="modal-body">
                          <p>Feedback given: {feedback.length}</p>
                          <p>Users answered: {users.size}</p>
                          <p>Different questions answered: {questions.size}</p>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                          <a download="feedback.json"
                             href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(feedback))}
                             id="exportJSON" className="btn btn-primary">
                              Download Feedback
                          </a>
                          {/*<button type="button" className="btn btn-primary">
                              {props.okButtonText}
                              <span className="spinner-border spinner-border-sm" role="status"
                                    aria-hidden="true"/>
                              <span className="sr-only">Loading...</span>
                          </button>*/}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
};

Modal.propTypes = {
    body: PropTypes.string.isRequired,
    okButtonText: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export default Modal;
