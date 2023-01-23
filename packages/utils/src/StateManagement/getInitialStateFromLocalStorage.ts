export const getInitialStateFromLocalStorage = <T>(storename: string, initialState: T): T => {
  let localState: string;
  let parsedLocalState: T;

  if (typeof window !== 'undefined') {
    localState = localStorage.getItem(storename);
    try {
      if (localState) parsedLocalState = JSON.parse(localState);
    } catch (err) {
      console.error('error parsing localstate');
    }
  }
  return { ...initialState, ...parsedLocalState };
};

export default getInitialStateFromLocalStorage;
