import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

function App() {
  return (
    <div>
      <p>Hello World</p>
      <button onClick={() => view.close()}>Close</button>
    </div>
  );
}

export default App;
