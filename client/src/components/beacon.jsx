import React from 'react';
import PropTypes from 'prop-types';

const Beacon = props => {
    const {onDelete, uuid, name} = props;
    return (
      <div className="list-group-item">
          <div className="d-flex justify-content-between">
              <div>
                  <h5>{name}</h5>
                  <p>UUID: {uuid}</p>
              </div>
              <button onClick={onDelete} className="mt-2 mb-2 btn bg-light"><i
                className="fa fa-trash-o" aria-hidden="true"/></button>
          </div>
      </div>
    );
};

Beacon.propTypes = {
    onDelete: PropTypes.func.isRequired,
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
};

export default Beacon;
