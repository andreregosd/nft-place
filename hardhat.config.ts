import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
          version: "0.8.19",
      },
      {
          version: "0.8.20",
      },
    ],
  }
};

export default config;
