import React from 'react';
import PropTypes from 'prop-types';

const Question = props => {
    const {questionKey, active, onChange, value, answerOptions, timesAnswered, feedback} = props;
    const items = [];
    console.log("answerOptions", answerOptions);
    if (answerOptions)
        for (let i = 0; i < answerOptions.length; i++) {
            items.push(<div key={i} className="list-group-item d-flex justify-content-between">
                  <p  className="mt-0 mb-0 ">{answerOptions[i].value}</p>
                <span className="badge badge-primary mt-1 mb-1">{0}</span>
              </div>
            )
        }

    return (
      <li key={questionKey} className="list-group-item flex-column align-items-start">
          <div className="d-flex w-100 justify-content-between">
              <h5>{value}</h5>

              <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" checked={active}
                         onChange={onChange} id={questionKey}/>
                  <label className="custom-control-label" htmlFor={questionKey}>
                      {active ? "Active" : "Inactive"}
                  </label>
              </div>

          </div>
          <div className="list-group">
              {items}
          </div>
      </li>
    );
};

Question.propTypes = {
    questionKey: PropTypes.string.isRequired,
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    answerOptions: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string})).isRequired,
    timesAnswered: PropTypes.number.isRequired
};

Question.defaultProps = {
    active: false
};

export default Question;
