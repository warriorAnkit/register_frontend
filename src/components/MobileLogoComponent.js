import React from 'react';

function MobileLogoComponent(props) {
  const { className } = props;
  return <img alt="logo" className={className} src="/logo.png" />;
}
export default MobileLogoComponent;
