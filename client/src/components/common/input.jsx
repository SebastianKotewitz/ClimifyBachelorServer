import React from 'react';
import PropTypes from 'prop-types';

const Input = ({value, label, onChange, name, password, focus}) => {
    return (
      <div className="form-group">
          <input name={name}
                 autoFocus={focus}
                 type={password ? "password" : "text"}
                 value={value} className="form-control"
                 placeholder={label}
                 onChange={onChange}
          />
      </div>
    );
};

Input.propTypes = {
    value: PropTypes.string,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    password: PropTypes.bool,
    focus: PropTypes.bool
};

export default Input;
