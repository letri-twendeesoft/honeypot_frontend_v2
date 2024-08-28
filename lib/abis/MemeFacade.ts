export const MemeFacadeABI = {
  _format: "hh-sol-artifact-1",
  contractName: "MemeFacade",
  sourceName: "contracts/MemeFacade.sol",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_factory",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "target",
          type: "address",
        },
      ],
      name: "AddressEmptyCode",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "AddressInsufficientBalance",
      type: "error",
    },
    {
      inputs: [],
      name: "FactoryAddressIsZero",
      type: "error",
    },
    {
      inputs: [],
      name: "FailedInnerCall",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
      ],
      name: "IdenticalAddress",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidRaisedTokenAmount",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
      ],
      name: "SafeERC20FailedOperation",
      type: "error",
    },
    {
      inputs: [],
      name: "TokenAddressIsZero",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "raisedToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
      ],
      name: "claimLP",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "raisedToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
      ],
      name: "claimableLP",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "raisedToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "raisedTokenAmount",
          type: "uint256",
        },
      ],
      name: "deposit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "factory",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "raisedToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
      ],
      name: "getPair",
      outputs: [
        {
          internalType: "address",
          name: "pair",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "raisedToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
      ],
      name: "getPairState",
      outputs: [
        {
          internalType: "uint256",
          name: "state",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "raisedToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "memeToken",
          type: "address",
        },
      ],
      name: "getPairTokenDeployer",
      outputs: [
        {
          internalType: "address",
          name: "tokenDeployer",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  bytecode:
    "0x60a060405234801561001057600080fd5b50604051610a50380380610a5083398101604081905261002f91610067565b6001600160a01b0381166100565760405163668ab66b60e11b815260040160405180910390fd5b6001600160a01b0316608052610097565b60006020828403121561007957600080fd5b81516001600160a01b038116811461009057600080fd5b9392505050565b6080516109746100dc6000396000818161010001528181610150015281816101f1015281816102b40152818161035f015281816103f0015261047e01526109746000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063ad32eee41161005b578063ad32eee4146100d0578063c45a0155146100fb578063cddfafa714610122578063e6a439051461013557600080fd5b80633ced6184146100825780635e862391146100a85780638340f549146100bb575b600080fd5b610095610090366004610806565b610148565b6040519081526020015b60405180910390f35b6100956100b6366004610806565b6101e9565b6100ce6100c936600461083f565b61028c565b005b6100e36100de366004610806565b610357565b6040516001600160a01b03909116815260200161009f565b6100e37f000000000000000000000000000000000000000000000000000000000000000081565b6100ce610130366004610806565b6103e9565b6100e3610143366004610806565b610477565b6000806101767f000000000000000000000000000000000000000000000000000000000000000085856104ab565b604051637a4acc1d60e11b81523360048201529091506001600160a01b0382169063f495983a90602401602060405180830381865afa1580156101bd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e19190610880565b949350505050565b6000806102177f000000000000000000000000000000000000000000000000000000000000000085856104ab565b9050806001600160a01b031663018fd62f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610257573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061027b9190610899565b60038111156101e1576101e16108ba565b806000036102ad57604051631a59df2760e01b815260040160405180910390fd5b60006102da7f000000000000000000000000000000000000000000000000000000000000000085856104ab565b90506102f16001600160a01b038516338385610584565b6040516329f9a87d60e01b8152336004820152602481018390526001600160a01b038216906329f9a87d90604401600060405180830381600087803b15801561033957600080fd5b505af115801561034d573d6000803e3d6000fd5b5050505050505050565b6000806103857f000000000000000000000000000000000000000000000000000000000000000085856104ab565b9050806001600160a01b0316632a2dae0a6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e191906108d0565b60006104167f000000000000000000000000000000000000000000000000000000000000000084846104ab565b60405163e8bbb75b60e01b81523360048201529091506001600160a01b0382169063e8bbb75b90602401600060405180830381600087803b15801561045a57600080fd5b505af115801561046e573d6000803e3d6000fd5b50505050505050565b60006104a47f000000000000000000000000000000000000000000000000000000000000000084846104ab565b9392505050565b60008060006104ba85856105e4565b6040516bffffffffffffffffffffffff19606084811b8216602084015283901b16603482015291935091508690604801604051602081830303815290604052805190602001206040516020016105629291906001600160f81b0319815260609290921b6bffffffffffffffffffffffff1916600183015260158201527f41abb41cf4161b22c8ba93b337e89c466e89d150bb30dd72df68d30c7c33d946603582015260550190565b60408051601f1981840301815291905280516020909101209695505050505050565b604080516001600160a01b0385811660248301528416604482015260648082018490528251808303909101815260849091019091526020810180516001600160e01b03166323b872dd60e01b1790526105de90859061067f565b50505050565b600080826001600160a01b0316846001600160a01b031603610629576040516336981fd360e11b81526001600160a01b03841660048201526024015b60405180910390fd5b826001600160a01b0316846001600160a01b03161061064957828461064c565b83835b90925090506001600160a01b0382166106785760405163dc2e5e8d60e01b815260040160405180910390fd5b9250929050565b60006106946001600160a01b038416836106e7565b905080516000141580156106b95750808060200190518101906106b791906108ed565b155b156106e257604051635274afe760e01b81526001600160a01b0384166004820152602401610620565b505050565b60606104a48383600084600080856001600160a01b0316848660405161070d919061090f565b60006040518083038185875af1925050503d806000811461074a576040519150601f19603f3d011682016040523d82523d6000602084013e61074f565b606091505b509150915061075f868383610769565b9695505050505050565b60608261077e57610779826107c5565b6104a4565b815115801561079557506001600160a01b0384163b155b156107be57604051639996b31560e01b81526001600160a01b0385166004820152602401610620565b50806104a4565b8051156107d55780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b50565b6001600160a01b03811681146107ee57600080fd5b6000806040838503121561081957600080fd5b8235610824816107f1565b91506020830135610834816107f1565b809150509250929050565b60008060006060848603121561085457600080fd5b833561085f816107f1565b9250602084013561086f816107f1565b929592945050506040919091013590565b60006020828403121561089257600080fd5b5051919050565b6000602082840312156108ab57600080fd5b8151600481106104a457600080fd5b634e487b7160e01b600052602160045260246000fd5b6000602082840312156108e257600080fd5b81516104a4816107f1565b6000602082840312156108ff57600080fd5b815180151581146104a457600080fd5b6000825160005b818110156109305760208186018101518583015201610916565b50600092019182525091905056fea26469706673582212202b2fe81f1920dbef351c411f3110bdf9d847a1b68e137ee34d61f77d205747b664736f6c63430008180033",
  deployedBytecode:
    "0x608060405234801561001057600080fd5b506004361061007d5760003560e01c8063ad32eee41161005b578063ad32eee4146100d0578063c45a0155146100fb578063cddfafa714610122578063e6a439051461013557600080fd5b80633ced6184146100825780635e862391146100a85780638340f549146100bb575b600080fd5b610095610090366004610806565b610148565b6040519081526020015b60405180910390f35b6100956100b6366004610806565b6101e9565b6100ce6100c936600461083f565b61028c565b005b6100e36100de366004610806565b610357565b6040516001600160a01b03909116815260200161009f565b6100e37f000000000000000000000000000000000000000000000000000000000000000081565b6100ce610130366004610806565b6103e9565b6100e3610143366004610806565b610477565b6000806101767f000000000000000000000000000000000000000000000000000000000000000085856104ab565b604051637a4acc1d60e11b81523360048201529091506001600160a01b0382169063f495983a90602401602060405180830381865afa1580156101bd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e19190610880565b949350505050565b6000806102177f000000000000000000000000000000000000000000000000000000000000000085856104ab565b9050806001600160a01b031663018fd62f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610257573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061027b9190610899565b60038111156101e1576101e16108ba565b806000036102ad57604051631a59df2760e01b815260040160405180910390fd5b60006102da7f000000000000000000000000000000000000000000000000000000000000000085856104ab565b90506102f16001600160a01b038516338385610584565b6040516329f9a87d60e01b8152336004820152602481018390526001600160a01b038216906329f9a87d90604401600060405180830381600087803b15801561033957600080fd5b505af115801561034d573d6000803e3d6000fd5b5050505050505050565b6000806103857f000000000000000000000000000000000000000000000000000000000000000085856104ab565b9050806001600160a01b0316632a2dae0a6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e191906108d0565b60006104167f000000000000000000000000000000000000000000000000000000000000000084846104ab565b60405163e8bbb75b60e01b81523360048201529091506001600160a01b0382169063e8bbb75b90602401600060405180830381600087803b15801561045a57600080fd5b505af115801561046e573d6000803e3d6000fd5b50505050505050565b60006104a47f000000000000000000000000000000000000000000000000000000000000000084846104ab565b9392505050565b60008060006104ba85856105e4565b6040516bffffffffffffffffffffffff19606084811b8216602084015283901b16603482015291935091508690604801604051602081830303815290604052805190602001206040516020016105629291906001600160f81b0319815260609290921b6bffffffffffffffffffffffff1916600183015260158201527f41abb41cf4161b22c8ba93b337e89c466e89d150bb30dd72df68d30c7c33d946603582015260550190565b60408051601f1981840301815291905280516020909101209695505050505050565b604080516001600160a01b0385811660248301528416604482015260648082018490528251808303909101815260849091019091526020810180516001600160e01b03166323b872dd60e01b1790526105de90859061067f565b50505050565b600080826001600160a01b0316846001600160a01b031603610629576040516336981fd360e11b81526001600160a01b03841660048201526024015b60405180910390fd5b826001600160a01b0316846001600160a01b03161061064957828461064c565b83835b90925090506001600160a01b0382166106785760405163dc2e5e8d60e01b815260040160405180910390fd5b9250929050565b60006106946001600160a01b038416836106e7565b905080516000141580156106b95750808060200190518101906106b791906108ed565b155b156106e257604051635274afe760e01b81526001600160a01b0384166004820152602401610620565b505050565b60606104a48383600084600080856001600160a01b0316848660405161070d919061090f565b60006040518083038185875af1925050503d806000811461074a576040519150601f19603f3d011682016040523d82523d6000602084013e61074f565b606091505b509150915061075f868383610769565b9695505050505050565b60608261077e57610779826107c5565b6104a4565b815115801561079557506001600160a01b0384163b155b156107be57604051639996b31560e01b81526001600160a01b0385166004820152602401610620565b50806104a4565b8051156107d55780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b50565b6001600160a01b03811681146107ee57600080fd5b6000806040838503121561081957600080fd5b8235610824816107f1565b91506020830135610834816107f1565b809150509250929050565b60008060006060848603121561085457600080fd5b833561085f816107f1565b9250602084013561086f816107f1565b929592945050506040919091013590565b60006020828403121561089257600080fd5b5051919050565b6000602082840312156108ab57600080fd5b8151600481106104a457600080fd5b634e487b7160e01b600052602160045260246000fd5b6000602082840312156108e257600080fd5b81516104a4816107f1565b6000602082840312156108ff57600080fd5b815180151581146104a457600080fd5b6000825160005b818110156109305760208186018101518583015201610916565b50600092019182525091905056fea26469706673582212202b2fe81f1920dbef351c411f3110bdf9d847a1b68e137ee34d61f77d205747b664736f6c63430008180033",
  linkReferences: {},
  deployedLinkReferences: {},
} as const;
