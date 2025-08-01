import React, { FC } from 'react';

export interface GaxonIconProps {
  name: string
  [x: string]: any
}

const GaxonIcon: FC<GaxonIconProps> = (props: GaxonIconProps) => {
  const { name, ...restProps } = props;
    return (
      <React.Fragment>
        <i className={`icon icon-${name}`} {...restProps} />
      </React.Fragment>
    )
};

export default GaxonIcon;
