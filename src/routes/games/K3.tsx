import React, { useEffect } from 'react';
import K3Game from '@src/components/games/K3Game';

const K3 = (props: any) => {
  useEffect(() => {
    console.log('K3 component mounted with props:', props);
  }, []);

  return <K3Game {...props} />;
};

export default K3; 