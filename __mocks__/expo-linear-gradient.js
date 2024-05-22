import React from 'react';
import PropTypes from 'prop-types';

export const LinearGradient = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

LinearGradient.propTypes = {
  children: PropTypes.node,
};
