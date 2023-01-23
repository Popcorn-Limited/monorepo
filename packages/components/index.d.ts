declare global {
  interface window {
    ethereum: any;
  }
}

window.ethereum = window.ethereum || {};
